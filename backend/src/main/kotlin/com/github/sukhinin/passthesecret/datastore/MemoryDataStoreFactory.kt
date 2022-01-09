package com.github.sukhinin.passthesecret.datastore

object MemoryDataStoreFactory {
    fun create(): DataStore {
        return MemoryDataStore()
    }
}
