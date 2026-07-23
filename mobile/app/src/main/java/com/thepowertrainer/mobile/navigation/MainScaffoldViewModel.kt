package com.thepowertrainer.mobile.navigation

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.thepowertrainer.mobile.core.common.cart.CartGateway
import com.thepowertrainer.mobile.core.common.wishlist.WishlistGateway
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import javax.inject.Inject

/**
 * `:app`-level ViewModel purely for the persistent bottom nav bar's badge
 * counts. Lives here (not in any single feature) because it needs both
 * `:feature:cart`'s and `:feature:wishlist`'s counts at once — `:app` is the
 * one place in the module graph allowed to know about every feature (see
 * root CLAUDE.md's "AppNavHost is the one place that knows about every
 * feature module" note). No business logic here, just count observation.
 */
@HiltViewModel
class MainScaffoldViewModel @Inject constructor(
    cartGateway: CartGateway,
    wishlistGateway: WishlistGateway,
) : ViewModel() {

    val cartItemCount: StateFlow<Int> = cartGateway.observeItemCount()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), 0)

    val wishlistItemCount: StateFlow<Int> = wishlistGateway.observeItemCount()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), 0)
}
