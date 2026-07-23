package com.thepowertrainer.mobile.navigation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.thepowertrainer.mobile.core.designsystem.component.PttBottomNavBar
import com.thepowertrainer.mobile.core.designsystem.component.PttBottomNavTab
import com.thepowertrainer.mobile.feature.addresses.navigation.AddressesRoutes
import com.thepowertrainer.mobile.feature.addresses.presentation.AddressesRoute
import com.thepowertrainer.mobile.feature.admin.navigation.AdminRoutes
import com.thepowertrainer.mobile.feature.admin.presentation.AdminDashboardRoute
import com.thepowertrainer.mobile.feature.admin.presentation.BackupRoute
import com.thepowertrainer.mobile.feature.admin.presentation.BannersRoute
import com.thepowertrainer.mobile.feature.admin.presentation.CareersAdminRoute
import com.thepowertrainer.mobile.feature.admin.presentation.CategoriesAdminRoute
import com.thepowertrainer.mobile.feature.admin.presentation.OfferCardsRoute
import com.thepowertrainer.mobile.feature.admin.presentation.OrdersAdminRoute
import com.thepowertrainer.mobile.feature.admin.presentation.PressAdminRoute
import com.thepowertrainer.mobile.feature.admin.presentation.ProductsRoute
import com.thepowertrainer.mobile.feature.admin.presentation.SettingsAdminRoute
import com.thepowertrainer.mobile.feature.admin.presentation.UsersRoute
import com.thepowertrainer.mobile.feature.auth.navigation.AuthRoutes
import com.thepowertrainer.mobile.feature.auth.presentation.LoginRoute
import com.thepowertrainer.mobile.feature.auth.presentation.RegisterRoute
import com.thepowertrainer.mobile.feature.auth.presentation.SplashRoute
import com.thepowertrainer.mobile.feature.cart.navigation.CartRoutes
import com.thepowertrainer.mobile.feature.cart.presentation.CartRoute
import com.thepowertrainer.mobile.feature.catalog.navigation.CatalogRoutes
import com.thepowertrainer.mobile.feature.catalog.presentation.CatalogRoute
import com.thepowertrainer.mobile.feature.catalog.presentation.ProductDetailRoute
import com.thepowertrainer.mobile.feature.checkout.navigation.CheckoutRoutes
import com.thepowertrainer.mobile.feature.checkout.presentation.CheckoutRoute
import com.thepowertrainer.mobile.feature.catalog.presentation.SearchRoute
import com.thepowertrainer.mobile.feature.content.navigation.ContentRoutes
import com.thepowertrainer.mobile.feature.content.presentation.AboutRoute
import com.thepowertrainer.mobile.feature.content.presentation.CancellationRoute
import com.thepowertrainer.mobile.feature.content.presentation.CareersRoute
import com.thepowertrainer.mobile.feature.content.presentation.ContactRoute
import com.thepowertrainer.mobile.feature.content.presentation.FaqRoute
import com.thepowertrainer.mobile.feature.content.presentation.HelpRoute
import com.thepowertrainer.mobile.feature.content.presentation.PaymentsRoute
import com.thepowertrainer.mobile.feature.content.presentation.PressRoute
import com.thepowertrainer.mobile.feature.content.presentation.PrivacyRoute
import com.thepowertrainer.mobile.feature.content.presentation.ReturnsRoute
import com.thepowertrainer.mobile.feature.content.presentation.ShippingRoute
import com.thepowertrainer.mobile.feature.content.presentation.SitemapRoute
import com.thepowertrainer.mobile.feature.content.presentation.TermsRoute
import com.thepowertrainer.mobile.feature.home.navigation.HomeRoutes
import com.thepowertrainer.mobile.feature.home.presentation.HomeRoute
import com.thepowertrainer.mobile.feature.orders.navigation.OrdersRoutes
import com.thepowertrainer.mobile.feature.orders.presentation.OrderDetailRoute
import com.thepowertrainer.mobile.feature.orders.presentation.OrdersRoute
import com.thepowertrainer.mobile.feature.profile.navigation.ProfileRoutes
import com.thepowertrainer.mobile.feature.profile.presentation.ProfileRoute
import com.thepowertrainer.mobile.feature.wishlist.navigation.WishlistRoutes
import com.thepowertrainer.mobile.feature.wishlist.presentation.WishlistRoute

