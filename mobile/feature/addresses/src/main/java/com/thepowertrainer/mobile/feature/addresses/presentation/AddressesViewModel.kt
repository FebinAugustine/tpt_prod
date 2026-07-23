package com.thepowertrainer.mobile.feature.addresses.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.addresses.domain.Address
import com.thepowertrainer.mobile.feature.addresses.domain.AddressInput
import com.thepowertrainer.mobile.feature.addresses.domain.AddressesRepository
import com.thepowertrainer.mobile.feature.addresses.domain.MAX_ADDRESSES
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class AddressesUiState(
    val isLoading: Boolean = true,
    val addresses: List<Address> = emptyList(),
    val showForm: Boolean = false,
    val editingAddress: Address? = null,
    val isSaving: Boolean = false,
    val error: String? = null,
) {
    val canAddMore: Boolean get() = addresses.size < MAX_ADDRESSES
}

@HiltViewModel
class AddressesViewModel @Inject constructor(
    private val repository: AddressesRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(AddressesUiState())
    val uiState: StateFlow<AddressesUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = repository.getAddresses()) {
                is AppResult.Success -> _uiState.value = _uiState.value.copy(isLoading = false, addresses = result.data)
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isLoading = false, error = result.message)
            }
        }
    }

    fun openAddForm() {
        if (!_uiState.value.canAddMore) {
            _uiState.value = _uiState.value.copy(error = "Maximum $MAX_ADDRESSES addresses allowed. Please edit an existing address.")
            return
        }
        _uiState.value = _uiState.value.copy(showForm = true, editingAddress = null, error = null)
    }

    fun openEditForm(address: Address) {
        _uiState.value = _uiState.value.copy(showForm = true, editingAddress = address, error = null)
    }

    fun closeForm() {
        _uiState.value = _uiState.value.copy(showForm = false, editingAddress = null, error = null)
    }

    fun save(input: AddressInput) {
        val editing = _uiState.value.editingAddress
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true, error = null)
            val result = if (editing != null) {
                repository.updateAddress(editing.id, input)
            } else {
                repository.addAddress(input)
            }
            when (result) {
                is AppResult.Success -> {
                    _uiState.value = _uiState.value.copy(isSaving = false, showForm = false, editingAddress = null)
                    load()
                }
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isSaving = false, error = result.message)
            }
        }
    }

    fun delete(id: String) {
        viewModelScope.launch {
            when (val result = repository.deleteAddress(id)) {
                is AppResult.Success -> load()
                is AppResult.Error -> _uiState.value = _uiState.value.copy(error = result.message)
            }
        }
    }

    fun setDefault(id: String) {
        viewModelScope.launch {
            when (val result = repository.setDefaultAddress(id)) {
                is AppResult.Success -> load()
                is AppResult.Error -> _uiState.value = _uiState.value.copy(error = result.message)
            }
        }
    }
}
