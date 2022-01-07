package com.github.sukhinin.passthesecret.api

import org.eclipse.jetty.http.HttpStatus

class HttpException(val status: Int, message: String): RuntimeException(message) {
    companion object {
        operator fun invoke(status: HttpStatus.Code) = HttpException(status.code, status.message)
    }
}
