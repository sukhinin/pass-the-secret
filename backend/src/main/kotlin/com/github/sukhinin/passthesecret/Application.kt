package com.github.sukhinin.passthesecret

import com.github.sukhinin.passthesecret.api.RequestHandler
import com.github.sukhinin.passthesecret.datastore.DataStore
import com.github.sukhinin.passthesecret.datastore.JdbiDataStoreFactory
import com.github.sukhinin.passthesecret.endpoints.PlainEndpoint
import com.github.sukhinin.passthesecret.endpoints.EncryptedEndpoint
import com.github.sukhinin.simpleconfig.*
import org.eclipse.jetty.server.Handler
import org.eclipse.jetty.server.handler.*
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
        if (args.size != 1) {
            logger.error("Application requires a single command line argument: path to configuration file")
            exitProcess(1)
        }

        val config = getApplicationConfig(args[0])

        val dataStore = createDataStore(config)

        val handlers = HandlerList()
        handlers.addHandler(createApiRequestHandler(dataStore))
        handlers.addHandler(createStaticResourceHandler())

        val server = ServerFactory.create(config.scoped("server"))
        server.handler = handlers
        server.start()
    }

    private fun createDataStore(config: Config): DataStore {
        val dataStore = JdbiDataStoreFactory.create(config.scoped("datastore"))
        executor.scheduleAtFixedRate({ cleanupExpiredSecrets(dataStore) }, 0, 30, TimeUnit.MINUTES)
        return dataStore
    }

    private fun createStaticResourceHandler(): Handler {
        val resourceHandler = ResourceHandler()
        resourceHandler.isDirAllowed = false
        resourceHandler.baseResource = Resource.newClassPathResource("/static")
        return resourceHandler
    }

    private fun createApiRequestHandler(dataStore: DataStore): Handler {
        val requestHandler = RequestHandler()

        val plainEndpoint = PlainEndpoint(dataStore)
        requestHandler.registerEndpoint("/plain/put", plainEndpoint::put)
        requestHandler.registerEndpoint("/plain/get", plainEndpoint::get)

        val encryptedEndpoint = EncryptedEndpoint(dataStore)
        requestHandler.registerEndpoint("/encrypted/put", encryptedEndpoint::put)
        requestHandler.registerEndpoint("/encrypted/get", encryptedEndpoint::get)

        val context = ContextHandler()
        context.contextPath = "/api"
        context.handler = requestHandler

        return context
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