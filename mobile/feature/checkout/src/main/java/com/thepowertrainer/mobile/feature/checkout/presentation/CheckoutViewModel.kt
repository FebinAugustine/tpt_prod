package com.thepowertrainer.mobile.feature.checkout.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.cart.CartGateway
import com.thepowertrainer.mobile.core.common.cart.CartLine
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.checkout.domain.CheckoutRepository
import com.thepowertrainer.mobile.feature.checkout.domain.NewAddressInput
import com.thepowertrainer.mobile.feature.checkout.domain.ShippingAddress
import com.thepowertrainer.mobile.feature.checkout.domain.UpiSettings
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

enum class CheckoutStep { SHIPPING, PAYMENT }

data class CheckoutUiState(
    val step: CheckoutStep = CheckoutStep.SHIPPING,
    val isLoading: Boolean = true,
    val cartItems: List<CartLine> = emptyList(),
    val totalPrice: Double = 0.0,
    val addresses: List<ShippingAddress> = emptyList(),
    val selectedAddressId: String? = null,
    val showNewAddressForm: Boolean = false,
    val upiSettings: UpiSettings? = null,
    val transactionId: String = "",
    val referenceNo: String = "",
    val error: String? = null,
    val isPlacingOrder: Boolean = false,
    val placedOrderId: String? = null,
) {
    val selectedAddress: ShippingAddress?
        get() = addresses.find { it.id == selectedAddressId }

    val canProceedToPayment: Boolean
        get() = selectedAddress != null

    val canPlaceOrder: Boolean
        // Backend's UpiPaymentDetailsDto requires BOTH transactionId and
        // referenceNo (@IsNotEmpty on each) — an empty referenceNo was
        // previously allowed through here (and labeled "optional" in the UI)
        // which made every order with a blank reference number fail with a
        // 400 from the global ValidationPipe. Fixed 2026-07-23.
        get() = transactionId.isNotBlank() && referenceNo.isNotBlank() && selectedAddress != null && cartItems.isNotEmpty()
}

@HiltViewModel
class CheckoutViewModel @Inject constructor(
    private val repository: CheckoutRepository,
    private val cartGateway: CartGateway,
) : ViewModel() {

    private val _uiState = MutableStateFlow(CheckoutUiState())
    val uiState: StateFlow<CheckoutUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    private fun load() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)

            val cartLines = cartGateway.observeItems().first()
            val total = cartLines.sumOf { (it.item.offerPrice ?: it.item.price) * it.quantity }

            val upiResult = repository.getUpiSettings()
            val addressesResult = repository.getAddresses()

            val addresses = (addressesResult as? AppResult.Success)?.data ?: emptyList()
            val defaultAddress = addresses.find { it.isDefault } ?: addresses.firstOrNull()

            _uiState.value = _uiState.value.copy(
                isLoading = false,
                cartItems = cartLines,
                totalPrice = total,
                upiSettings = (upiResult as? AppResult.Success)?.data,
                addresses = addresses,
                selectedAddressId = defaultAddress?.id,
                showNewAddressForm = addresses.isEmpty(),
                error = (addressesResult as? AppResult.Error)?.message,
            )
        }
    }

    fun selectAddress(addressId: String) {
        _uiState.value = _uiState.value.copy(selectedAddressId = addressId, showNewAddressForm = false)
    }

    fun toggleNewAddressForm() {
        _uiState.value = _uiState.value.copy(
            showNewAddressForm = !_uiState.value.showNewAddressForm,
            selectedAddressId = null,
        )
    }

    fun addAddress(input: NewAddressInput) {
        viewModelScope.launch {
            when (val result = repository.addAddress(input)) {
                is AppResult.Success -> {
                    _uiState.value = _uiState.value.copy(
                        addresses = _uiState.value.addresses + result.data,
                        selectedAddressId = result.data.id,
                        showNewAddressForm = false,
                    )
                }
                is AppResult.Error -> {
                    _uiState.value = _uiState.value.copy(error = result.message)
                }
            }
        }
    }

    fun goToPayment() {
        if (_uiState.value.canProceedToPayment) {
            _uiState.value = _uiState.value.copy(step = CheckoutStep.PAYMENT)
        }
    }

    fun backToShipping() {
        _uiState.value = _uiState.value.copy(step = CheckoutStep.SHIPPING)
    }

    fun onTransactionIdChanged(value: String) {
        _uiState.value = _uiState.value.copy(transactionId = value)
    }

    fun onReferenceNoChanged(value: String) {
        _uiState.value = _uiState.value.copy(referenceNo = value)
    }

    fun placeOrder() {
        val state = _uiState.value
        val address = state.selectedAddress ?: return
        if (!state.canPlaceOrder) return

        viewModelScope.launch {
            _uiState.value = state.copy(isPlacingOrder = true, error = null)

            when (
                val result = repository.placeOrder(
                    items = state.cartItems,
                    address = address,
                    transactionId = state.transactionId,
                    referenceNo = state.referenceNo,
                )
            ) {
                is AppResult.Success -> {
                    cartGateway.clear()
                    _uiState.value = _uiState.value.copy(isPlacingOrder = false, placedOrderId = result.data)
                }
                is AppResult.Error -> {
                    _uiState.value = _uiState.value.copy(isPlacingOrder = false, error = result.message)
                }
            }
        }
    }
}
