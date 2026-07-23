package com.thepowertrainer.mobile.feature.admin.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminOrder
import com.thepowertrainer.mobile.feature.admin.domain.OrdersAdminRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OrdersAdminUiState(
    val isLoading: Boolean = true,
    val orders: List<AdminOrder> = emptyList(),
    val searchQuery: String = "",
    val statusFilter: String? = null,
    val error: String? = null,
    val editingOrder: AdminOrder? = null,
    val isSaving: Boolean = false,
)

@HiltViewModel
class OrdersAdminViewModel @Inject constructor(
    private val repository: OrdersAdminRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrdersAdminUiState())
    val uiState: StateFlow<OrdersAdminUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (
                val result = repository.getOrders(
                    search = _uiState.value.searchQuery.ifBlank { null },
                    status = _uiState.value.statusFilter,
                )
            ) {
                is AppResult.Success -> _uiState.value = _uiState.value.copy(isLoading = false, orders = result.data)
                is AppResult.Error -> _uiState.value = _uiState.value.copy(isLoading = false, error = result.message)
            }
        }
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        load()
    }

    fun onStatusFilterChanged(status: String?) {
        _uiState.value = _uiState.value.copy(statusFilter = status)
        load()
    }

    fun openEdit(order: AdminOrder) {
        _uiState.value = _uiState.value.copy(editingOrder = order)
    }

    fun closeEdit() {
        _uiState.value = _uiState.value.copy(editingOrder = null)
    }

    fun updateStatuses(id: String, orderStatus: String, paymentStatus: String) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isSaving = true)
            val orderResult = repository.updateOrderStatus(id, orderStatus)
            val paymentResult = repository.updatePaymentStatus(id, paymentStatus)
            val error = (orderResult as? AppResult.Error)?.message ?: (paymentResult as? AppResult.Error)?.message
            _uiState.value = _uiState.value.copy(isSaving = false, editingOrder = null, error = error)
            load()
        }
    }
}
