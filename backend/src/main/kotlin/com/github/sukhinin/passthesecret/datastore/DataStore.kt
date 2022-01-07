package com.github.sukhinin.passthesecret.datastore

import java.time.Instant
import java.util.*

interface DataStore {
    fun create(data: ByteArray, expires: Instant): UUID
    fun findAndDelete(id: UUID): ByteArray?
    fun cleanupExpired(): Int
}
