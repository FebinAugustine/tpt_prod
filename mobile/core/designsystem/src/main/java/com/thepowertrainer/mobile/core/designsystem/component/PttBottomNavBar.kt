package com.thepowertrainer.mobile.core.designsystem.component

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material.icons.filled.Storefront
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material.icons.outlined.Storefront
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import com.thepowertrainer.mobile.core.designsystem.theme.Green

/** One tab in the bottom nav — [route] is whatever string route the host's
 * NavController expects, so this component stays navigation-library-agnostic
 * (per Decision #2, :core:designsystem has no nav dependency). */
enum class PttBottomNavTab(
    val route: String,
    val label: String,
    val filledIcon: ImageVector,
    val outlinedIcon: ImageVector,
) {
    HOME("home", "Home", Icons.Filled.Home, Icons.Outlined.Home),
    SHOP("shop", "Shop", Icons.Filled.Storefront, Icons.Outlined.Storefront),
    CART("cart", "Cart", Icons.Filled.ShoppingCart, Icons.Outlined.ShoppingCart),
    WISHLIST("wishlist", "Wishlist", Icons.Filled.Favorite, Icons.Filled.FavoriteBorder),
    PROFILE("profile", "Profile", Icons.Filled.Person, Icons.Outlined.Person),
}

/**
 * Persistent bottom navigation — Amazon/Flipkart/Blinkit-style always-visible
 * tab bar for the app's 5 top-level customer destinations. The host (`:app`'s
 * `AppNavHost`) decides which real nav routes map to [PttBottomNavTab.route]
 * and only renders this on top-level screens (hidden on detail/checkout/
 * admin/content screens, where a back arrow is the right affordance instead).
 */
@Composable
fun PttBottomNavBar(
    currentTab: PttBottomNavTab?,
    cartItemCount: Int,
    wishlistItemCount: Int,
    onTabSelected: (PttBottomNavTab) -> Unit,
) {
    NavigationBar(
        containerColor = MaterialTheme.colorScheme.surface,
        tonalElevation = 0.dp,
    ) {
        PttBottomNavTab.entries.forEach { tab ->
            val selected = tab == currentTab
            val badgeCount = when (tab) {
                PttBottomNavTab.CART -> cartItemCount
                PttBottomNavTab.WISHLIST -> wishlistItemCount
                else -> 0
            }
            NavigationBarItem(
                selected = selected,
                onClick = { onTabSelected(tab) },
                icon = {
                    if (badgeCount > 0) {
                        BadgedBox(badge = { Badge(containerColor = Green) { Text("$badgeCount") } }) {
                            Icon(
                                if (selected) tab.filledIcon else tab.outlinedIcon,
                                contentDescription = tab.label,
                            )
                        }
                    } else {
                        Icon(
                            if (selected) tab.filledIcon else tab.outlinedIcon,
                            contentDescription = tab.label,
                        )
                    }
                },
                label = { Text(tab.label) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Green,
                    selectedTextColor = Green,
                    indicatorColor = Green.copy(alpha = 0.14f),
                ),
            )
        }
    }
}
