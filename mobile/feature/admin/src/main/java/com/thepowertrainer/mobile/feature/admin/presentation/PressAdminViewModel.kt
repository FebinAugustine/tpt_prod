package com.thepowertrainer.mobile.feature.admin.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminPress
import com.thepowertrainer.mobile.feature.admin.domain.PressAdminRepository
import com.thepowertrainer.mobile.feature.admin.domain.PressInput
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class PressAdminUiState(
    val isLoading: Boolean = true,
    val items: List<AdminPress> = emptyList(),
    val error: String? = null,
    val showAddForm: Boolean = false,
    val editingItem: AdminPress? = null,
    val isSaving: Boolean = false,
    val formError: String? = null,
)

@HiltViewModel
class PressAdminViewModel @Inject constructor(
    private val repository: PressAdminRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(PressAdminUiState())
    val uiState: StateFlow<PressAdminUiState> = _uiState.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = repository.getPress()) {
                is AppResult.Success -> _uiState.value = _uiState.value.copy(isLoading = false, items = result.data)
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isLoading = false, error = result.message)
            }
        }
    }

    fun openAddForm() { _uiState.value = _uiState.value.copy(showAddForm = true, formError = null) }
    fun openEditForm(item: AdminPress) { _uiState.value = _uiState.value.copy(editingItem = item, formError = null) }
    fun closeForms() { _uiState.value = _uiState.value.copy(showAddForm = false, editingItem = null, formError = null) }

    fun addItem(input: PressInput) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, formError = null)
            when (val result = repository.addPress(input)) {
                is AppResult.Success -> { _uiState.value = _uiState.value.copy(isSaving = false, showAddForm = false); load() }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSaving = false, formError = result.message)
            }
        }
    }

    fun updateItem(id: String, input: PressInput) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, formError = null)
            when (val result = repository.updatePress(id, input)) {
                is AppResult.Success -> { _uiState.value = _uiState.value.copy(isSaving = false, editingItem = null); load() }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSaving = false, formError = result.message)
            }
        }
    }

    fun deleteItem(id: String) {
        viewModelScope.launch {
            when (val result = repository.deletePress(id)) {
                is AppResult.Success -> load()
                is AppResult.Error -> _uiState.value = _uiState.value.copy(error = result.message)
            }
        }
    }
}
