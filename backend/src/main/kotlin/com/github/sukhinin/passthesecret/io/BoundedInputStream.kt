package com.github.sukhinin.passthesecret.io

import java.io.InputStream

class BoundedInputStream(private val stream: InputStream, private val limit: Long) : InputStream() {

    private var pos: Long = 0
    private var mark: Long = -1

    override fun read(): Int {
        if (limitLength(1) <= 0) {
            return -1
        }

        val result = stream.read()
        if (result < 0) {
            return -1
        }

        pos += 1
        return result
    }

    override fun read(b: ByteArray): Int {
        return read(b, 0, b.size)
    }

    override fun read(b: ByteArray, off: Int, len: Int): Int {
        val bytesToRead = limitLength(len)
        if (bytesToRead <= 0) {
            return -1
        }

        val result = stream.read(b, off, bytesToRead)
        if (result < 0) {
            return -1
        }

        pos += result
        return result
    }

    override fun readAllBytes(): ByteArray {
        return readNBytes(Integer.MAX_VALUE)
    }

    override fun readNBytes(len: Int): ByteArray {
        val bytesToRead = limitLength(len)
        if (bytesToRead <= 0) {
            return stream.readNBytes(0)
        }

        return stream.readNBytes(bytesToRead)
    }

    override fun readNBytes(b: ByteArray, off: Int, len: Int): Int {
        val bytesToRead = limitLength(len)
        if (bytesToRead <= 0) {
            return 0
        }

        val result = stream.readNBytes(b, off, len)

        pos += result
        return result
    }

    override fun skip(n: Long): Long {
        val bytesToSkip = limitLength(n)
        if (bytesToSkip <= 0) {
            return 0
        }

        val result = stream.skip(bytesToSkip)

        pos += result
        return result
    }

    override fun available(): Int {
        return limitLength(stream.available())
    }

    override fun markSupported(): Boolean {
        return stream.markSupported()
    }

    @Synchronized
    override fun mark(readlimit: Int) {
        stream.mark(readlimit)
        mark = pos
    }

    @Synchronized
    override fun reset() {
        stream.reset()
        pos = mark
    }

    override fun close() {
        stream.close()
    }

    private fun limitLength(len: Int): Int {
        return when {
            len < 0 -> 0
            limit < 0 -> len
            limit - pos < 0 -> 0
            limit - pos > Integer.MAX_VALUE -> len
            else -> (limit - pos - len).coerceAtLeast(0).toInt()
        }
    }

    private fun limitLength(len: Long): Long {
        return when {
            len < 0 -> 0
            limit < 0 -> len
            limit - pos < 0 -> 0
            else -> (limit - pos - len).coerceAtLeast(0)
        }
    }
}
