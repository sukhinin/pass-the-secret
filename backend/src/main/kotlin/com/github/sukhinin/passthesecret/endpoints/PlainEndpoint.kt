package com.github.sukhinin.passthesecret.endpoints

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.github.sukhinin.passthesecret.api.HttpException
import com.github.sukhinin.passthesecret.api.NamedParam
import com.github.sukhinin.passthesecret.datastore.DataStore
import com.github.sukhinin.passthesecret.crypto.CryptoUtils
import org.eclipse.jetty.http.HttpStatus
import java.time.Duration
import java.time.Instant
import java.util.*

class PlainEndpoint(private val dataStore: DataStore) {

    private val iv = ByteArray(16)
    private val mapper = ObjectMapper()

    fun put(body: ObjectNode): ObjectNode {
        val days = NamedParam.fromJson(body, "days")
            .convert("must be an integer") { it.asText().toLong() }
            .validate("must be in range 1..7") { it in 1..7 }
            .get()
        val data = NamedParam.fromJson(body, "data")
            .convert("must be a base64-encoded string") { mapper.treeToValue(it, ByteArray::class.java) }
            .get()

        val key = CryptoUtils.getRandomBytes(32)
        val encrypted = CryptoUtils.encrypt(key, iv, data)

        val expires = Instant.now() + Duration.ofDays(days)
        val id = dataStore.create(encrypted, expires)

        val response = mapper.createObjectNode()
        response.set<JsonNode>("id", mapper.valueToTree(id))
        response.set<JsonNode>("key", mapper.valueToTree(key))
        return response
    }

    fun get(body: ObjectNode): ObjectNode {
        val id = NamedParam.fromJson(body, "id")
            .convert("must be a valid UUID") { mapper.treeToValue(it, UUID::class.java) }
            .get()
        val key = NamedParam.fromJson(body, "key")
            .convert("must be a base64-encoded string") { mapper.treeToValue(it, ByteArray::class.java) }
            .validate("binary data must be be 256-bit long") { it.size == 32 }
            .get()

        val encrypted = dataStore.findAndDelete(id) ?: throw HttpException(HttpStatus.Code.NOT_FOUND)
        val data = CryptoUtils.decrypt(key, iv, encrypted)

        val response = mapper.createObjectNode()
        response.set<JsonNode>("data", mapper.valueToTree(data))
        return response
    }
}
