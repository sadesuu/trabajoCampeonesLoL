package com.example.trabajofinal.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.trabajofinal.data.model.Character
import com.example.trabajofinal.data.repository.CharacterRepository
import kotlinx.coroutines.launch

/**
 * ViewModel para gestionar los datos de los campeones de League of Legends
 *
 * Maneja la lógica de negocio y comunicación con el repositorio,
 * proporcionando LiveData para que los fragmentos observen los cambios
 */
class CharacterViewModel : ViewModel() {

    private val repository = CharacterRepository()

    /** Lista filtrada de campeones que se muestra en la UI */
    private val _filteredCharacters = MutableLiveData<List<Character>>()
    val filteredCharacters: LiveData<List<Character>> = _filteredCharacters

    /** Estado de carga para mostrar/ocultar el progress bar */
    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    /** Mensajes de error para mostrar al usuario */
    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    /** Mensajes de éxito para mostrar al usuario */
    private val _successMessage = MutableLiveData<String?>()
    val successMessage: LiveData<String?> = _successMessage

    /** Lista completa de campeones sin filtrar (caché local) */
    private var allCharacters: List<Character> = emptyList()

    /**
     * Carga la lista de campeones desde el repositorio
     */
    fun loadCharacters() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val data = repository.getCharacters()
                allCharacters = data
                _filteredCharacters.value = data
                _error.value = null
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }

    /**
     * Agrega un nuevo campeón al repositorio
     *
     * @param character El campeón a agregar
     */
    fun addCharacter(character: Character) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val success = repository.addCharacter(character)
                if (success) {
                    _successMessage.value = "Campeón agregado exitosamente"
                    loadCharacters() // Reload after adding
                } else {
                    _error.value = "Error al agregar el campeón"
                }
            } catch (e: Exception) {
                _error.value = "Error: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }

    /**
     * Elimina un campeón del repositorio
     *
     * @param characterId ID del campeón a eliminar
     */
    fun deleteCharacter(characterId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val success = repository.deleteCharacter(characterId)
                if (success) {
                    _successMessage.value = "Campeón eliminado exitosamente"
                    loadCharacters() // Reload after deleting
                } else {
                    _error.value = "Error al eliminar el campeón"
                }
            } catch (e: Exception) {
                _error.value = "Error: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }

    /**
     * Actualiza los datos de un campeón existente
     *
     * @param character El campeón con los datos actualizados
     */
    fun updateCharacter(character: Character) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val success = repository.updateCharacter(character)
                if (success) {
                    _successMessage.value = "Campeón actualizado exitosamente"
                    loadCharacters() // Reload after updating
                } else {
                    _error.value = "Error al actualizar el campeón"
                }
            } catch (e: Exception) {
                _error.value = "Error: ${e.message}"
            } finally {
                _isLoading.value = false
            }
        }
    }

    /**
     * Busca campeones por nombre
     *
     * @param query Texto de búsqueda (case-insensitive)
     */
    fun searchCharacters(query: String) {
        val filtered = if (query.isEmpty()) {
            allCharacters
        } else {
            allCharacters.filter {
                it.name.contains(query, ignoreCase = true)
            }
        }
        _filteredCharacters.value = filtered
    }

    /**
     * Filtra campeones por rol/posición
     *
     * @param role Rol a filtrar (Top, Mid, Jungler, ADC, Support) o "Todos" para mostrar todos
     */
    fun filterByRole(role: String) {
        val filtered = if (role == "Todos") {
            allCharacters
        } else {
            allCharacters.filter { it.role.equals(role, ignoreCase = true) }
        }
        _filteredCharacters.value = filtered
    }

    /**
     * Ordena los campeones alfabéticamente por nombre
     */
    fun sortAlphabetically() {
        val sorted = _filteredCharacters.value?.sortedBy { it.name } ?: emptyList()
        _filteredCharacters.value = sorted
    }

    /**
     * Limpia los mensajes de éxito y error
     * Debe llamarse después de mostrar los mensajes para evitar que se disparen múltiples veces
     */
    fun clearMessages() {
        _successMessage.value = null
        _error.value = null
    }
}

