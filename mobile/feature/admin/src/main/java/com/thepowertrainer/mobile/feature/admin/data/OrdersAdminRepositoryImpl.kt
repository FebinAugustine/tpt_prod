package com.thepowertrainer.mobile.feature.admin.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.admin.domain.AdminOrder
import com.thepowertrainer.mobile.feature.admin.domain.OrdersAdminRepository
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class OrdersAdminRepositoryImpl @Inject constructor(
    private val api: OrdersAdminApi,
) : OrdersAdminRepository {

    override suspend fun getOrders(search: String?, status: String?): AppResult<List<AdminOrder>> = safeCall {
        val dto = api.getOrders(search = search, status = status)
        AppResult.Success((dto.items ?: emptyList()).map { it.toDomain() })
    }

    override suspend fun updateOrderStatus(id: String, status: String): AppResult<Unit> = safeCall {
        api.updateOrderStatus(id, UpdateOrderStatusRequest(status))
        AppResult.Success(Unit)
    }

    override suspend fun updatePaymentStatus(id: String, status: String): AppResult<Unit> = safeCall {
        api.updatePaymentStatus(id, UpdatePaymentStatusRequest(status))
        AppResult.Success(Unit)
    }

    private inline fun <T> safeCall(block: () -> AppResult<T>): AppResult<T> = try {
        block()
    } catch (e: HttpException) {
        AppResult.Error(e.message() ?: "Server error", e)
    } catch (e: IOException) {
        AppResult.Error("Network error — check your connection", e)
    } catch (e: Exception) {
        AppResult.Error(e.message ?: "Unknown error", e)
    }

    private fun OrderAdminDto.toDomain() = AdminOrder(
        id = id ?: "",
        customerName = userDisplayName(),
        total = total ?: 0.0,
        paymentMethod = paymentMethod,
        paymentStatus = paymentStatus ?: "pending",
        orderStatus = orderStatus ?: "pending",
        createdAt = createdAt,
    )
}
