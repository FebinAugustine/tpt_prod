package com.thepowertrainer.mobile.feature.admin.data

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.Part
import retrofit2.http.PUT

/** Routes match `SettingsController`. Unlike Banners/Offer Cards/Products,
 * `PUT /settings/upi` does NOT take a single JSON payload part — the backend
 * reads `upiId`/`merchantName`/`qrCodeUrl` as plain top-level `@Body()` form
 * fields alongside the `qrCodeImage` file part (see settings.controller.ts),
 * so each is its own multipart text part here. */
interface SettingsAdminApi {
    @GET("settings/upi")
    suspend fun getUpiSettings(): UpiSettingsDto?

    @Multipart
    @PUT("settings/upi")
    suspend fun setUpiSettings(
        @Part("upiId") upiId: RequestBody,
        @Part("merchantName") merchantName: RequestBody,
        @Part("qrCodeUrl") qrCodeUrl: RequestBody?,
        @Part qrCodeImage: MultipartBody.Part?,
    ): UpiSettingsUpdateResponse
}
