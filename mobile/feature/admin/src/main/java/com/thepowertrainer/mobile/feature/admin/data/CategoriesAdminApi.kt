package com.thepowertrainer.mobile.feature.admin.data

import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.PUT
import retrofit2.http.POST
import retrofit2.http.Path

/** Routes match `CategoriesController` exactly — GET is public, mutations are admin-guarded. */
interface CategoriesAdminApi {
    @GET("categories")
    suspend fun getCategories(): List<CategoryAdminFullDto>

    @POST("categories")
    suspend fun addCategory(@Body request: CategoryRequest): CategoryAdminFullDto

    @PUT("categories/{id}")
    suspend fun updateCategory(@Path("id") id: String, @Body request: CategoryRequest): CategoryAdminFullDto

    @DELETE("categories/{id}")
    suspend fun deleteCategory(@Path("id") id: String)
}
