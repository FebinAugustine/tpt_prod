package com.thepowertrainer.mobile.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.PttGradients

private val ButtonShape = RoundedCornerShape(12.dp)

/**
 * Brand primary CTA — parrot-green gradient with a soft colored shadow,
 * matching the frontend's `.btn-primary` (globals.css). Use for the single
 * dominant action on a screen (Add to Cart, Place Order, Login, Save...).
 */
@Composable
fun PttPrimaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    isLoading: Boolean = false,
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(50.dp)
            .shadow(
                elevation = if (enabled) 10.dp else 0.dp,
                shape = ButtonShape,
                ambientColor = GreenDark.copy(alpha = 0.35f),
                spotColor = GreenDark.copy(alpha = 0.45f),
            )
            .clip(ButtonShape)
            .background(if (enabled) PttGradients.primaryButton else PttGradients.disabledButton)
            .clickable(enabled = enabled && !isLoading, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        if (isLoading) {
            CircularProgressIndicator(
                color = Color.White,
                strokeWidth = 2.dp,
                modifier = Modifier
                    .height(22.dp)
                    .padding(2.dp),
            )
        } else {
            Text(text, color = Color.White, style = MaterialTheme.typography.titleSmall)
        }
    }
}

/** Secondary/outline action — neutral surface, used alongside a primary CTA
 * (e.g. "Continue Shopping" next to "Checkout"). */
@Composable
fun PttSecondaryButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(50.dp)
            .clip(ButtonShape)
            .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.6f))
            .clickable(enabled = enabled, onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text,
            color = MaterialTheme.colorScheme.onSurface,
            style = MaterialTheme.typography.titleSmall,
        )
    }
}

/** Compact pill CTA for inline/card contexts (e.g. "Add" on a product card). */
@Composable
fun PttPillButton(
    text: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
) {
    val shape = RoundedCornerShape(50)
    Row(
        modifier = modifier
            .clip(shape)
            .background(if (enabled) PttGradients.primaryButton else PttGradients.disabledButton)
            .clickable(enabled = enabled, onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.Center,
    ) {
        Text(text, color = Color.White, style = MaterialTheme.typography.labelMedium)
    }
}
