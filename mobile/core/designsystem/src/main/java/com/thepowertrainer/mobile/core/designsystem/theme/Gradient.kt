package com.thepowertrainer.mobile.core.designsystem.theme

import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color

/** Reusable brand gradients/brushes — kept alongside the color tokens so
 * every screen pulls the exact same gradient rather than hand-rolling one. */
object PttGradients {
    /** Parrot-green CTA gradient (135deg-equivalent, GreenDark -> Green),
     * replacing the old warm-orange `.btn-primary` gradient. */
    val primaryButton = Brush.linearGradient(listOf(GreenDark, Green))

    /** Disabled/neutral fill for buttons that use the gradient shape but no CTA color. */
    val disabledButton = Brush.linearGradient(listOf(Slate300, Slate300))

    /** Subtle bottom-to-top scrim for image overlays (product hero, banners). */
    val imageScrim = Brush.verticalGradient(listOf(Color.Transparent, NavyDarkest.copy(alpha = 0.55f)))
}
