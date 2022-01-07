package com.github.sukhinin.passthesecret.datastore

import org.jdbi.v3.core.Jdbi
import org.jdbi.v3.core.kotlin.inTransactionUnchecked
import org.jdbi.v3.core.kotlin.withHandleUnchecked
import java.time.Instant
import java.util.*

class JdbiDataStore(private val jdbi: Jdbi, private val table: String = "records") : DataStore {

    init {
        initializeDatabase()
    }

    private fun initializeDatabase() {
        jdbi.withHandleUnchecked { handle ->
            handle.execute("CREATE TABLE IF NOT EXISTS $table (id BLOB PRIMARY KEY, data BLOB, expires INTEGER)")
        }
    }

    override fun create(data: ByteArray, expires: Instant): UUID {
        val id = UUID.randomUUID()
        jdbi.withHandleUnchecked { handle ->
            handle.createUpdate("INSERT INTO $table(id, data, expires) VALUES(:id, :data, :expires)")
                .bind("id", id)
                .bind("data", data)
                .bind("expires", expires.epochSecond)
                .execute()
        }
        return id
    }

    override fun findAndDelete(id: UUID): ByteArray? {
        return findAndDelete(id, Instant.now())
    }

    internal fun findAndDelete(id: UUID, now: Instant): ByteArray? {
        return jdbi.inTransactionUnchecked { handle ->
            val data = handle.createQuery("SELECT data FROM $table WHERE id = :id AND expires >= :now")
                .bind("id", id)
                .bind("now", now.epochSecond)
                .mapTo(ByteArray::class.java)
                .singleOrNull()
            handle.createUpdate("DELETE FROM $table WHERE id = :id")
                .bind("id", id)
                .execute()
            return@inTransactionUnchecked data
        }
    }

    override fun cleanupExpired(): Int {
        return cleanupExpired(Instant.now())
    }

    internal fun cleanupExpired(now: Instant): Int {
        return jdbi.withHandleUnchecked { handle ->
            handle.createUpdate("DELETE FROM $table WHERE expires <= :now")
                .bind("now", now.epochSecond)
                .execute()
        }
    }
}
