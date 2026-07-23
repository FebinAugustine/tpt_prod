package com.thepowertrainer.mobile.feature.home.data

import com.thepowertrainer.mobile.feature.home.data.dto.BannerDto
import com.thepowertrainer.mobile.feature.home.data.dto.HomeCategoryDto
import com.thepowertrainer.mobile.feature.home.data.dto.HomeProductDto
import com.thepowertrainer.mobile.feature.home.data.dto.OfferCardDto
import retrofit2.http.GET

/** Routes match `UIManagerController`/`CategoriesController`/`ProductsController`
 * — all four are public GETs, no auth required. */
interface HomeApi {
    @GET("uimanager/banners")
    suspend fun getBanners(): List<BannerDto>

    @GET("categories")
    suspend fun getCategories(): List<HomeCategoryDto>

    @GET("uimanager/offer-cards")
    suspend fun getOfferCards(): List<OfferCardDto>

    @GET("products")
    suspend fun getProducts(): List<HomeProductDto>
}
