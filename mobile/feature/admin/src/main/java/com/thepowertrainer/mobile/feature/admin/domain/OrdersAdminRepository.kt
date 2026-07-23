package com.thepowertrainer.mobile.feature.admin.domain

import com.thepowertrainer.mobile.core.common.result.AppResult

/** Feature-owned — no shared :core:domain (see root CLAUDE.md Decision #2). */
interface OrdersAdminRepository {
    suspend fun getOrders(search: String? = null, status: String? = null): AppResult<List<AdminOrder>>
    suspend fun updateOrderStatus(id: String, status: String): AppResult<Unit>
    suspend fun updatePaymentStatus(id: String, status: String): AppResult<Unit>
}
