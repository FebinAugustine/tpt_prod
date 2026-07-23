package com.thepowertrainer.mobile.feature.home.presentation

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.thepowertrainer.mobile.core.designsystem.component.PttImageOrPlaceholder
import com.thepowertrainer.mobile.core.designsystem.component.PttPrimaryButton
import com.thepowertrainer.mobile.core.designsystem.component.PttProductCard
import com.thepowertrainer.mobile.core.designsystem.component.PttSectionHeader
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Navy
import com.thepowertrainer.mobile.core.designsystem.theme.PttGradients
import com.thepowertrainer.mobile.core.designsystem.theme.Rose
import com.thepowertrainer.mobile.core.designsystem.theme.Slate400
import com.thepowertrainer.mobile.feature.home.domain.Banner
import com.thepowertrainer.mobile.feature.home.domain.HomeCategory
import com.thepowertrainer.mobile.feature.home.domain.HomeProduct
import com.thepowertrainer.mobile.feature.home.domain.OfferCard
import kotlin.math.roundToInt

/**
 * Real ecommerce home feed — banner carousel, shop-by-category, and
 * popular/offer-cards/trending product sections, mirroring the frontend's
 * `user-dashboard` page section-for-section (Banner → Categories → Popular
 * → Offer Cards → Trending). Every section degrades gracefully to an in-app
 * placeholder when the backend hasn't been configured with real content yet
 * (no banners/categories/tagged products), so the screen never looks broken
 * or empty on a fresh install.
 */
@Composable
fun HomeRoute(
    onBrowseProducts: () -> Unit,
    onProductClick: (String) -> Unit,
    onWishlist: () -> Unit,
    onProfile: () -> Unit,
    onAdminPanel: () -> Unit = {},
    viewModel: HomeViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    val isAdmin by viewModel.isAdmin.collectAsState()
    val wishlistedIds by viewModel.wishlistedIds.collectAsState()
    val isOffline by viewModel.isOffline.collectAsState()

    HomeScreen(
        uiState = uiState,
        isAdmin = isAdmin,
        isOffline = isOffline,
        wishlistedIds = wishlistedIds,
        onBrowseProducts = onBrowseProducts,
        onProductClick = onProductClick,
        onWishlist = onWishlist,
        onProfile = onProfile,
        onAdminPanel = onAdminPanel,
        onWishlistToggle = viewModel::onWishlistToggle,
        onRetry = viewModel::loadFeed,
    )
}

@Composable
private fun HomeScreen(
    uiState: HomeUiState,
    isAdmin: Boolean,
    isOffline: Boolean,
    wishlistedIds: Set<String>,
    onBrowseProducts: () -> Unit,
    onProductClick: (String) -> Unit,
    onWishlist: () -> Unit,
    onProfile: () -> Unit,
    onAdminPanel: () -> Unit,
    onWishlistToggle: (HomeProduct) -> Unit,
    onRetry: () -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState()),
    ) {
        HomeHeader(onProfile = onProfile, onWishlist = onWishlist)

        OfflineBanner(visible = isOffline || uiState.isShowingCachedData)

        when {
            uiState.isLoading -> Box(
                Modifier.fillMaxWidth().height(300.dp),
                contentAlignment = Alignment.Center,
            ) { CircularProgressIndicator(color = GreenDark) }

            uiState.error != null -> Box(
                Modifier.fillMaxWidth().padding(32.dp),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(uiState.error, color = MaterialTheme.colorScheme.error)
                    Text(
                        "Tap to retry",
                        color = GreenDark,
                        style = MaterialTheme.typography.labelLarge,
                        modifier = Modifier.padding(top = 8.dp).clickable(onClick = onRetry),
                    )
                }
            }

            else -> {
                BannerCarousel(banners = uiState.banners, onShopNow = onBrowseProducts)

                CategoryRow(categories = uiState.categories, onCategoryClick = { onBrowseProducts() })

                ProductRow(
                    title = "Popular Picks",
                    products = uiState.popular,
                    wishlistedIds = wishlistedIds,
                    onProductClick = onProductClick,
                    onWishlistToggle = onWishlistToggle,
                    onSeeAll = onBrowseProducts,
                )

                OfferCardsSection(offerCards = uiState.offerCards, onCardClick = { onBrowseProducts() })

                ProductRow(
                    title = "Trending Now",
                    products = uiState.trending,
                    wishlistedIds = wishlistedIds,
                    onProductClick = onProductClick,
                    onWishlistToggle = onWishlistToggle,
                    onSeeAll = onBrowseProducts,
                )
            }
        }

        if (isAdmin) {
            PttPrimaryButton(
                text = "Admin Panel",
                onClick = onAdminPanel,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
            )
        }

        // Breathing room after the last product-displaying section, on top
        // of whatever inset the persistent bottom nav bar's Scaffold already
        // reserves — this is purely visual spacing, not clearance.
        Box(Modifier.height(40.dp))
    }
}

