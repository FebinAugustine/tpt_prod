package com.thepowertrainer.mobile.feature.admin.data

import kotlinx.serialization.Serializable

/** `GET /settings/upi` returns this raw shape, or a JSON `null` body if UPI
 * has never been configured — see `settings.service.ts`'s `getUpiSettings()`. */
@Serializable
data class UpiSettingsDto(
    val upiId: String? = null,
    val qrCodeUrl: String? = null,
    val merchantName: String? = null,
)

/** `PUT /settings/upi` just returns `{ message: "..." }` on success. */
@Serializable
data class UpiSettingsUpdateResponse(
    val message: String? = null,
)
