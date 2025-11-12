package com.example.trabajofinal.data.repository

import com.example.trabajofinal.data.model.Character
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

/**
 * Repositorio para gestionar las operaciones CRUD de campeones
 *
 * Conecta con la API de Google Apps Script para obtener y modificar datos
 * almacenados en Google Sheets
 */
class CharacterRepository {

    // URL de tu API de Google Apps Script
    private val apiUrl = "https://script.google.com/macros/s/AKfycbzgi0AsA_MgOr077F_kgrKiLg3z9PHNneNdy1Nd5F8bLNY3t2hccoL50QdJRBzRWJsBCQ/exec"

    // Constantes para los nombres de columnas
    companion object {
        private const val COLUMN_NAME = "Nombre"
    }

    // Helpers comunes de red
    private fun isSuccessCode(code: Int): Boolean = code in 200..299

    private fun readResponse(connection: HttpURLConnection): String {
        return try {
            connection.inputStream.bufferedReader().use { it.readText() }
        } catch (_: Exception) {
            // Si no hay inputStream (p.ej., error HTTP), intentar leer errorStream
            connection.errorStream?.bufferedReader()?.use { it.readText() } ?: ""
        }
    }

    private fun setupCommon(connection: HttpURLConnection) {
        connection.connectTimeout = 15000
        connection.readTimeout = 15000
        connection.instanceFollowRedirects = true
        connection.useCaches = false
        connection.setRequestProperty("Accept", "application/json")
        connection.setRequestProperty("Cache-Control", "no-cache")
    }

    /**
     * Obtiene la lista completa de campeones desde la API
     *
     * @return Lista de campeones o lista vacía en caso de error
     */
    suspend fun getCharacters(): List<Character> {
        return withContext(Dispatchers.IO) {
            var connection: HttpURLConnection? = null
            try {
                // Evitar caché en algunos proxies intermedios de Apps Script
                val url = URL("$apiUrl?ts=${System.currentTimeMillis()}")
                connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                setupCommon(connection)

                android.util.Log.d("CharacterRepository", "GET Request: ${url}")

                val responseCode = connection.responseCode
                val raw = readResponse(connection)
                android.util.Log.d("CharacterRepository", "GET Response Code: $responseCode")
                android.util.Log.d("CharacterRepository", "GET Response: $raw")

                if (isSuccessCode(responseCode)) {
                    val gson = Gson()
                    val trimmed = raw.trim()

                    return@withContext if (trimmed.startsWith("[")) {
                        val type = object : TypeToken<List<Character>>() {}.type
                        val characters = gson.fromJson<List<Character>>(trimmed, type)
                        android.util.Log.d("CharacterRepository", "Parsed ${characters.size} characters")
                        characters.forEach { char ->
                            android.util.Log.d(
                                "CharacterRepository",
                                "Character: ${char.name}, imageUrl='${char.imageUrl}', imagePublicUrl='${char.imagePublicUrl}'"
                            )
                        }
                        characters
                    } else {
                        // Si viene objeto (p.ej., error), devolver lista vacía
                        android.util.Log.w("CharacterRepository", "GET devolvió objeto en lugar de array. Respuesta: $trimmed")
                        emptyList()
                    }
                } else {
                    android.util.Log.e("CharacterRepository", "GET Error Code: $responseCode")
                    android.util.Log.e("CharacterRepository", "GET Error Body: $raw")
                    emptyList()
                }
            } catch (e: Exception) {
                e.printStackTrace()
                android.util.Log.e("CharacterRepository", "GET Exception: ${e.message}")
                emptyList()
            } finally {
                connection?.disconnect()
            }
        }
    }

    /**
     * Agrega un nuevo campeón a la base de datos
     *
     * @param character Campeón a agregar
     * @return true si se agregó exitosamente, false en caso contrario
     */
    suspend fun addCharacter(character: Character): Boolean {
        return withContext(Dispatchers.IO) {
            var connection: HttpURLConnection? = null
            try {
                val url = URL(apiUrl)
                connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.doOutput = true
                setupCommon(connection)
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")

                val gson = Gson()
                val jsonInputString = gson.toJson(character)

                android.util.Log.d("CharacterRepository", "POST Request URL: $apiUrl")
                android.util.Log.d("CharacterRepository", "POST Request Body: $jsonInputString")

                connection.outputStream.use { os ->
                    val input = jsonInputString.toByteArray(Charsets.UTF_8)
                    os.write(input)
                    os.flush()
                }

                val code = connection.responseCode
                val body = readResponse(connection)
                android.util.Log.d("CharacterRepository", "POST Response Code: $code")
                android.util.Log.d("CharacterRepository", "POST Response: $body")

                if (isSuccessCode(code)) {
                    // Si el backend devuelve {error:true} considerarlo fallo
                    val maybeObj = try { JSONObject(body) } catch (_: Exception) { null }
                    if (maybeObj != null && maybeObj.optBoolean("error", false)) {
                        android.util.Log.e("CharacterRepository", "POST Error (JSON): ${maybeObj.optString("message")}")
                        return@withContext false
                    }
                    true
                } else {
                    android.util.Log.e("CharacterRepository", "POST Error Body: $body")
                    false
                }
            } catch (e: Exception) {
                e.printStackTrace()
                android.util.Log.e("CharacterRepository", "POST Exception: ${e.message}")
                false
            } finally {
                connection?.disconnect()
            }
        }
    }

