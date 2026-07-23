package com.thepowertrainer.mobile.core.designsystem.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = Navy,
    onPrimary = Slate50,
    primaryContainer = Slate200,
    onPrimaryContainer = Navy,
    secondary = GreenDark,
    onSecondary = Color.White,
    secondaryContainer = GreenLight,
    onSecondaryContainer = GreenDark,
    tertiary = Sky,
    onTertiary = Color.White,
    background = Slate50,
    onBackground = Navy,
    surface = Color.White,
    onSurface = Navy,
    surfaceVariant = Slate100,
    onSurfaceVariant = Slate600,
    outline = Slate300,
    outlineVariant = Slate200,
    error = RoseStrong,
    onError = Color.White,
    errorContainer = Color(0xFFFEE2E2),
    onErrorContainer = RoseStrong,
)

private val DarkColorScheme = darkColorScheme(
    primary = Green,
    onPrimary = NavyDarkest,
    primaryContainer = GreenDark,
    onPrimaryContainer = Color.White,
    secondary = Sky,
    onSecondary = NavyDarkest,
    secondaryContainer = NavyLight,
    onSecondaryContainer = Sky,
    tertiary = Emerald,
    onTertiary = NavyDarkest,
    background = NavyDark,
    onBackground = Slate100,
    surface = Navy,
    onSurface = Slate100,
    surfaceVariant = NavyLight,
    onSurfaceVariant = Slate300,
    outline = NavyLight,
    outlineVariant = Navy,
    error = Rose,
    onError = NavyDarkest,
    errorContainer = Color(0xFF7F1D1D),
    onErrorContainer = Rose,
)

/**
 * App-wide Compose theme. Every feature module's UI should be wrapped in
 * this (never define a local MaterialTheme) so branding stays consistent.
 *
 * `dynamicColor` defaults to `false` — this is a real branding fix, not just
 * a style choice: with it `true` (the old default), Android 12+ devices
 * silently replaced the whole brand palette with a wallpaper-derived
 * Material You scheme, so the app never actually showed The Power Trainer's
 * navy/orange identity on most modern phones. Brand consistency wins here.
 */
@Composable
fun TptTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit,
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        shapes = PttShapes,
        content = content,
    )
}
