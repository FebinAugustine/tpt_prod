package com.thepowertrainer.mobile.feature.auth.navigation

/**
 * Route constants for :feature:auth. :app's nav host references these by
 * name only — it never imports auth's internal Composables/ViewModels
 * directly beyond what's exposed here, keeping the feature boundary clean.
 */
object AuthRoutes {
    const val SPLASH = "auth/splash"
    const val LOGIN = "auth/login"
    const val REGISTER = "auth/register"
}
