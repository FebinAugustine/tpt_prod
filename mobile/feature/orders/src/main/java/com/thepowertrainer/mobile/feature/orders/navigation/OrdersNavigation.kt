package com.thepowertrainer.mobile.feature.orders.navigation

object OrdersRoutes {
    const val ORDERS = "orders"
    const val ORDER_ID_ARG = "orderId"
    const val ORDER_DETAIL_BASE = "orders/detail"
    const val ORDER_DETAIL = "$ORDER_DETAIL_BASE/{$ORDER_ID_ARG}"

    fun orderDetail(orderId: String) = "$ORDER_DETAIL_BASE/$orderId"
}
