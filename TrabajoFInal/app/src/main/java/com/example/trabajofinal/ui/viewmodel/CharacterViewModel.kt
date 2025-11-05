package com.example.trabajofinal.ui.viewmodel

import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.trabajofinal.data.model.Character
import com.example.trabajofinal.data.repository.CharacterRepository
import kotlinx.coroutines.launch

class CharacterViewModel : ViewModel() {

    private val repository = CharacterRepository()

    private val _characters = MutableLiveData<List<Character>>()
    val characters: LiveData<List<Character>> = _characters

    private val _filteredCharacters = MutableLiveData<List<Character>>()
    val filteredCharacters: LiveData<List<Character>> = _filteredCharacters

    private val _isLoading = MutableLiveData<Boolean>()
    val isLoading: LiveData<Boolean> = _isLoading

    private val _error = MutableLiveData<String?>()
    val error: LiveData<String?> = _error

    private var allCharacters: List<Character> = emptyList()

    fun loadCharacters() {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val data = repository.getCharacters()
                allCharacters = data
                _characters.value = data
                _filteredCharacters.value = data
                _error.value = null
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun addCharacter(character: Character) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val success = repository.addCharacter(character)
                if (success) {
                    loadCharacters() // Reload after adding
                }
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun deleteCharacter(characterId: String) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val success = repository.deleteCharacter(characterId)
                if (success) {
                    loadCharacters() // Reload after deleting
                }
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }

    fun updateCharacter(character: Character) {
        viewModelScope.launch {
            _isLoading.value = true
            try {
                val success = repository.updateCharacter(character)
                if (success) {
                    loadCharacters() // Reload after updating
                }
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _isLoading.value = false
            }
        }
    }

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

    fun filterByType(type: String) {
        val filtered = if (type == "Todos") {
            allCharacters
        } else {
            allCharacters.filter { it.type.equals(type, ignoreCase = true) }
        }
        _filteredCharacters.value = filtered
    }

    fun filterByRole(role: String) {
        val filtered = if (role == "Todos") {
            allCharacters
        } else {
            allCharacters.filter { it.role.equals(role, ignoreCase = true) }
        }
        _filteredCharacters.value = filtered
    }

    fun sortAlphabetically() {
        val sorted = _filteredCharacters.value?.sortedBy { it.name } ?: emptyList()
        _filteredCharacters.value = sorted
    }
}

