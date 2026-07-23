package com.thepowertrainer.mobile.feature.catalog.presentation

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.cart.CartGateway
import com.thepowertrainer.mobile.core.common.cart.CartItemInput
import com.thepowertrainer.mobile.core.common.result.AppResult
import com.thepowertrainer.mobile.core.common.wishlist.WishlistGateway
import com.thepowertrainer.mobile.core.common.wishlist.WishlistItemInput
import com.thepowertrainer.mobile.core.network.TokenStorage
import com.thepowertrainer.mobile.feature.catalog.domain.CatalogRepository
import com.thepowertrainer.mobile.feature.catalog.domain.Product
import com.thepowertrainer.mobile.feature.catalog.navigation.CatalogRoutes
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ProductDetailUiState(
    val isLoading: Boolean = true,
    val product: Product? = null,
    val error: String? = null,
    val addedToCart: Boolean = false,
    val quantity: Int = 1,
    val buyNowRequested: Boolean = false,
)

@HiltViewModel
class ProductDetailViewModel @Inject constructor(
    private val repository: CatalogRepository,
    private val cartGateway: CartGateway,
    private val wishlistGateway: WishlistGateway,
    private val tokenStorage: TokenStorage,
    savedStateHandle: SavedStateHandle,
) : ViewModel() {

    private val productId: String = checkNotNull(savedStateHandle[CatalogRoutes.PRODUCT_ID_ARG])

    private val _uiState = MutableStateFlow(ProductDetailUiState())
    val uiState: StateFlow<ProductDetailUiState> = _uiState.asStateFlow()

    val wishlistedIds: StateFlow<Set<String>> = wishlistGateway.observeProductIds()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptySet())

    /** Gates trainer-price / offer-price visibility — mirrors the frontend's
     * `user?.isVerified` checks on the product detail page. */
    val isVerified: StateFlow<Boolean> = tokenStorage.isVerifiedFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), false)

    init {
        viewModelScope.launch {
            when (val result = repository.getProductById(productId)) {
                is AppResult.Success -> _uiState.value = ProductDetailUiState(isLoading = false, product = result.data)
                is AppResult.Error -> _uiState.value = ProductDetailUiState(isLoading = false, error = result.message)
            }
        }
    }

    fun incrementQuantity() {
        _uiState.value = _uiState.value.copy(quantity = _uiState.value.quantity + 1)
    }

    fun decrementQuantity() {
        _uiState.value = _uiState.value.copy(quantity = (_uiState.value.quantity - 1).coerceAtLeast(1))
    }

    fun addToCart() {
        val product = _uiState.value.product ?: return
        val quantity = _uiState.value.quantity
        viewModelScope.launch {
            cartGateway.addItem(product.toCartItemInput(), quantity)
            _uiState.value = _uiState.value.copy(addedToCart = true)
        }
    }

    /** Mirrors the frontend's "Buy Now" — adds to cart (if not already added)
     * then the Route composable navigates to Checkout once [ProductDetailUiState.buyNowRequested] flips. */
    fun buyNow() {
        val product = _uiState.value.product ?: return
        val quantity = _uiState.value.quantity
        viewModelScope.launch {
            if (!_uiState.value.addedToCart) {
                cartGateway.addItem(product.toCartItemInput(), quantity)
            }
            _uiState.value = _uiState.value.copy(addedToCart = true, buyNowRequested = true)
        }
    }

    fun onBuyNowHandled() {
        _uiState.value = _uiState.value.copy(buyNowRequested = false)
    }

    private fun Product.toCartItemInput() = CartItemInput(
        productId = id,
        name = name,
        price = price,
        offerPrice = offerPrice,
        imageUrl = images.firstOrNull(),
        inStock = inStock,
        weight = weight,
        flavour = flavour,
    )

    fun onWishlistToggle() {
        val product = _uiState.value.product ?: return
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
