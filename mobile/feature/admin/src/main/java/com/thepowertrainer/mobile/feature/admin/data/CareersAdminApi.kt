package com.thepowertrainer.mobile.feature.admin.data

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.POST
import retrofit2.http.Path

/** Routes match `CareersController` — GET is public, mutations admin-guarded. */
interface CareersAdminApi {
    @GET("careers")
    suspend fun getCareers(): List<CareerAdminDto>

    @POST("careers")
    suspend fun addCareer(@Body request: CareerRequest): CareerAdminDto

    @PUT("careers/{id}")
    suspend fun updateCareer(@Path("id") id: String, @Body request: CareerRequest): CareerAdminDto

    @DELETE("careers/{id}")
    suspend fun deleteCareer(@Path("id") id: String)
}