/**
 * The one place in the whole app that knows about every feature module.
 * Each feature only exposes route constants + a top-level `XRoute`
 * Composable — no feature imports another feature's internals directly.
 *
 * Real start destination is [AuthRoutes.SPLASH]: NavHost requires a static
 * startDestination, but "is the user already logged in" is a suspend check
 * (TokenStorage/DataStore read). SplashRoute resolves that once via
 * SessionViewModel, then navigates to Home or Login with itself popped off
 * the back stack — so the user never sees it again this session and can't
 * navigate back into it.
 *
 * This is also the one `Scaffold` in the app that owns the persistent bottom
 * navigation bar (Amazon/Flipkart/Blinkit-style always-visible tab bar,
 * per Febin's 2026-07-22 request). It's hosted here rather than in
 * `MainActivity` because only the nav host knows the current back stack
 * entry, which is what decides whether the bar shows at all (only on the 5
 * top-level destinations) and which tab reads as selected.
 */
private fun routeToBottomTab(route: String?): PttBottomNavTab? = when (route) {
    HomeRoutes.HOME -> PttBottomNavTab.HOME
    CatalogRoutes.PRODUCT_LIST -> PttBottomNavTab.SHOP
    CartRoutes.CART -> PttBottomNavTab.CART
    WishlistRoutes.WISHLIST -> PttBottomNavTab.WISHLIST
    ProfileRoutes.PROFILE -> PttBottomNavTab.PROFILE
    // Orders and Addresses are reached from Profile, not top-level tabs of
    // their own — but Febin asked for the bottom bar on "all pages" (see
    // web-mobile-app-designer skill invocation, 2026-07-22), and it was
    // still missing on these two specifically. Map them to the PROFILE tab
    // so the bar stays visible (with Profile shown as selected) instead of
    // disappearing entirely on these two screens.
    OrdersRoutes.ORDERS -> PttBottomNavTab.PROFILE
    AddressesRoutes.ADDRESSES -> PttBottomNavTab.PROFILE
    else -> null
}

private fun tabToRoute(tab: PttBottomNavTab): String = when (tab) {
    PttBottomNavTab.HOME -> HomeRoutes.HOME
    PttBottomNavTab.SHOP -> CatalogRoutes.PRODUCT_LIST
    PttBottomNavTab.CART -> CartRoutes.CART
    PttBottomNavTab.WISHLIST -> WishlistRoutes.WISHLIST
    PttBottomNavTab.PROFILE -> ProfileRoutes.PROFILE
}

