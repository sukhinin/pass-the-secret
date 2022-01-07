package com.github.sukhinin.passthesecret.endpoints

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import com.github.sukhinin.passthesecret.api.HttpException
import com.github.sukhinin.passthesecret.api.NamedParam
import com.github.sukhinin.passthesecret.datastore.DataStore
import org.eclipse.jetty.http.HttpStatus
import java.time.Duration
import java.time.Instant
import java.util.*

class EncryptedEndpoint(private val dataStore: DataStore) {

    private val mapper = ObjectMapper()

    fun put(body: ObjectNode): ObjectNode {
        val days = NamedParam.fromJson(body, "days")
            .convert("must be an integer") { it.asText().toLong() }
            .validate("must be in range 1..7") { it in 1..7 }
            .get()
        val data = NamedParam.fromJson(body, "data")
            .convert("must be a base64-encoded string") { mapper.treeToValue(it, ByteArray::class.java) }
            .get()

        val expires = Instant.now() + Duration.ofDays(days)
        val id = dataStore.create(data, expires)

        val response = mapper.createObjectNode()
        response.set<JsonNode>("id", mapper.valueToTree(id))
        return response
    }

    fun get(body: ObjectNode): ObjectNode {
        val id = NamedParam.fromJson(body, "id")
            .convert("must be a valid UUID") { mapper.treeToValue(it, UUID::class.java) }
            .get()

        val data = dataStore.findAndDelete(id) ?: throw HttpException(HttpStatus.Code.NOT_FOUND)

        val response = mapper.createObjectNode()
        response.set<JsonNode>("data", mapper.valueToTree(data))
        return response
    }
}
