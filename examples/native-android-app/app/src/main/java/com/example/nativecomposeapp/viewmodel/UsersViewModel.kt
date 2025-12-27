package com.example.nativecomposeapp.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.nativecomposeapp.data.model.User
import com.example.nativecomposeapp.data.repository.UserRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

sealed class UsersUiState {
    object Loading : UsersUiState()
    data class Success(val users: List<User>) : UsersUiState()
    data class Error(val message: String) : UsersUiState()
}

class UsersViewModel : ViewModel() {
    private val repository = UserRepository()

    private val _uiState = MutableStateFlow<UsersUiState>(UsersUiState.Loading)
    val uiState: StateFlow<UsersUiState> = _uiState.asStateFlow()

    init {
        loadUsers()
    }

    fun loadUsers() {
        viewModelScope.launch {
            _uiState.value = UsersUiState.Loading
            repository.getUsers()
                .onSuccess { users ->
                    _uiState.value = UsersUiState.Success(users)
                }
                .onFailure { exception ->
                    _uiState.value = UsersUiState.Error(
                        exception.message ?: "Failed to load users"
                    )
                }
        }
    }

    fun refresh() {
        loadUsers()
    }
}
