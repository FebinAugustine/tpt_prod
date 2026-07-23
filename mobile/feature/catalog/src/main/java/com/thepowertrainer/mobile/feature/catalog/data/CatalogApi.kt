package com.thepowertrainer.mobile.feature.catalog.data

import com.thepowertrainer.mobile.feature.catalog.data.dto.CategoryDto
import com.thepowertrainer.mobile.feature.catalog.data.dto.ProductDto
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

/** Routes match `ProductsController`/`CategoriesController` exactly. */
interface CatalogApi {
    @GET("products")
    suspend fun getProducts(): List<ProductDto>

    @GET("products/{id}")
    suspend fun getProductById(@Path("id") id: String): ProductDto

    @GET("products/search")
    suspend fun searchProducts(@Query("q") query: String, @Query("limit") limit: Int = 10): List<ProductDto>

    @GET("categories")
    suspend fun getCategories(): List<CategoryDto>
}
