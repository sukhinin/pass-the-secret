package com.github.sukhinin.passthesecret

import com.github.sukhinin.passthesecret.api.HttpException
import com.github.sukhinin.passthesecret.api.RequestHandler
import com.github.sukhinin.passthesecret.datastore.DataStore
import com.github.sukhinin.passthesecret.datastore.JdbiDataStoreFactory
import com.github.sukhinin.passthesecret.datastore.MemoryDataStoreFactory
import com.github.sukhinin.passthesecret.endpoints.EncryptedEndpoint
import com.github.sukhinin.passthesecret.endpoints.PlainEndpoint
import com.github.sukhinin.simpleconfig.*
import org.eclipse.jetty.http.HttpStatus
import org.eclipse.jetty.server.CustomRequestLog
import org.eclipse.jetty.server.Handler
import org.eclipse.jetty.server.RequestLog
import org.eclipse.jetty.server.handler.ContextHandler
import org.eclipse.jetty.server.handler.HandlerList
import org.eclipse.jetty.server.handler.ResourceHandler
import org.eclipse.jetty.util.resource.Resource
import org.slf4j.LoggerFactory
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import kotlin.system.exitProcess

object Application {

    private val logger = LoggerFactory.getLogger(Application::class.java)
    private val executor = Executors.newSingleThreadScheduledExecutor()

    @JvmStatic
    fun main(args: Array<String>) {
        val version = Application::class.java.getPackage().implementationVersion ?: "UNKNOWN"
        logger.info("Pass-the-Secret version $version")

        if (args.size != 1) {
            logger.error("Application requires a single command line argument: path to configuration file")
            exitProcess(1)
        }
        val config = getApplicationConfig(args[0])

        val dataStore = createDataStore(config)

        val handlers = HandlerList()
        handlers.addHandler(createApiRequestHandler(config, dataStore))
        handlers.addHandler(createStaticResourceHandler())

        val server = ServerFactory.create(config.scoped("server"))
        server.requestLog = createRequestLog(config)
        server.handler = handlers
        server.start()
    }

    private fun createDataStore(config: Config): DataStore {
        val dataStoreConfig = config.scoped("datastore")
        val dataStore = when (val type = config.get("datastore")) {
            "sqlite" -> JdbiDataStoreFactory.create(dataStoreConfig)
            "memory" -> MemoryDataStoreFactory.create()
            else -> throw RuntimeException("Unsupported datastore type: $type")
        }
        executor.scheduleAtFixedRate({ cleanupExpiredSecrets(dataStore) }, 0, 30, TimeUnit.MINUTES)
        return dataStore
    }

    private fun createStaticResourceHandler(): Handler {
        val resourceHandler = ResourceHandler()
        resourceHandler.isDirAllowed = false
        resourceHandler.baseResource = Resource.newClassPathResource("/static")
        return resourceHandler
    }

    private fun createApiRequestHandler(config: Config, dataStore: DataStore): Handler {
        val requestHandler = RequestHandler()

        if (config.getBooleanOrDefault("backend.crypto.enabled", false)) {
            logger.info("Backend crypto support is enabled")
            val plainEndpoint = PlainEndpoint(dataStore)
            requestHandler.registerEndpoint("/plain/put", plainEndpoint::put)
            requestHandler.registerEndpoint("/plain/get", plainEndpoint::get)
        } else {
            val status = HttpStatus.Code.FORBIDDEN
            val message = "Disabled by administrator"
            logger.info("Backend crypto support is disabled, will respond with ${status.code} ${status.message}")
            requestHandler.registerEndpoint("/plain/put") { throw HttpException(status.code, message) }
            requestHandler.registerEndpoint("/plain/get") { throw HttpException(status.code, message) }
        }

        val encryptedEndpoint = EncryptedEndpoint(dataStore)
        requestHandler.registerEndpoint("/encrypted/put", encryptedEndpoint::put)
        requestHandler.registerEndpoint("/encrypted/get", encryptedEndpoint::get)

        val context = ContextHandler()
        context.contextPath = "/api"
        context.handler = requestHandler

        return context
    }

    private fun createRequestLog(config: Config): RequestLog? {
        if (!config.contains("access.log")) {
            return null
        }
        val path = config.get("access.log").trim()
        return when (path.isEmpty()) {
            true -> CustomRequestLog()
            else -> CustomRequestLog(path)
        }
    }

    private fun getApplicationConfig(path: String): Config {
        val systemPropertiesConfig = ConfigLoader.getConfigFromSystemProperties("app")
        val applicationConfig = ConfigLoader.getConfigFromPath(path)

        val config = systemPropertiesConfig
            .withFallback(applicationConfig)
            .resolved()
        logger.info("Loaded configuration:\n\t" + config.masked().dump().replace("\n", "\n\t"))

        return config
    }

    private fun cleanupExpiredSecrets(dataStore: DataStore) {
        try {
            val count = dataStore.cleanupExpired()
            logger.info("Removed $count expired secrets from datastore")
        } catch (e: Exception) {
            logger.error("Error removing expired secrets from datastore", e)
        }
    }
}
