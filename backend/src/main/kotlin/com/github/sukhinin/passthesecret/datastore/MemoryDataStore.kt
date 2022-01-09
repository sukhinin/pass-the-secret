package com.github.sukhinin.passthesecret.datastore

import java.time.Instant
import java.util.*
import java.util.concurrent.ConcurrentHashMap

class MemoryDataStore : DataStore {

    private class Entry(val data: ByteArray, val expires: Instant)

    private val map: MutableMap<UUID, Entry> = ConcurrentHashMap()

    override fun create(data: ByteArray, expires: Instant): UUID {
        val id = UUID.randomUUID()
        map[id] = Entry(data, expires)
        return id
    }

    override fun findAndDelete(id: UUID): ByteArray? {
        val entry = map.remove(id) ?: return null
        return if (entry.expires >= Instant.now()) entry.data else null
    }

    override fun cleanupExpired(): Int {
        var removedCounter = 0
        val iterator = map.iterator()
        while (iterator.hasNext()) {
            if (iterator.next().value.expires < Instant.now()) {
                iterator.remove()
                removedCounter++
            }
        }
        return removedCounter
    }
}
