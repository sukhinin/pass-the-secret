package com.github.sukhinin.passthesecret.api

import com.fasterxml.jackson.databind.node.ObjectNode

fun interface Endpoint {
    fun handle(body: ObjectNode): ObjectNode
}
