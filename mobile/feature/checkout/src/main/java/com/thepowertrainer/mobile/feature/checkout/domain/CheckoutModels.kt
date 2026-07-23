package com.thepowertrainer.mobile.feature.checkout.domain

data class UpiSettings(
    val upiId: String,
    val qrCodeUrl: String?,
    val merchantName: String,
) {
    /** Same "upi://pay?..." deep-link format the frontend builds with qrcode.react. */
    fun buildPaymentUri(amount: Double): String {
        val encodedPa = java.net.URLEncoder.encode(upiId, "UTF-8")
        val encodedPn = java.net.URLEncoder.encode(merchantName, "UTF-8")
        val am = String.format(java.util.Locale.US, "%.2f", amount)
        return "upi://pay?pa=$encodedPa&pn=$encodedPn&am=$am&cu=INR"
    }
}

data class ShippingAddress(
    val id: String?,
    val label: String,
    val fullName: String,
    val phone: String,
    val address: String,
    val city: String,
    val state: String,
    val pincode: String,
    val isDefault: Boolean,
)

data class NewAddressInput(
    val label: String,
    val fullName: String,
    val phone: String,
    val address: String,
    val city: String,
    val state: String,
    val pincode: String,
)
