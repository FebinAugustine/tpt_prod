package com.thepowertrainer.mobile.feature.admin.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminUiCard
import com.thepowertrainer.mobile.feature.admin.domain.BannersRepository
import com.thepowertrainer.mobile.feature.admin.domain.PickedImage
import com.thepowertrainer.mobile.feature.admin.domain.UiCardInput
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class BannersViewModel @Inject constructor(
    private val repository: BannersRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(UiCardsUiState())
    val uiState: StateFlow<UiCardsUiState> = _uiState.asStateFlow()

    init { load() }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = repository.getBanners()) {
                is AppResult.Success -> _uiState.value = _uiState.value.copy(isLoading = false, items = result.data)
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isLoading = false, error = result.message)
            }
        }
    }

    fun openAddForm() { _uiState.value = _uiState.value.copy(showAddForm = true, formError = null) }
    fun openEditForm(card: AdminUiCard) { _uiState.value = _uiState.value.copy(editingCard = card, formError = null) }
    fun closeForms() { _uiState.value = _uiState.value.copy(showAddForm = false, editingCard = null, formError = null) }

    fun addCard(input: UiCardInput, image: PickedImage?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, formError = null)
            when (val result = repository.addBanner(input, image)) {
                is AppResult.Success -> { _uiState.value = _uiState.value.copy(isSaving = false, showAddForm = false); load() }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSaving = false, formError = result.message)
            }
        }
    }

    fun updateCard(id: String, input: UiCardInput, image: PickedImage?) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, formError = null)
            when (val result = repository.updateBanner(id, input, image)) {
                is AppResult.Success -> { _uiState.value = _uiState.value.copy(isSaving = false, editingCard = null); load() }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSaving = false, formError = result.message)
            }
        }
    }

    fun deleteCard(id: String) {
        viewModelScope.launch {
            when (val result = repository.deleteBanner(id)) {
                is AppResult.Success -> load()
                is AppResult.Error -> _uiState.value = _uiState.value.copy(error = result.message)
            }
        }
    }
}
