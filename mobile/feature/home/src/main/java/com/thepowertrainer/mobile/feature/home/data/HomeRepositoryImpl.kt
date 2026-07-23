package com.thepowertrainer.mobile.feature.home.data

import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.feature.home.data.dto.BannerDto
import com.thepowertrainer.mobile.feature.home.data.dto.HomeCategoryDto
import com.thepowertrainer.mobile.feature.home.data.dto.HomeProductDto
import com.thepowertrainer.mobile.feature.home.data.dto.OfferCardDto
import com.thepowertrainer.mobile.feature.home.domain.Banner
import com.thepowertrainer.mobile.feature.home.domain.HomeCategory
import com.thepowertrainer.mobile.feature.home.domain.HomeFeed
import com.thepowertrainer.mobile.feature.home.domain.HomeProduct
import com.thepowertrainer.mobile.feature.home.domain.HomeRepository
import com.thepowertrainer.mobile.feature.home.domain.OfferCard
import retrofit2.HttpException
import java.io.IOException
import javax.inject.Inject

class HomeRepositoryImpl @Inject constructor(
    private val api: HomeApi,
    private val cache: HomeLocalCache,
) : HomeRepository {

    override suspend fun loadHomeFeed(): AppResult<HomeFeed> = try {
        // Each call is independent — if banners/categories/offer-cards fail
        // but products succeed (or vice versa), still show whatever loaded
        // rather than failing the whole feed. Real backend errors (all down)
        // will surface as an IOException/HttpException below anyway.
        val bannerDtos = runCatching { api.getBanners() }.getOrDefault(emptyList())
        val categoryDtos = runCatching { api.getCategories() }.getOrDefault(emptyList())
        val offerCardDtos = runCatching { api.getOfferCards() }.getOrDefault(emptyList())
        val productDtos = api.getProducts()

        // Cache the raw, successful response so a later offline/failed load
        // (see catch blocks below) has real content to fall back to.
        cache.save(HomeFeedCacheDto(bannerDtos, categoryDtos, offerCardDtos, productDtos))

        AppResult.Success(buildFeed(bannerDtos, categoryDtos, offerCardDtos, productDtos, isFromCache = false))
    } catch (e: HttpException) {
        fromCacheOr(AppResult.Error(e.message() ?: "Server error", e))
    } catch (e: IOException) {
        fromCacheOr(AppResult.Error("No internet connection", e))
    } catch (e: Exception) {
        AppResult.Error(e.message ?: "Unknown error", e)
    }

    /** On a failed live fetch, prefer showing the last-known-good cached
     * feed (marked [HomeFeed.isFromCache]) over a bare error screen. Only
     * falls through to [fallback] when there's genuinely nothing cached yet
     * (e.g. very first launch with no connectivity). */
    private suspend fun fromCacheOr(fallback: AppResult.Error): AppResult<HomeFeed> {
        val cached = cache.load() ?: return fallback
        if (cached.banners.isEmpty() && cached.products.isEmpty()) return fallback
        return AppResult.Success(
            buildFeed(cached.banners, cached.categories, cached.offerCards, cached.products, isFromCache = true),
        )
    }

    private fun buildFeed(
        bannerDtos: List<BannerDto>,
        categoryDtos: List<HomeCategoryDto>,
        offerCardDtos: List<OfferCardDto>,
        productDtos: List<HomeProductDto>,
        isFromCache: Boolean,
    ): HomeFeed {
        val products = productDtos.map { it.toDomain() }
        return HomeFeed(
            banners = bannerDtos.filter { it.isActive != false }
                .sortedBy { it.sortOrder ?: 0 }
                .map { it.toDomain() },
            categories = categoryDtos.filter { it.isActive != false }
                .sortedBy { it.sortOrder ?: 0 }
                .map { it.toDomain() },
            offerCards = offerCardDtos.filter { it.isActive != false }
                .sortedBy { it.sortOrder ?: 0 }
                .mapNotNull { it.toDomainOrNull() },
            trending = products.filter { it.isTrending },
            popular = products.filter { it.isPopular },
            recommended = products.filter { it.isRecommended },
            allProducts = products,
            isFromCache = isFromCache,
        )
    }

    private fun BannerDto.toDomain() = Banner(
        id = id ?: "",
        title = title ?: "",
        subtitle = subtitle,
        imageUrl = image,
    )

    private fun HomeCategoryDto.toDomain() = HomeCategory(
        id = id ?: "",
        name = name ?: "",
    )

    // Requires a real image (matches the backend schema's required `image`
    // field) — a card with no image is malformed data, skip it rather than
    // showing a broken tile.
    private fun OfferCardDto.toDomainOrNull(): OfferCard? {
        if (image.isNullOrBlank()) return null
        return OfferCard(
            id = id ?: "",
            title = title ?: "",
            subtitle = subtitle,
            imageUrl = image,
            buttonText = buttonText,
        )
    }

    private fun HomeProductDto.toDomain() = HomeProduct(
        id = id ?: "",
        name = name ?: "",
        price = price ?: 0.0,
        offerPrice = offerPrice,
        company = company,
        images = images ?: emptyList(),
        inStock = inStock ?: true,
        isTrending = isTrending ?: false,
        isPopular = isPopular ?: false,
        isRecommended = isRecommended ?: false,
    )
}
