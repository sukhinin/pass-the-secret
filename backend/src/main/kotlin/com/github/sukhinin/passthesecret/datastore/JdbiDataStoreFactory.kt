package com.github.sukhinin.passthesecret.datastore

import com.github.sukhinin.simpleconfig.Config
import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.sqlite3.SQLitePlugin
import java.sql.DriverManager

object JdbiDataStoreFactory {
    fun create(config: Config): DataStore {
        val path = config.get("path")
        val conn = DriverManager.getConnection("jdbc:sqlite:$path")
        val jdbi = Jdbi.create(conn).installPlugin(SQLitePlugin())
        return SynchronizedDataStore(JdbiDataStore(jdbi))
    }
}
