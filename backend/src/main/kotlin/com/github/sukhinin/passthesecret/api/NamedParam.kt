package com.github.sukhinin.passthesecret.api

import com.fasterxml.jackson.databind.JsonNode
import org.eclipse.jetty.http.HttpStatus
import java.util.function.Predicate

class NamedParam<T> private constructor(private val value: T, private val name: String) {

    companion object {
        fun fromJson(json: JsonNode, path: String): NamedParam<JsonNode> {
            val fields = path.split('.')
            val node = fields.fold<String, JsonNode?>(json) { node, field -> node?.get(field) }
                ?: throw HttpException(HttpStatus.Code.BAD_REQUEST.code, "Parameter [$path] is missing")
            return NamedParam(node, path)
        }
    }

    fun <R> convert(error: String, converter: (T) -> R): NamedParam<R> {
        try {
            val converted = converter.invoke(value)
            return NamedParam(converted, name)
        } catch (e: Exception) {
            val message = "Parameter [$name] is invalid: $error"
            throw HttpException(HttpStatus.Code.BAD_REQUEST.code, message)
        }
    }

    fun validate(error: String, validator: Predicate<T>): NamedParam<T> {
        if (!validator.test(value)) {
            val message = "Parameter [$name] is invalid: $error"
            throw HttpException(HttpStatus.Code.BAD_REQUEST.code, message)
        }
        return this
    }

    fun get(): T {
        return value
    }
}
