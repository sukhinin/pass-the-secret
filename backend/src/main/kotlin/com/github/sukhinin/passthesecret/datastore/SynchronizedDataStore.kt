package com.github.sukhinin.passthesecret.datastore

import java.time.Instant
import java.util.*

class SynchronizedDataStore(private val dataStore: DataStore): DataStore {

    @Synchronized
    override fun create(data: ByteArray, expires: Instant): UUID {
        return dataStore.create(data, expires)
    }

    @Synchronized
    override fun findAndDelete(id: UUID): ByteArray? {
        return dataStore.findAndDelete(id)
    }

    @Synchronized
    override fun cleanupExpired(): Int {
        return dataStore.cleanupExpired()
    }
}
