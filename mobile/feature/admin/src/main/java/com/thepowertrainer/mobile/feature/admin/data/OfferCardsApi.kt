package com.thepowertrainer.mobile.feature.admin.data

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.PUT
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path

/** Routes match `UIManagerController`'s offer-card endpoints (identical
 * shape to banners, see `AdminUiCard`'s kdoc). */
interface OfferCardsApi {
    @GET("uimanager/offer-cards")
    suspend fun getOfferCards(): List<UiCardDto>

    @Multipart
    @POST("uimanager/offer-cards")
    suspend fun addOfferCard(@Part("offerCard") offerCard: RequestBody, @Part image: MultipartBody.Part?): UiCardDto

    @Multipart
    @PUT("uimanager/offer-cards/{id}")
    suspend fun updateOfferCard(@Path("id") id: String, @Part("offerCard") offerCard: RequestBody, @Part image: MultipartBody.Part?): UiCardDto

    @DELETE("uimanager/offer-cards/{id}")
    suspend fun deleteOfferCard(@Path("id") id: String)
}
