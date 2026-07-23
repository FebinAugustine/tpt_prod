package com.thepowertrainer.mobile.feature.admin.data

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

/** Routes match `OrdersController`'s admin-guarded branch. `GET orders`'s
 * response shape is admin-paginated ({items,total,page,totalPages,...}) here
 * — distinct from the non-admin branch :feature:orders reads. */
interface OrdersAdminApi {
    @GET("orders")
    suspend fun getOrders(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("search") search: String? = null,
        @Query("status") status: String? = null,
    ): PaginatedOrdersDto

    @PUT("orders/{id}/status")
    suspend fun updateOrderStatus(@Path("id") id: String, @Body request: UpdateOrderStatusRequest)

    @PUT("orders/{id}/payment")
    suspend fun updatePaymentStatus(@Path("id") id: String, @Body request: UpdatePaymentStatusRequest)
}
