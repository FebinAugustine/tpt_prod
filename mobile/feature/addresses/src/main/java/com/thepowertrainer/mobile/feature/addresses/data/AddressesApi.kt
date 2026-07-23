package com.thepowertrainer.mobile.feature.addresses.data

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.POST
import retrofit2.http.Path

interface AddressesApi {

    @GET("addresses")
    suspend fun getAddresses(): List<AddressDto>

    @POST("addresses")
    suspend fun addAddress(@Body request: AddressRequest): AddressDto

    @PUT("addresses/{id}")
    suspend fun updateAddress(@Path("id") id: String, @Body request: AddressRequest): AddressDto

    @DELETE("addresses/{id}")
    suspend fun deleteAddress(@Path("id") id: String)

    // Matches the backend's actual route (AddressesController: @Put(':id/default')).
    // Note: the frontend's authApi.setDefaultAddress calls "/addresses/{id}/set-default",
    // which doesn't match this — a pre-existing frontend bug, not replicated here.
    @PUT("addresses/{id}/default")
    suspend fun setDefaultAddress(@Path("id") id: String): AddressDto
}
