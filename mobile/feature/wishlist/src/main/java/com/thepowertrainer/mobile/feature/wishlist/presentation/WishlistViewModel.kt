package com.thepowertrainer.mobile.feature.wishlist.presentation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.cart.CartGateway
import com.thepowertrainer.mobile.core.common.cart.CartItemInput
import com.thepowertrainer.mobile.feature.wishlist.domain.WishlistItem
import com.thepowertrainer.mobile.feature.wishlist.domain.WishlistRepository
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class WishlistViewModel @Inject constructor(
    private val repository: WishlistRepository,
    private val cartGateway: CartGateway,
) : ViewModel() {

    val items: StateFlow<List<WishlistItem>> = repository.observeWishlist()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), emptyList())

    fun remove(productId: String) {
        viewModelScope.launch { repository.removeFromWishlist(productId) }
    }

    /** "Move to cart" — adds to cart via the same gateway :feature:catalog uses. */
    fun moveToCart(item: WishlistItem) {
        viewModelScope.launch {
            cartGateway.addItem(
                CartItemInput(
                    productId = item.id,
                    name = item.name,
                    price = item.price,
                    offerPrice = item.offerPrice,
                    imageUrl = item.imageUrl,
                    inStock = item.inStock,
                    weight = null,
                    flavour = null,
                ),
            )
            repository.removeFromWishlist(item.id)
        }
    }
}
