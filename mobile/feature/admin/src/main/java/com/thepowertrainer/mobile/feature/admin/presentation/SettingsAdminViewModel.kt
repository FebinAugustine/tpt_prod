package com.thepowertrainer.mobile.feature.admin.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminUpiSettings
import com.thepowertrainer.mobile.feature.admin.domain.PickedImage
import com.thepowertrainer.mobile.feature.admin.domain.SettingsAdminRepository
import com.thepowertrainer.mobile.feature.admin.domain.UpiSettingsInput
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class SettingsAdminUiState(
    val isLoading: Boolean = true,
    val settings: AdminUpiSettings? = null,
    val error: String? = null,
    val isSaving: Boolean = false,
    val saveError: String? = null,
    val saveSuccess: Boolean = false,
)

@HiltViewModel
class SettingsAdminViewModel @Inject constructor(
    private val repository: SettingsAdminRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(SettingsAdminUiState())
    val uiState: StateFlow<SettingsAdminUiState> = _uiState.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = repository.getUpiSettings()) {
                is AppResult.Success -> _uiState.value = _uiState.value.copy(isLoading = false, settings = result.data)
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isLoading = false, error = result.message)
            }
        }
    }

    fun save(input: UpiSettingsInput, image: PickedImage?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, saveError = null, saveSuccess = false)
            when (val result = repository.setUpiSettings(input, image)) {
                is AppResult.Success -> {
                    _uiState.value = _uiState.value.copy(isSaving = false, saveSuccess = true)
                    load()
                }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSaving = false, saveError = result.message)
            }
        }
    }

    fun clearSaveSuccess() { _uiState.value = _uiState.value.copy(saveSuccess = false) }
}
