package com.thepowertrainer.mobile.feature.admin.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminCategory
import com.thepowertrainer.mobile.feature.admin.domain.CategoriesAdminRepository
import com.thepowertrainer.mobile.feature.admin.domain.CategoryInput
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CategoriesAdminUiState(
    val isLoading: Boolean = true,
    val categories: List<AdminCategory> = emptyList(),
    val error: String? = null,
    val showAddForm: Boolean = false,
    val editingCategory: AdminCategory? = null,
    val isSaving: Boolean = false,
    val formError: String? = null,
)

@HiltViewModel
class CategoriesAdminViewModel @Inject constructor(
    private val repository: CategoriesAdminRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(CategoriesAdminUiState())
    val uiState: StateFlow<CategoriesAdminUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = repository.getCategories()) {
                is AppResult.Success -> _uiState.value = _uiState.value.copy(isLoading = false, categories = result.data)
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isLoading = false, error = result.message)
            }
        }
    }

    fun openAddForm() {
        _uiState.value = _uiState.value.copy(showAddForm = true, formError = null)
    }

    fun openEditForm(category: AdminCategory) {
        _uiState.value = _uiState.value.copy(editingCategory = category, formError = null)
    }

    fun closeForms() {
        _uiState.value = _uiState.value.copy(showAddForm = false, editingCategory = null, formError = null)
    }

    fun addCategory(input: CategoryInput) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, formError = null)
            when (val result = repository.addCategory(input)) {
                is AppResult.Success -> {
                    _uiState.value = _uiState.value.copy(isSaving = false, showAddForm = false)
                    load()
                }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSaving = false, formError = result.message)
            }
        }
    }

    fun updateCategory(id: String, input: CategoryInput) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, formError = null)
            when (val result = repository.updateCategory(id, input)) {
                is AppResult.Success -> {
                    _uiState.value = _uiState.value.copy(isSaving = false, editingCategory = null)
                    load()
                }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSaving = false, formError = result.message)
            }
        }
    }

    fun deleteCategory(id: String) {
        viewModelScope.launch {
            when (val result = repository.deleteCategory(id)) {
                is AppResult.Success -> load()
                is AppResult.Error -> _uiState.value = _uiState.value.copy(error = result.message)
            }
        }
    }
}