@Composable
private fun OfflineBanner(visible: Boolean) {
    AnimatedVisibility(visible = visible, enter = expandVertically(), exit = shrinkVertically()) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 4.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Rose.copy(alpha = 0.14f))
                .padding(horizontal = 12.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Icon(Icons.Filled.CloudOff, contentDescription = null, tint = Rose, modifier = Modifier.size(18.dp))
            Text(
                "No internet connection — showing saved content",
                style = MaterialTheme.typography.labelMedium,
                color = Rose,
                modifier = Modifier.padding(start = 8.dp),
                maxLines = 2,
                overflow = TextOverflow.Ellipsis,
            )
        }
    }
}

@Composable
private fun HomeHeader(onProfile: () -> Unit, onWishlist: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .background(MaterialTheme.colorScheme.background)
            .padding(horizontal = 16.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column {
            Text(
                "The Power Trainer",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
            )
            Text(
                "Fuel your fitness journey",
                style = MaterialTheme.typography.bodySmall,
                color = Slate400,
            )
        }
        Row {
            RoundIconButton(icon = Icons.Filled.FavoriteBorder, onClick = onWishlist)
            Box(Modifier.width(8.dp))
            RoundIconButton(icon = Icons.Filled.Person, onClick = onProfile)
        }
    }
}

@Composable
private fun RoundIconButton(icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .size(40.dp)
            .clip(CircleShape)
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(icon, contentDescription = null, tint = MaterialTheme.colorScheme.onSurface)
    }
}

@Composable
private fun BannerCarousel(banners: List<Banner>, onShopNow: () -> Unit) {
    // Fall back to one branded promo banner when nothing's configured yet in
    // the admin panel, so this section is never a blank strip.
    val effectiveBanners = banners.ifEmpty {
        listOf(Banner(id = "fallback", title = "Fuel Your Fitness Journey", subtitle = "Premium supplements, gear & more", imageUrl = null))
    }
    val pagerState = rememberPagerState(pageCount = { effectiveBanners.size })

    Column(modifier = Modifier.padding(vertical = 8.dp)) {
        HorizontalPager(
            state = pagerState,
            contentPadding = PaddingValues(horizontal = 16.dp),
            pageSpacing = 10.dp,
            modifier = Modifier.fillMaxWidth(),
        ) { page ->
            val banner = effectiveBanners[page]
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(16f / 8f)
                    .clip(RoundedCornerShape(20.dp))
                    .clickable(onClick = onShopNow),
            ) {
                if (!banner.imageUrl.isNullOrBlank()) {
                    PttImageOrPlaceholder(
                        imageUrl = banner.imageUrl,
                        contentDescription = banner.title,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize(),
                    )
                } else {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(PttGradients.primaryButton),
                    )
                }
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(PttGradients.imageScrim),
                )
                Column(
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(16.dp),
                ) {
                    Text(
                        banner.title,
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                    )
                    banner.subtitle?.let {
                        Text(it, style = MaterialTheme.typography.bodyMedium, color = Color.White.copy(alpha = 0.9f))
                    }
                }
            }
        }

        if (effectiveBanners.size > 1) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                horizontalArrangement = Arrangement.Center,
            ) {
                repeat(effectiveBanners.size) { index ->
                    val active = pagerState.currentPage == index
                    Box(
                        modifier = Modifier
                            .padding(horizontal = 3.dp)
                            .size(if (active) 8.dp else 6.dp)
                            .clip(CircleShape)
                            .background(if (active) GreenDark else Slate400.copy(alpha = 0.4f)),
                    )
                }
            }
        }
    }
}

