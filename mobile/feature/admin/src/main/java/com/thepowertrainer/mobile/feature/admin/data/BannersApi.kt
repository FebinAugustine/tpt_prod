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

/** Routes match `UIManagerController`'s banner endpoints. Multipart "banner"
 * JSON part + optional "image" file part, mirroring the frontend's FormData shape. */
interface BannersApi {
    @GET("uimanager/banners")
    suspend fun getBanners(): List<UiCardDto>

    @Multipart
    @POST("uimanager/banners")
    suspend fun addBanner(@Part("banner") banner: RequestBody, @Part image: MultipartBody.Part?): UiCardDto

    @Multipart
    @PUT("uimanager/banners/{id}")
    suspend fun updateBanner(@Path("id") id: String, @Part("banner") banner: RequestBody, @Part image: MultipartBody.Part?): UiCardDto

    @DELETE("uimanager/banners/{id}")
    suspend fun deleteBanner(@Path("id") id: String)
}
