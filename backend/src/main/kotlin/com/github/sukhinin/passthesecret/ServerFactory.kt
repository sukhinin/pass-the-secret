package com.github.sukhinin.passthesecret

import com.github.sukhinin.simpleconfig.Config
import com.github.sukhinin.simpleconfig.getInteger
import com.github.sukhinin.simpleconfig.getOrDefault
import org.eclipse.jetty.http.HttpVersion
import org.eclipse.jetty.server.*
import org.eclipse.jetty.util.ssl.SslContextFactory

object ServerFactory {
    fun create(config: Config): Server {
        val port = config.getInteger("port")
        val keyStorePath = config.getOrDefault("ssl.keystore.path", "")
        val keyStorePassword = config.getOrDefault("ssl.keystore.password", "")

        val server = Server()
        val connector = when (keyStorePath.isEmpty()) {
            true -> createPlainConnector(server)
            else -> createSslConnector(server, keyStorePath, keyStorePassword)
        }
        connector.port = port
        server.addConnector(connector)

        return server
    }

    private fun createPlainConnector(server: Server): ServerConnector {
        val http11 = createHttpConnectionFactory()
        return ServerConnector(server, http11)
    }

    private fun createSslConnector(server: Server, keyStorePath: String, keyStorePassword: String): ServerConnector {
        val http11 = createHttpConnectionFactory()
        val tls = createSslConnectionFactory(keyStorePath, keyStorePassword)
        return ServerConnector(server, tls, http11)
    }

    private fun createHttpConnectionFactory(): ConnectionFactory {
        val httpConfiguration = HttpConfiguration()
        httpConfiguration.sendServerVersion = false
        return HttpConnectionFactory(httpConfiguration)
    }

    private fun createSslConnectionFactory(keyStorePath: String, keyStorePassword: String): ConnectionFactory {
        val sslContextFactory = SslContextFactory.Server()
        sslContextFactory.keyStorePath = keyStorePath
        sslContextFactory.setKeyStorePassword(keyStorePassword)
        return SslConnectionFactory(sslContextFactory, HttpVersion.HTTP_1_1.asString())
    }
}
