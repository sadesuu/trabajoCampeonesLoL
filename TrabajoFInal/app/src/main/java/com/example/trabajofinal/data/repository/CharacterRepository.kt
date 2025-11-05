package com.example.trabajofinal.data.repository

import android.util.Log
import com.example.trabajofinal.data.model.Character
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.net.HttpURLConnection
import java.net.URL

class CharacterRepository {

    // URL de tu API de Google Apps Script
    private val apiUrl = "https://script.google.com/macros/s/AKfycbymP-W4ln9yhC7vqYhpBvbdASiO8wU81i3KJYqgifNJmYDcMTx54zbPf2CyK_40PLGwNw/exec"

    suspend fun getCharacters(): List<Character> {
        return withContext(Dispatchers.IO) {
            try {
                Log.d("CharacterRepository", "Fetching characters from: $apiUrl")
                val url = URL(apiUrl)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "GET"
                connection.connectTimeout = 15000
                connection.readTimeout = 15000
                connection.instanceFollowRedirects = true

                val responseCode = connection.responseCode
                Log.d("CharacterRepository", "Response code: $responseCode")

                if (responseCode == HttpURLConnection.HTTP_OK) {
                    val response = connection.inputStream.bufferedReader().use { it.readText() }
                    Log.d("CharacterRepository", "Response JSON (first 500 chars): ${response.take(500)}")

                    val gson = Gson()
                    val type = object : TypeToken<List<Character>>() {}.type
                    val characters = gson.fromJson<List<Character>>(response, type)

                    Log.d("CharacterRepository", "Parsed ${characters.size} characters")
                    characters.forEachIndexed { index, char ->
                        Log.d("CharacterRepository", "Character $index: name='${char.name}', type='${char.type}', role='${char.role}', imageUrl='${char.imageUrl}', imagePublicUrl='${char.imagePublicUrl}'")
                    }

                    characters
                } else {
                    Log.e("CharacterRepository", "Error response code: $responseCode")
                    emptyList()
                }
            } catch (e: Exception) {
                Log.e("CharacterRepository", "Exception fetching characters", e)
                e.printStackTrace()
                emptyList()
            }
        }
    }

    suspend fun addCharacter(character: Character): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val url = URL(apiUrl)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "POST"
                connection.doOutput = true
                connection.setRequestProperty("Content-Type", "application/json")

                val gson = Gson()
                val jsonInputString = gson.toJson(character)

                connection.outputStream.use { os ->
                    val input = jsonInputString.toByteArray(Charsets.UTF_8)
                    os.write(input, 0, input.size)
                }

                val responseCode = connection.responseCode
                responseCode == HttpURLConnection.HTTP_OK || responseCode == HttpURLConnection.HTTP_CREATED
            } catch (e: Exception) {
                e.printStackTrace()
                false
            }
        }
    }

    suspend fun deleteCharacter(characterId: String): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val url = URL("$apiUrl?id=$characterId")
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "DELETE"

                val responseCode = connection.responseCode
                responseCode == HttpURLConnection.HTTP_OK
            } catch (e: Exception) {
                e.printStackTrace()
                false
            }
        }
    }

    suspend fun updateCharacter(character: Character): Boolean {
        return withContext(Dispatchers.IO) {
            try {
                val url = URL(apiUrl)
                val connection = url.openConnection() as HttpURLConnection
                connection.requestMethod = "PUT"
                connection.doOutput = true
                connection.setRequestProperty("Content-Type", "application/json")

                val gson = Gson()
                val jsonInputString = gson.toJson(character)

                connection.outputStream.use { os ->
                    val input = jsonInputString.toByteArray(Charsets.UTF_8)
                    os.write(input, 0, input.size)
                }

                val responseCode = connection.responseCode
                responseCode == HttpURLConnection.HTTP_OK
            } catch (e: Exception) {
                e.printStackTrace()
                false
            }
        }
    }
}
