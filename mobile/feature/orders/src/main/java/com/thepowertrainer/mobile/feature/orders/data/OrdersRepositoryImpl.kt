package com.thepowertrainer.mobile.feature.orders.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.orders.domain.Order
import com.thepowertrainer.mobile.feature.orders.domain.OrderItem
import com.thepowertrainer.mobile.feature.orders.domain.OrderShippingAddress
import com.thepowertrainer.mobile.feature.orders.domain.OrdersRepository
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class OrdersRepositoryImpl @Inject constructor(
    private val api: OrdersApi,
) : OrdersRepository {

    override suspend fun getOrders(): AppResult<List<Order>> = safeCall {
        AppResult.Success(api.getOrders().orders.map { it.toDomain() })
    }

    override suspend fun getOrderById(id: String): AppResult<Order> = safeCall {
        AppResult.Success(api.getOrderById(id).toDomain())
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

    private fun OrderDto.toDomain() = Order(
        id = id,
        items = items.map {
            OrderItem(
                name = it.name ?: "",
                quantity = it.quantity,
                price = it.price,
                offerPrice = it.offerPrice,
                imageUrl = it.images?.firstOrNull(),
            )
        },
        shippingAddress = shippingAddress?.let {
            OrderShippingAddress(
                fullName = it.fullName ?: "",
                phone = it.phone ?: "",
                address = it.address ?: "",
                city = it.city ?: "",
                state = it.state ?: "",
                pincode = it.pincode ?: "",
            )
        },
        subtotal = subtotal,
        shippingCost = shippingCost,
        total = total,
        paymentMethod = paymentMethod ?: "upi",
        paymentStatus = paymentStatus ?: "pending",
        orderStatus = orderStatus ?: "pending",
        upiTransactionId = upiPaymentDetails?.transactionId,
        upiReferenceNo = upiPaymentDetails?.referenceNo,
        createdAt = createdAt,
    )
}
