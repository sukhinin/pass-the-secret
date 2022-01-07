package com.github.sukhinin.passthesecret.crypto

import java.security.SecureRandom
import javax.crypto.Cipher
import javax.crypto.spec.IvParameterSpec
import javax.crypto.spec.SecretKeySpec

object CryptoUtils {

    private val secureRandom = SecureRandom.getInstanceStrong()

    fun encrypt(key: ByteArray, iv: ByteArray, plaintext: ByteArray): ByteArray {
        val cipher = getCipherInstance(key, iv, Cipher.ENCRYPT_MODE)
        return cipher.doFinal(plaintext)
    }

    fun decrypt(key: ByteArray, iv: ByteArray, ciphertext: ByteArray): ByteArray {
        val cipher = getCipherInstance(key, iv, Cipher.DECRYPT_MODE)
        return cipher.doFinal(ciphertext)
    }

    private fun getCipherInstance(key: ByteArray, iv: ByteArray, mode: Int): Cipher {
        require(key.size == 32) { "Expected 256-bit key" }
        require(iv.size == 16) { "Expected 128-bit IV" }

        val cipher = Cipher.getInstance("AES/CBC/PKCS5Padding")
        val keySpec = SecretKeySpec(key, "AES")
        val ivSpec = IvParameterSpec(iv)
        cipher.init(mode, keySpec, ivSpec)

        return cipher
    }

    fun getRandomBytes(size: Int): ByteArray {
        return ByteArray(size).also(secureRandom::nextBytes)
    }
}
