package com.thepowertrainer.mobile.feature.home.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.core.common.wishlist.WishlistGateway
import com.thepowertrainer.mobile.core.common.wishlist.WishlistItemInput
import com.thepowertrainer.mobile.core.network.ConnectivityObserver
import com.thepowertrainer.mobile.core.network.TokenStorage
import com.thepowertrainer.mobile.feature.home.domain.Banner
import com.thepowertrainer.mobile.feature.home.domain.HomeCategory
import com.thepowertrainer.mobile.feature.home.domain.HomeProduct
import com.thepowertrainer.mobile.feature.home.domain.HomeRepository
import com.thepowertrainer.mobile.feature.home.domain.OfferCard
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class HomeUiState(
    val isLoading: Boolean = true,
    val error: String? = null,
    val banners: List<Banner> = emptyList(),
    val categories: List<HomeCategory> = emptyList(),
    val trending: List<HomeProduct> = emptyList(),
    val popular: List<HomeProduct> = emptyList(),
    val offerCards: List<OfferCard> = emptyList(),
    /** True when the currently-shown feed is the last cached copy (network
     * fetch failed) rather than a fresh load — drives the "showing saved
     * content" note, distinct from [isOffline] which reflects live radio
     * state and can flip back to false before a reload happens. */
    val isShowingCachedData: Boolean = false,
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val repository: HomeRepository,
    private val wishlistGateway: WishlistGateway,
    connectivityObserver: ConnectivityObserver,
    tokenStorage: TokenStorage,
) : ViewModel() {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    val isAdmin: StateFlow<Boolean> = tokenStorage.roleFlow
        .map { it == "admin" }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), false)

    val wishlistedIds: StateFlow<Set<String>> = wishlistGateway.observeProductIds()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptySet())

    /** Live connectivity state — shown as a banner over the carousel. This
     * is independent of [HomeUiState.isShowingCachedData]: the device can
     * come back online while a stale/cached feed is still on screen until
     * the next [loadFeed] call replaces it. */
    val isOffline: StateFlow<Boolean> = connectivityObserver.isOnline
        .map { online -> !online }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), false)

    init {
        loadFeed()
    }

    fun loadFeed() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            when (val result = repository.loadHomeFeed()) {
                is AppResult.Success -> _uiState.value = HomeUiState(
                    isLoading = false,
                    banners = result.data.banners,
                    categories = result.data.categories,
                    offerCards = result.data.offerCards,
                    // Fall back to "popular"/"all" when a section's tag is
                    // unused so the feed never renders visibly empty rows.
                    trending = result.data.trending.ifEmpty { result.data.popular.ifEmpty { result.data.allProducts } },
                    popular = result.data.popular.ifEmpty { result.data.recommended.ifEmpty { result.data.allProducts } },
                    isShowingCachedData = result.data.isFromCache,
                )
                is AppResult.Error -> _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    error = result.message,
                )
            }
        }
    }

    fun onWishlistToggle(product: HomeProduct) {
        viewModelScope.launch {
            wishlistGateway.toggle(
                WishlistItemInput(
                    productId = product.id,
                    name = product.name,
                    price = product.price,
                    offerPrice = product.offerPrice,
                    imageUrl = product.images.firstOrNull(),
                    inStock = product.inStock,
                ),
            )
        }
    }
}
