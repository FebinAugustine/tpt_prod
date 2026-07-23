package com.thepowertrainer.mobile.feature.checkout.data

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface CheckoutApi {

    @GET("settings/upi")
    suspend fun getUpiSettings(): UpiSettingsDto

    @GET("addresses")
    suspend fun getAddresses(): List<AddressDto>

    @POST("addresses")
    suspend fun addAddress(@Body request: CreateAddressRequest): AddressDto

    @POST("orders")
    suspend fun createOrder(@Body request: CreateOrderRequest): OrderResponseDto
}
