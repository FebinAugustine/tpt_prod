package com.thepowertrainer.mobile.feature.orders.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.orders.domain.Order
import com.thepowertrainer.mobile.feature.orders.domain.OrdersRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OrdersUiState(
    val isLoading: Boolean = true,
    val orders: List<Order> = emptyList(),
    val error: String? = null,
)

@HiltViewModel
class OrdersViewModel @Inject constructor(
    private val repository: OrdersRepository,
) : ViewModel() {

    private val _uiState = MutableStateFlow(OrdersUiState())
    val uiState: StateFlow<OrdersUiState> = _uiState.asStateFlow()

    init {
        loadOrders()
    }

    fun loadOrders() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = repository.getOrders()) {
                is AppResult.Success -> _uiState.value = OrdersUiState(isLoading = false, orders = result.data)
                is AppResult.Error -> _uiState.value = OrdersUiState(isLoading = false, error = result.message)
            }
        }
    }
}
