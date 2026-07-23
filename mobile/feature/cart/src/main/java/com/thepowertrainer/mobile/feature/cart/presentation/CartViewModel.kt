package com.thepowertrainer.mobile.feature.cart.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.feature.cart.domain.CartItem
import com.thepowertrainer.mobile.feature.cart.domain.CartRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class CartUiState(
    val items: List<CartItem> = emptyList(),
    val totalItems: Int = 0,
    val totalPrice: Double = 0.0,
)

/** Mirrors frontend/app/store/cartStore.ts's derived getters (getTotalItems/getTotalPrice). */
@HiltViewModel
class CartViewModel @Inject constructor(
    private val repository: CartRepository,
) : ViewModel() {

    val uiState: StateFlow<CartUiState> = repository.observeCart()
        .map { items ->
            CartUiState(
                items = items,
                totalItems = items.sumOf { it.quantity },
                totalPrice = items.sumOf { it.lineTotal },
            )
        }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), CartUiState())

    fun removeFromCart(productId: String) {
        viewModelScope.launch { repository.removeFromCart(productId) }
    }

    fun updateQuantity(productId: String, quantity: Int) {
        viewModelScope.launch { repository.updateQuantity(productId, quantity) }
    }

    fun clearCart() {
        viewModelScope.launch { repository.clearCart() }
    }
}
