package com.example.trabajofinal.util

import android.net.Uri
import android.util.Log

object UrlUtils {
    private const val TAG = "UrlUtils"

    /**
     * Extrae el ID de un archivo de Google Drive de distintos formatos de URL.
     * Soporta:
     * - https://drive.google.com/open?id=FILE_ID
     * - https://drive.google.com/uc?export=view&id=FILE_ID
     * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
     * - https://docs.google.com/uc?id=FILE_ID&export=download
     * - https://lh3.googleusercontent.com/d/FILE_ID
     */
    fun extractDriveId(url: String?): String? {
        if (url.isNullOrBlank()) return null
        return try {
            val uri = Uri.parse(url)
            // 1) Query param id
            uri.getQueryParameter("id")?.takeIf { it.isNotBlank() }
                ?: run {
                    // 2) /file/d/FILE_ID or /d/FILE_ID (googleusercontent)
                    val path = uri.path ?: return@run null
                    val fileDRegex = "/file/d/([a-zA-Z0-9_-]+)".toRegex()
                    val dRegex = "/d/([a-zA-Z0-9_-]+)".toRegex()
                    fileDRegex.find(path)?.groupValues?.getOrNull(1)
                        ?: dRegex.find(path)?.groupValues?.getOrNull(1)
                }
        } catch (e: Exception) {
            Log.w(TAG, "extractDriveId exception for url=$url: ${e.message}")
            null
        }
    }

    /**
     * Convierte distintas URLs de Google Drive a un enlace directo a bytes de imagen.
     * Preferimos el host lh3.googleusercontent.com, que sirve contenido directo y cacheable.
     */
    fun toDirectDriveImageUrl(url: String?): String? {
        if (url.isNullOrBlank()) return null
        val lower = url.lowercase()
        // Si ya es un host directo conocido, retornamos tal cual
        if (lower.contains("lh3.googleusercontent.com")) return url

        // Solo transformamos URLs de Google Drive/Docs
        val isDriveLike = lower.contains("drive.google.com") || lower.contains("docs.google.com")
        if (!isDriveLike) return url

        val id = extractDriveId(url) ?: return url

        // Construimos dos variantes conocidas; usamos lh3 como preferida
        val lh3 = "https://lh3.googleusercontent.com/d/$id"
        val ucDownload = "https://drive.google.com/uc?export=download&id=$id"

        // Devolvemos lh3; Glide seguirá redirecciones si las hubiera
        Log.d(TAG, "Normalized Drive URL id=$id -> $lh3 (fallback $ucDownload)")
        return lh3
    }
}

