package com.thepowertrainer.mobile.feature.checkout.domain

import com.thepowertrainer.mobile.core.common.cart.CartLine
import com.thepowertrainer.mobile.core.common.result.AppResult

interface CheckoutRepository {

    /** Success(null) means no admin has configured UPI settings yet — not an error. */
    suspend fun getUpiSettings(): AppResult<UpiSettings?>

    suspend fun getAddresses(): AppResult<List<ShippingAddress>>

    suspend fun addAddress(input: NewAddressInput): AppResult<ShippingAddress>

    suspend fun placeOrder(
        items: List<CartLine>,
        address: ShippingAddress,
        transactionId: String,
        referenceNo: String,
    ): AppResult<String>
}
