package com.github.sukhinin.passthesecret.api

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.SerializationFeature
import com.fasterxml.jackson.databind.node.ObjectNode
import com.github.sukhinin.passthesecret.io.BoundedInputStream
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse
import org.eclipse.jetty.http.HttpMethod
import org.eclipse.jetty.http.HttpStatus
import org.eclipse.jetty.http.MimeTypes
import org.eclipse.jetty.server.Request
import org.eclipse.jetty.server.handler.AbstractHandler
import org.slf4j.LoggerFactory

class RequestHandler(private val maxBodySize: Long = 102400) : AbstractHandler() {

    private val logger = LoggerFactory.getLogger(RequestHandler::class.java)
    private val mapper = ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT)
    private val endpoints = HashMap<String, Endpoint>()

    override fun handle(target: String, baseRequest: Request, request: HttpServletRequest, response: HttpServletResponse) {
        when (baseRequest.method) {
            HttpMethod.POST.asString() -> handlePostRequest(baseRequest, response)
            else -> handleUnsupportedMethod(baseRequest, response)
        }
    }

    private fun handlePostRequest(request: Request, response: HttpServletResponse) {
        try {
            doHandlePostRequest(request, response)
        } catch (e: HttpException) {
            handleHttpException(request, response, e)
        } catch (e: Exception) {
            handleGenericException(request, response, e)
        }
    }

    private fun doHandlePostRequest(request: Request, response: HttpServletResponse) {
        val endpoint = endpoints[request.pathInfo.trim('/')] ?: throw HttpException(HttpStatus.Code.NOT_FOUND)
        val inputStream = BoundedInputStream(request.inputStream, maxBodySize)
        val body = runCatching { mapper.readTree(inputStream) as ObjectNode }
            .onFailure { throw HttpException(HttpStatus.Code.BAD_REQUEST) }
            .getOrThrow()
        val json = endpoint.handle(body).deepCopy()

        request.isHandled = true
        response.status = HttpStatus.OK_200
        response.contentType = MimeTypes.Type.APPLICATION_JSON.asString()

        json.put("success", true)
        mapper.writeValue(response.writer, json)
    }

    private fun handleHttpException(request: Request, response: HttpServletResponse, e: HttpException) {
        request.isHandled = true
        response.status = e.status
        response.contentType = MimeTypes.Type.APPLICATION_JSON.asString()

        val json = mapper.createObjectNode()
        json.put("success", false)
        json.put("error", e.message)
        mapper.writeValue(response.writer, json)
    }

    private fun handleGenericException(request: Request, response: HttpServletResponse, e: Exception) {
        logger.error("Error handling API call to ${request.pathInfo}", e)

        request.isHandled = true
        response.status = HttpStatus.Code.INTERNAL_SERVER_ERROR.code
        response.contentType = MimeTypes.Type.APPLICATION_JSON.asString()

        val json = mapper.createObjectNode()
        json.put("success", false)
        json.put("error", HttpStatus.Code.INTERNAL_SERVER_ERROR.message)
        mapper.writeValue(response.writer, json)
    }

    private fun handleUnsupportedMethod(request: Request, response: HttpServletResponse) {
        request.isHandled = true
        response.status = HttpStatus.Code.METHOD_NOT_ALLOWED.code
    }

    fun registerEndpoint(path: String, endpoint: Endpoint) {
        endpoints[path.trim('/')] = endpoint
    }
}