/**
 * Maps a category name to a representative emoji, mirroring the frontend's
 * `CategoriesSection.tsx` `getCategoryIcon()` keyword table exactly (same
 * keys/emoji) so mobile and web read as the same product. This replaces the
 * old bug where every real category rendered the same hardcoded
 * `Icons.Filled.FitnessCenter` vector regardless of its name.
 */
private fun categoryEmoji(name: String): String {
    val n = name.lowercase()
    val iconMap = listOf(
        "whey protein" to "💪", "protein" to "💪", "creatine" to "⚡",
        "pre-workout" to "🔥", "bcaa" to "🏃", "mass gainer" to "🏋️",
        "vitamins" to "💊", "multivitamin" to "💊", "fish oil" to "🐟",
        "omega" to "🐟", "casein" to "🥛", "isoline" to "🥤",
        "amino acids" to "🔬", "glutamine" to "💫", "zma" to "🌙",
        "joint support" to "🦴", "fitness accessories" to "🎒", "shaker" to "🥤",
        "bottles" to "🧴", "gym bag" to "👜", "belts" to "🥋",
        "straps" to "✋", "gloves" to "🧤", "clothing" to "👕",
        "shoes" to "👟", "equipment" to "🏋️", "barbell" to "🏋️",
        "dumbbell" to "🏋️", "plates" to "⚖️", "cardio" to "🚴",
        "treadmill" to "🏃", "bike" to "🚴", "elliptical" to "🏃",
        "accessories" to "🎯",
    )
    return iconMap.firstOrNull { (key, _) -> n.contains(key) }?.second ?: "📦"
}

private val FallbackCategoryNames = listOf("Protein", "Pre-Workout", "Wellness", "Gear")

@Composable
private fun CategoryRow(categories: List<HomeCategory>, onCategoryClick: (HomeCategory?) -> Unit) {
    Column(modifier = Modifier.padding(top = 12.dp)) {
        PttSectionHeader(title = "Shop by Category", modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp))
        LazyRow(
            contentPadding = PaddingValues(horizontal = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            if (categories.isEmpty()) {
                items(FallbackCategoryNames) { name ->
                    CategoryChip(name = name, onClick = { onCategoryClick(null) })
                }
            } else {
                items(categories, key = { it.id }) { category ->
                    CategoryChip(name = category.name, onClick = { onCategoryClick(category) })
                }
            }
        }
    }
}

@Composable
private fun CategoryChip(name: String, onClick: () -> Unit) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(72.dp).clickable(onClick = onClick),
    ) {
        Box(
            modifier = Modifier
                .size(56.dp)
                .clip(CircleShape)
                .background(Navy.copy(alpha = 0.08f)),
            contentAlignment = Alignment.Center,
        ) {
            Text(categoryEmoji(name), style = MaterialTheme.typography.titleLarge)
        }
        Text(
            name,
            style = MaterialTheme.typography.labelMedium,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.padding(top = 6.dp),
        )
    }
}

