package com.thepowertrainer.mobile.feature.orders.data

import retrofit2.http.GET
import retrofit2.http.Path

interface OrdersApi {

    @GET("orders")
    suspend fun getOrders(): OrdersListResponseDto

    @GET("orders/{id}")
    suspend fun getOrderById(@Path("id") id: String): OrderDto
}
