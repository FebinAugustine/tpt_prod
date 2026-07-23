package com.thepowertrainer.mobile.feature.orders.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

interface OrdersRepository {
    suspend fun getOrders(): AppResult<List<Order>>
    suspend fun getOrderById(id: String): AppResult<Order>
}
