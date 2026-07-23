package com.thepowertrainer.mobile.feature.admin.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminRepository
import com.thepowertrainer.mobile.feature.admin.domain.AdminUser
import com.thepowertrainer.mobile.feature.admin.domain.NewUserInput
import com.thepowertrainer.mobile.feature.admin.domain.UpdateUserInput
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class UsersUiState(
    val isLoading: Boolean = true,
    val users: List<AdminUser> = emptyList(),
    val searchQuery: String = "",
    val error: String? = null,
    val showAddForm: Boolean = false,
    val editingUser: AdminUser? = null,
    val isSaving: Boolean = false,
    val formError: String? = null,
)

@HiltViewModel
class UsersViewModel @Inject constructor(
    private val repository: AdminRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(UsersUiState())
    val uiState: StateFlow<UsersUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = repository.getUsers(search = _uiState.value.searchQuery.ifBlank { null })) {
                is AppResult.Success -> _uiState.value = _uiState.value.copy(isLoading = false, users = result.data)
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isLoading = false, error = result.message)
            }
        }
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        load()
    }

    fun openAddForm() {
        _uiState.value = _uiState.value.copy(showAddForm = true, formError = null)
    }

    fun openEditForm(user: AdminUser) {
        _uiState.value = _uiState.value.copy(editingUser = user, formError = null)
    }

    fun closeForms() {
        _uiState.value = _uiState.value.copy(showAddForm = false, editingUser = null, formError = null)
    }

    fun addUser(input: NewUserInput) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, formError = null)
            when (val result = repository.addUser(input)) {
                is AppResult.Success -> {
                    _uiState.value = _uiState.value.copy(isSaving = false, showAddForm = false)
                    load()
                }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSaving = false, formError = result.message)
            }
        }
    }

    fun updateUser(id: String, input: UpdateUserInput) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, formError = null)
            when (val result = repository.updateUser(id, input)) {
                is AppResult.Success -> {
                    _uiState.value = _uiState.value.copy(isSaving = false, editingUser = null)
                    load()
                }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSaving = false, formError = result.message)
            }
        }
    }

    fun deleteUser(id: String) {
        viewModelScope.launch {
            when (val result = repository.deleteUser(id)) {
                is AppResult.Success -> load()
                is AppResult.Error -> _uiState.value = _uiState.value.copy(error = result.message)
            }
        }
    }
}