@Composable
private fun ProductRow(
    title: String,
    products: List<HomeProduct>,
    wishlistedIds: Set<String>,
    onProductClick: (String) -> Unit,
    onWishlistToggle: (HomeProduct) -> Unit,
    onSeeAll: () -> Unit,
) {
    Column(modifier = Modifier.padding(top = 16.dp)) {
        PttSectionHeader(
            title = title,
            actionLabel = "See all",
            onActionClick = onSeeAll,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
        )

        if (products.isEmpty()) {
            EmptyProductsPlaceholder(onSeeAll)
        } else {
            LazyRow(
                contentPadding = PaddingValues(horizontal = 16.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(products.take(10), key = { it.id }) { product ->
                    val discountPercent = if (product.hasDiscount) {
                        (((product.price - product.displayPrice) / product.price) * 100).roundToInt()
                    } else 0
                    PttProductCard(
                        imageUrl = product.images.firstOrNull(),
                        title = product.name,
                        subtitle = product.company,
                        priceLabel = "₹${product.displayPrice.toInt()}",
                        originalPriceLabel = if (product.hasDiscount) "₹${product.price.toInt()}" else null,
                        discountPercent = discountPercent,
                        inStock = product.inStock,
                        isWishlisted = wishlistedIds.contains(product.id),
                        onClick = { onProductClick(product.id) },
                        onWishlistToggle = { onWishlistToggle(product) },
                    )
                }
            }
        }
    }
}

/**
 * Mirrors the frontend's `OfferCardsSection.tsx` — a "Special Offers" tile
 * list, each card a 70/30 image-to-content split. This is the mobile app's
 * third product-adjacent home section (Popular → Offer Cards → Trending),
 * previously missing entirely. Web renders these as a 2-col grid on desktop,
 * 1-col on mobile — mobile here always uses the 1-col layout, so a plain
 * (non-lazy) Column is fine given the small, admin-configured card count.
 */
@Composable
private fun OfferCardsSection(offerCards: List<OfferCard>, onCardClick: (OfferCard) -> Unit) {
    if (offerCards.isEmpty()) return

    Column(modifier = Modifier.padding(top = 16.dp)) {
        PttSectionHeader(
            title = "Special Offers",
            subtitle = "Grab the best deals",
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp),
        )
        Column(
            modifier = Modifier.padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            offerCards.forEach { card ->
                OfferCardTile(card = card, onClick = { onCardClick(card) })
            }
        }
    }
}

@Composable
private fun OfferCardTile(card: OfferCard, onClick: () -> Unit) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .height(112.dp)
            .clip(RoundedCornerShape(18.dp))
            .clickable(onClick = onClick),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f),
        shape = RoundedCornerShape(18.dp),
    ) {
        Row(modifier = Modifier.fillMaxSize()) {
            Box(modifier = Modifier.weight(0.7f).fillMaxSize()) {
                PttImageOrPlaceholder(
                    imageUrl = card.imageUrl,
                    contentDescription = card.title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                )
            }
            Column(
                modifier = Modifier
                    .weight(0.3f)
                    .fillMaxSize()
                    .padding(10.dp),
                verticalArrangement = Arrangement.Center,
            ) {
                Text(
                    card.title,
                    style = MaterialTheme.typography.labelLarge,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                )
                card.subtitle?.let {
                    Text(
                        it,
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.padding(top = 2.dp),
                    )
                }
                card.buttonText?.let {
                    Text(
                        "$it →",
                        style = MaterialTheme.typography.labelSmall,
                        color = GreenDark,
                        fontWeight = FontWeight.SemiBold,
                        modifier = Modifier.padding(top = 4.dp),
                    )
                }
            }
        }
    }
}

@Composable
private fun EmptyProductsPlaceholder(onBrowse: () -> Unit) {
    Surface(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f),
        shape = RoundedCornerShape(16.dp),
    ) {
        Column(
            modifier = Modifier.fillMaxWidth().padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Icon(Icons.Filled.ShoppingBag, contentDescription = null, tint = Slate400, modifier = Modifier.size(36.dp))
            Text(
                "New products coming soon",
                style = MaterialTheme.typography.titleSmall,
                modifier = Modifier.padding(top = 8.dp),
            )
            Text(
                "Check back shortly, or browse the full catalog",
                style = MaterialTheme.typography.bodySmall,
                color = Slate400,
            )
            Text(
                "Browse catalog",
                style = MaterialTheme.typography.labelLarge,
                color = GreenDark,
                modifier = Modifier.padding(top = 10.dp).clickable(onClick = onBrowse),
            )
        }
    }
}