@Composable
fun AppNavHost(navController: NavHostController = rememberNavController()) {
    val scaffoldViewModel: MainScaffoldViewModel = hiltViewModel()
    val cartItemCount by scaffoldViewModel.cartItemCount.collectAsStateWithLifecycle()
    val wishlistItemCount by scaffoldViewModel.wishlistItemCount.collectAsStateWithLifecycle()

    val backStackEntry by navController.currentBackStackEntryAsState()
    val currentTab = routeToBottomTab(backStackEntry?.destination?.route)

    Scaffold(
        bottomBar = {
            if (currentTab != null) {
                PttBottomNavBar(
                    currentTab = currentTab,
                    cartItemCount = cartItemCount,
                    wishlistItemCount = wishlistItemCount,
                    onTabSelected = { tab ->
                        navController.navigate(tabToRoute(tab)) {
                            popUpTo(navController.graph.findStartDestination().id) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    },
                )
            }
        },
    ) { innerPadding ->
        Box(modifier = Modifier.padding(innerPadding)) {
            AppNavHostContent(navController)
        }
    }
}

@Composable
private fun AppNavHostContent(navController: NavHostController) {
    NavHost(navController = navController, startDestination = AuthRoutes.SPLASH) {
        composable(AuthRoutes.SPLASH) {
            SplashRoute(
                onLoggedIn = { isAdmin ->
                    val destination = if (isAdmin) AdminRoutes.DASHBOARD else HomeRoutes.HOME
                    navController.navigate(destination) {
                        popUpTo(AuthRoutes.SPLASH) { inclusive = true }
                    }
                },
                onLoggedOut = {
                    navController.navigate(AuthRoutes.LOGIN) {
                        popUpTo(AuthRoutes.SPLASH) { inclusive = true }
                    }
                },
            )
        }
        composable(AuthRoutes.LOGIN) {
            LoginRoute(
                onLoginSuccess = { isAdmin ->
                    // Admins land straight on the Admin Dashboard, not the
                    // customer Home feed — mirrors the frontend routing
                    // admins to /admin-dashboard rather than the storefront.
                    val destination = if (isAdmin) AdminRoutes.DASHBOARD else HomeRoutes.HOME
                    navController.navigate(destination) {
                        popUpTo(AuthRoutes.LOGIN) { inclusive = true }
                    }
                },
                onNavigateToRegister = {
                    navController.navigate(AuthRoutes.REGISTER)
                },
            )
        }
        composable(AuthRoutes.REGISTER) {
            RegisterRoute(
                onRegisterSuccess = {
                    // Land back on Login (with a success message would be a
                    // nice follow-up) rather than auto-login — mirrors the
                    // backend: register doesn't return tokens, only login does.
                    navController.navigate(AuthRoutes.LOGIN) {
                        popUpTo(AuthRoutes.REGISTER) { inclusive = true }
                    }
                },
                onNavigateToLogin = { navController.popBackStack() },
            )
        }
        composable(HomeRoutes.HOME) {
            HomeRoute(
                onBrowseProducts = { navController.navigate(CatalogRoutes.PRODUCT_LIST) },
                onProductClick = { productId ->
                    navController.navigate(CatalogRoutes.productDetail(productId))
                },
                onWishlist = { navController.navigate(WishlistRoutes.WISHLIST) },
                onProfile = { navController.navigate(ProfileRoutes.PROFILE) },
                onAdminPanel = { navController.navigate(AdminRoutes.DASHBOARD) },
            )
        }
        composable(CatalogRoutes.PRODUCT_LIST) {
            CatalogRoute(
                onProductClick = { productId ->
                    navController.navigate(CatalogRoutes.productDetail(productId))
                },
                onCartClick = { navController.navigate(CartRoutes.CART) },
                onWishlistClick = { navController.navigate(WishlistRoutes.WISHLIST) },
                onSearchClick = { navController.navigate(CatalogRoutes.SEARCH) },
            )
        }
        composable(CatalogRoutes.SEARCH) {
            SearchRoute(
                onBack = { navController.popBackStack() },
                onProductClick = { productId -> navController.navigate(CatalogRoutes.productDetail(productId)) },
            )
        }
        composable(
            route = CatalogRoutes.PRODUCT_DETAIL,
            arguments = listOf(navArgument(CatalogRoutes.PRODUCT_ID_ARG) { type = NavType.StringType }),
        ) {
            ProductDetailRoute(
                onBuyNow = { navController.navigate(CheckoutRoutes.CHECKOUT) },
            )
        }
        composable(CartRoutes.CART) {
            CartRoute(onCheckout = { navController.navigate(CheckoutRoutes.CHECKOUT) })
        }
        composable(CheckoutRoutes.CHECKOUT) {
            CheckoutRoute(
                onOrderPlaced = { orderId ->
                    // Land straight on the new order's detail screen, mirroring
                    // the frontend's /orders/:id?success=true redirect. Clears
                    // cart/checkout off the back stack so "back" goes to Home.
                    navController.navigate(OrdersRoutes.orderDetail(orderId)) {
                        popUpTo(HomeRoutes.HOME) { inclusive = false }
                    }
                },
            )
        }
        composable(OrdersRoutes.ORDERS) {
            OrdersRoute(
                onOrderClick = { orderId -> navController.navigate(OrdersRoutes.orderDetail(orderId)) },
            )
        }
        composable(
            route = OrdersRoutes.ORDER_DETAIL,
            arguments = listOf(navArgument(OrdersRoutes.ORDER_ID_ARG) { type = NavType.StringType }),
        ) {
            OrderDetailRoute()
        }
        composable(WishlistRoutes.WISHLIST) { WishlistRoute() }
        // WishlistRoute takes no navigation params today — items are moved
        // to cart in place (via CartGateway) rather than navigating away.
        composable(ProfileRoutes.PROFILE) {
            ProfileRoute(
                onLoggedOut = {
                    navController.navigate(AuthRoutes.LOGIN) {
                        popUpTo(HomeRoutes.HOME) { inclusive = true }
                    }
                },
                onOrders = { navController.navigate(OrdersRoutes.ORDERS) },
                onWishlist = { navController.navigate(WishlistRoutes.WISHLIST) },
                onAddresses = { navController.navigate(AddressesRoutes.ADDRESSES) },
                onAbout = { navController.navigate(ContentRoutes.ABOUT) },
                onCareers = { navController.navigate(ContentRoutes.CAREERS) },
                onPress = { navController.navigate(ContentRoutes.PRESS) },
                onHelp = { navController.navigate(ContentRoutes.HELP) },
                onSitemap = { navController.navigate(ContentRoutes.SITEMAP) },
                onPrivacy = { navController.navigate(ContentRoutes.PRIVACY) },
                onTerms = { navController.navigate(ContentRoutes.TERMS) },
                onContact = { navController.navigate(ContentRoutes.CONTACT) },
            )
        }
        composable(AddressesRoutes.ADDRESSES) { AddressesRoute() }

        // Static/legal + dynamic content pages — see root CLAUDE.md Phase 1
        // roadmap. Reached from Profile's "More" section.
        composable(ContentRoutes.CONTACT) { ContactRoute(onBack = { navController.popBackStack() }) }
        composable(ContentRoutes.ABOUT) { AboutRoute(onBack = { navController.popBackStack() }) }
        composable(ContentRoutes.PRIVACY) { PrivacyRoute(onBack = { navController.popBackStack() }) }
        composable(ContentRoutes.TERMS) { TermsRoute(onBack = { navController.popBackStack() }) }
        composable(ContentRoutes.SITEMAP) { SitemapRoute(onBack = { navController.popBackStack() }) }
        composable(ContentRoutes.CAREERS) { CareersRoute(onBack = { navController.popBackStack() }) }
        composable(ContentRoutes.PRESS) { PressRoute(onBack = { navController.popBackStack() }) }
        composable(ContentRoutes.HELP) {
            HelpRoute(
                onBack = { navController.popBackStack() },
                onFaq = { navController.navigate(ContentRoutes.HELP_FAQ) },
                onShipping = { navController.navigate(ContentRoutes.HELP_SHIPPING) },
                onReturns = { navController.navigate(ContentRoutes.HELP_RETURNS) },
                onCancellation = { navController.navigate(ContentRoutes.HELP_CANCELLATION) },
                onPayments = { navController.navigate(ContentRoutes.HELP_PAYMENTS) },
            )
        }
        composable(ContentRoutes.HELP_FAQ) { FaqRoute(onBack = { navController.popBackStack() }) }
        composable(ContentRoutes.HELP_SHIPPING) { ShippingRoute(onBack = { navController.popBackStack() }) }
        composable(ContentRoutes.HELP_RETURNS) { ReturnsRoute(onBack = { navController.popBackStack() }) }
        composable(ContentRoutes.HELP_CANCELLATION) { CancellationRoute(onBack = { navController.popBackStack() }) }
        composable(ContentRoutes.HELP_PAYMENTS) { PaymentsRoute(onBack = { navController.popBackStack() }) }

        // Phase 2 (admin) — see root CLAUDE.md roadmap. Dashboard + Users are
        // fully built; the rest are ComingSoon placeholders being replaced
        // one at a time in the same order the frontend's admin nav lists them.
        composable(AdminRoutes.DASHBOARD) {
            AdminDashboardRoute(
                onBack = { navController.popBackStack() },
                onLoggedOut = {
                    // Clears the entire back stack (popping up to and
                    // including the root graph itself) so there's no way
                    // to navigate "back" into any authenticated screen.
                    navController.navigate(AuthRoutes.LOGIN) {
                        popUpTo(navController.graph.id) { inclusive = true }
                    }
                },
                onUsers = { navController.navigate(AdminRoutes.USERS) },
                onProducts = { navController.navigate(AdminRoutes.PRODUCTS) },
                onOrders = { navController.navigate(AdminRoutes.ORDERS) },
                onCategories = { navController.navigate(AdminRoutes.CATEGORIES) },
                onBanners = { navController.navigate(AdminRoutes.BANNERS) },
                onOfferCards = { navController.navigate(AdminRoutes.OFFER_CARDS) },
                onCareers = { navController.navigate(AdminRoutes.CAREERS) },
                onPress = { navController.navigate(AdminRoutes.PRESS) },
                onUpiSettings = { navController.navigate(AdminRoutes.UPI_SETTINGS) },
                onBackup = { navController.navigate(AdminRoutes.BACKUP) },
            )
        }
        composable(AdminRoutes.USERS) { UsersRoute(onBack = { navController.popBackStack() }) }
        composable(AdminRoutes.PRODUCTS) { ProductsRoute(onBack = { navController.popBackStack() }) }
        composable(AdminRoutes.ORDERS) { OrdersAdminRoute(onBack = { navController.popBackStack() }) }
        composable(AdminRoutes.CATEGORIES) { CategoriesAdminRoute(onBack = { navController.popBackStack() }) }
        composable(AdminRoutes.BANNERS) { BannersRoute(onBack = { navController.popBackStack() }) }
        composable(AdminRoutes.OFFER_CARDS) { OfferCardsRoute(onBack = { navController.popBackStack() }) }
        composable(AdminRoutes.CAREERS) { CareersAdminRoute(onBack = { navController.popBackStack() }) }
        composable(AdminRoutes.PRESS) { PressAdminRoute(onBack = { navController.popBackStack() }) }
        composable(AdminRoutes.UPI_SETTINGS) { SettingsAdminRoute(onBack = { navController.popBackStack() }) }
        composable(AdminRoutes.BACKUP) { BackupRoute(onBack = { navController.popBackStack() }) }
    }
}