    /**
     * Elimina un campeón de la base de datos
     * NOTA: Usa POST con _method: DELETE porque Google Apps Script no soporta DELETE nativo
     *
     * @param characterId Nombre del campeón a eliminar
     * @return true si se eliminó exitosamente, false en caso contrario
     */
    suspend fun deleteCharacter(characterId: String): Boolean {
        return withContext(Dispatchers.IO) {
            var connection: HttpURLConnection? = null
            try {
                val url = URL(apiUrl)
                connection = url.openConnection() as HttpURLConnection

                // ⚠️ IMPORTANTE: Usar POST en lugar de DELETE
                connection.requestMethod = "POST"
                connection.doOutput = true
                setupCommon(connection)
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")

                // ⚠️ CLAVE: Crear JSON con _method: DELETE
                val jsonBody = JSONObject().apply {
                    put("_method", "DELETE")
                    put(COLUMN_NAME, characterId)
                }

                android.util.Log.d("CharacterRepository", "DELETE Request URL: $apiUrl")
                android.util.Log.d("CharacterRepository", "DELETE Request Body: $jsonBody")
                android.util.Log.d("CharacterRepository", "DELETE Character ID: $characterId")

                connection.outputStream.use { os ->
                    val input = jsonBody.toString().toByteArray(Charsets.UTF_8)
                    os.write(input)
                    os.flush()
                }

                val code = connection.responseCode
                val body = readResponse(connection)
                android.util.Log.d("CharacterRepository", "DELETE Response Code: $code")
                android.util.Log.d("CharacterRepository", "DELETE Response: $body")

                if (isSuccessCode(code)) {
                    val maybeObj = try { JSONObject(body) } catch (_: Exception) { null }
                    if (maybeObj != null && maybeObj.optBoolean("error", false)) {
                        android.util.Log.e("CharacterRepository", "DELETE Error (JSON): ${maybeObj.optString("message")}")
                        return@withContext false
                    }
                    true
                } else {
                    android.util.Log.e("CharacterRepository", "DELETE Error Body: $body")
                    false
                }
            } catch (e: Exception) {
                e.printStackTrace()
                android.util.Log.e("CharacterRepository", "DELETE Exception: ${e.message}")
                false
            } finally {
                connection?.disconnect()
            }
        }
    }

    /**
     * Actualiza un campeón existente en la base de datos
     * NOTA: Usa POST con _method: PUT porque Google Apps Script no soporta PUT nativo
     *
     * @param character Campeón con los datos actualizados
     * @return true si se actualizó exitosamente, false en caso contrario
     */
    suspend fun updateCharacter(character: Character): Boolean {
        return withContext(Dispatchers.IO) {
            var connection: HttpURLConnection? = null
            try {
                val url = URL(apiUrl)
                connection = url.openConnection() as HttpURLConnection

                // ⚠️ IMPORTANTE: Usar POST en lugar de PUT
                connection.requestMethod = "POST"
                connection.doOutput = true
                setupCommon(connection)
                connection.setRequestProperty("Content-Type", "application/json; charset=UTF-8")

                val gson = Gson()
                val characterJson = gson.toJsonTree(character).asJsonObject

                // ⚠️ CLAVE: Agregar el campo _method: PUT
                characterJson.addProperty("_method", "PUT")

                val jsonInputString = gson.toJson(characterJson)

                android.util.Log.d("CharacterRepository", "PUT Request URL: $apiUrl")
                android.util.Log.d("CharacterRepository", "PUT Request Body: $jsonInputString")

                connection.outputStream.use { os ->
                    val input = jsonInputString.toByteArray(Charsets.UTF_8)
                    os.write(input)
                    os.flush()
                }

                val code = connection.responseCode
                val body = readResponse(connection)
                android.util.Log.d("CharacterRepository", "PUT Response Code: $code")
                android.util.Log.d("CharacterRepository", "PUT Response: $body")

                if (isSuccessCode(code)) {
                    val maybeObj = try { JSONObject(body) } catch (_: Exception) { null }
                    if (maybeObj != null && maybeObj.optBoolean("error", false)) {
                        android.util.Log.e("CharacterRepository", "PUT Error (JSON): ${maybeObj.optString("message")}")
                        return@withContext false
                    }
                    true
                } else {
                    android.util.Log.e("CharacterRepository", "PUT Error Body: $body")
                    false
                }
            } catch (e: Exception) {
                e.printStackTrace()
                android.util.Log.e("CharacterRepository", "PUT Exception: ${e.message}")
                false
            } finally {
                connection?.disconnect()
            }
        }
    }
}
