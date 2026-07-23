package com.thepowertrainer.mobile.feature.admin.data

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.POST
import retrofit2.http.Path

/** Routes match `PressController` — GET is public, mutations admin-guarded. */
interface PressAdminApi {
    @GET("press")
    suspend fun getPress(): List<PressAdminDto>

    @POST("press")
    suspend fun addPress(@Body request: PressRequest): PressAdminDto

    @PUT("press/{id}")
    suspend fun updatePress(@Path("id") id: String, @Body request: PressRequest): PressAdminDto

    @DELETE("press/{id}")
    suspend fun deletePress(@Path("id") id: String)
}
