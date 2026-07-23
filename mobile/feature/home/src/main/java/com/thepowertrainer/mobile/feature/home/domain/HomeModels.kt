package com.thepowertrainer.mobile.feature.home.domain

data class Banner(
    val id: String,
    val title: String,
    val subtitle: String?,
    val imageUrl: String?,
)

data class HomeCategory(
    val id: String,
    val name: String,
)

/** Mirrors the frontend's `OfferCardsSection` — a promo tile with an image,
 * title/subtitle, and an optional CTA. `buttonLink` is a web route (e.g.
 * `/category/abc`) so mobile doesn't attempt to parse/navigate it directly;
 * tapping a card just routes to Browse, same as tapping a banner. */
data class OfferCard(
    val id: String,
    val title: String,
    val subtitle: String?,
    val imageUrl: String?,
    val buttonText: String?,
)

data class HomeProduct(
    val id: String,
    val name: String,
    val price: Double,
    val offerPrice: Double?,
    val company: String?,
    val images: List<String>,
    val inStock: Boolean,
    val isTrending: Boolean,
    val isPopular: Boolean,
    val isRecommended: Boolean,
) {
    val displayPrice: Double get() = offerPrice?.takeIf { it in 0.0..price } ?: price
    val hasDiscount: Boolean get() = offerPrice != null && offerPrice < price
}

/** Everything the Home feed needs, loaded in one shot. Sections that come
 * back empty (no banners configured yet, no trending products tagged yet...)
 * are handled with in-app fallbacks by the screen — see HomeScreen.kt. */
data class HomeFeed(
    val banners: List<Banner>,
    val categories: List<HomeCategory>,
    val offerCards: List<OfferCard>,
    val trending: List<HomeProduct>,
    val popular: List<HomeProduct>,
    val recommended: List<HomeProduct>,
    val allProducts: List<HomeProduct>,
    /** True when this feed came from the on-device cache (last successful
     * fetch) rather than a live network call — e.g. the device is offline.
     * Drives the "showing saved content" indicator, not an error state. */
    val isFromCache: Boolean = false,
)
