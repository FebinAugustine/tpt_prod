package com.thepowertrainer.mobile.feature.admin.domain

/** A `null` [upiId] means UPI has never been configured (matches the
 * backend returning a bare JSON `null` from `GET /settings/upi`). */
data class AdminUpiSettings(
    val upiId: String?,
    val qrCodeUrl: String?,
    val merchantName: String?,
)

data class UpiSettingsInput(
    val upiId: String,
    val merchantName: String,
)
