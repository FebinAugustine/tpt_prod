package com.thepowertrainer.mobile.feature.admin.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminCareer
import com.thepowertrainer.mobile.feature.admin.domain.CareerInput
import com.thepowertrainer.mobile.feature.admin.domain.CareersAdminRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CareersAdminUiState(
    val isLoading: Boolean = true,
    val careers: List<AdminCareer> = emptyList(),
    val error: String? = null,
    val showAddForm: Boolean = false,
    val editingCareer: AdminCareer? = null,
    val isSaving: Boolean = false,
    val formError: String? = null,
)

@HiltViewModel
class CareersAdminViewModel @Inject constructor(
    private val repository: CareersAdminRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(CareersAdminUiState())
    val uiState: StateFlow<CareersAdminUiState> = _uiState.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = repository.getCareers()) {
                is AppResult.Success -> _uiState.value = _uiState.value.copy(isLoading = false, careers = result.data)
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isLoading = false, error = result.message)
            }
        }
    }

    fun openAddForm() { _uiState.value = _uiState.value.copy(showAddForm = true, formError = null) }
    fun openEditForm(career: AdminCareer) { _uiState.value = _uiState.value.copy(editingCareer = career, formError = null) }
    fun closeForms() { _uiState.value = _uiState.value.copy(showAddForm = false, editingCareer = null, formError = null) }

    fun addCareer(input: CareerInput) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, formError = null)
            when (val result = repository.addCareer(input)) {
                is AppResult.Success -> { _uiState.value = _uiState.value.copy(isSaving = false, showAddForm = false); load() }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSaving = false, formError = result.message)
            }
        }
    }

    fun updateCareer(id: String, input: CareerInput) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, formError = null)
            when (val result = repository.updateCareer(id, input)) {
                is AppResult.Success -> { _uiState.value = _uiState.value.copy(isSaving = false, editingCareer = null); load() }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSaving = false, formError = result.message)
            }
        }
    }

    fun deleteCareer(id: String) {
        viewModelScope.launch {
            when (val result = repository.deleteCareer(id)) {
                is AppResult.Success -> load()
                is AppResult.Error -> _uiState.value = _uiState.value.copy(error = result.message)
            }
        }
    }
}
