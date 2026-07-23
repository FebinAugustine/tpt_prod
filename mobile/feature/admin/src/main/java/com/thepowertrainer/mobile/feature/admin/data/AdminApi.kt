package com.thepowertrainer.mobile.feature.admin.data

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.POST
import retrofit2.http.Query

/** Routes match `AuthController`'s admin-guarded endpoints exactly. All
 * require `Authorization: Bearer` + role=admin — enforced server-side by
 * `JwtAuthGuard`+`AdminGuard`; the client-side gate (HomeViewModel's
 * isAdmin check) is a UX convenience, not the real security boundary. */
interface AdminApi {
    @GET("auth/stats")
    suspend fun getDashboardStats(): DashboardStatsDto

    @GET("auth/users")
    suspend fun getUsers(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20,
        @Query("search") search: String? = null,
    ): PaginatedUsersDto

    @POST("auth/add-user")
    suspend fun addUser(@Body request: AddUserRequest): AdminUserDto

    @PUT("auth/users/{id}")
    suspend fun updateUser(@Path("id") id: String, @Body request: UpdateUserRequest): AdminUserDto

    @DELETE("auth/users/{id}")
    suspend fun deleteUser(@Path("id") id: String)
}
