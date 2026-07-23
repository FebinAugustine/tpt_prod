package com.thepowertrainer.mobile.feature.orders.presentation

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.orders.domain.Order
import com.thepowertrainer.mobile.feature.orders.domain.OrdersRepository
import com.thepowertrainer.mobile.feature.orders.navigation.OrdersRoutes
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class OrderDetailUiState(
    val isLoading: Boolean = true,
    val order: Order? = null,
    val error: String? = null,
)

@HiltViewModel
class OrderDetailViewModel @Inject constructor(
    private val repository: OrdersRepository,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val orderId: String = checkNotNull(savedStateHandle[OrdersRoutes.ORDER_ID_ARG])

    private val _uiState = MutableStateFlow(OrderDetailUiState())
    val uiState: StateFlow<OrderDetailUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = repository.getOrderById(orderId)) {
                is AppResult.Success -> _uiState.value = OrderDetailUiState(isLoading = false, order = result.data)
                is AppResult.Error -> _uiState.value = OrderDetailUiState(isLoading = false, error = result.message)
            }
        }
    }
}
