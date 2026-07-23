package com.thepowertrainer.mobile.feature.admin.data

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.PUT
import retrofit2.http.POST
import retrofit2.http.Part
import retrofit2.http.Path

/**
 * Routes match `ProductsController`'s admin-guarded CRUD. Create/update send
 * a multipart `product` JSON part plus optional `images` file parts (up to
 * 8, matching the backend's `FilesInterceptor('images', 8, ...)`). Update
 * also sends `keptImageUrls` as a JSON-array text part — the backend treats
 * this as authoritative for which existing images survive (see
 * products.service.ts's updateProduct); omitting new image parts leaves
 * `images` unchanged for whichever URLs are listed as kept.
 */
interface ProductsApi {
    @GET("products")
    suspend fun getProducts(): List<ProductAdminDto>

    @GET("categories")
    suspend fun getCategoriesForProducts(): List<CategoryAdminDto>

    @Multipart
    @POST("products")
    suspend fun addProduct(
        @Part("product") product: RequestBody,
        @Part images: List<MultipartBody.Part>,
    ): ProductAdminDto

    @Multipart
    @PUT("products/{id}")
    suspend fun updateProduct(
        @Path("id") id: String,
        @Part("product") product: RequestBody,
        @Part("keptImageUrls") keptImageUrls: RequestBody,
        @Part images: List<MultipartBody.Part>,
    ): ProductAdminDto

    @DELETE("products/{id}")
    suspend fun deleteProduct(@Path("id") id: String)
}
