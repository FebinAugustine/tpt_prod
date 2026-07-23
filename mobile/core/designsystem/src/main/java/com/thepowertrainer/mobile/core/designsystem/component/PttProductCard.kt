package com.thepowertrainer.mobile.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Rose
import com.thepowertrainer.mobile.core.designsystem.theme.Slate400

/**
 * Shared premium product card — same visual treatment as
 * `:feature:catalog`'s flagship `ProductCard`, but decoupled from any
 * feature's own `Product` domain model (per root CLAUDE.md Decision #2, a
 * `:core:*` module can't depend on a feature's domain types). Callers pass
 * plain, already-formatted values. Used by `:feature:home`'s trending/popular
 * rows; `:feature:catalog` keeps its own copy today since it predates this
 * one, but could be migrated to call this directly as a later cleanup.
 */
@Composable
fun PttProductCard(
    imageUrl: String?,
    title: String,
    subtitle: String?,
    priceLabel: String,
    originalPriceLabel: String?,
    discountPercent: Int,
    inStock: Boolean,
    isWishlisted: Boolean,
    onClick: () -> Unit,
    onWishlistToggle: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(
        onClick = onClick,
        shape = RoundedCornerShape(18.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = modifier.width(160.dp),
    ) {
        Column {
            Box {
                PttImageOrPlaceholder(
                    imageUrl = imageUrl,
                    contentDescription = title,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier
                        .fillMaxWidth()
                        .aspectRatio(1f)
                        .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)),
                )

                if (discountPercent > 0) {
                    PttStatusBadge(
                        text = "$discountPercent% OFF",
                        tone = PttBadgeTone.ACCENT,
                        modifier = Modifier
                            .align(Alignment.TopStart)
                            .padding(8.dp),
                    )
                }

                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(6.dp)
                        .size(30.dp)
                        .clip(CircleShape)
                        .background(MaterialTheme.colorScheme.surface.copy(alpha = 0.85f))
                        .clickable(onClick = onWishlistToggle),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(
                        if (isWishlisted) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                        contentDescription = "Toggle wishlist",
                        tint = if (isWishlisted) Rose else Slate400,
                        modifier = Modifier.size(16.dp),
                    )
                }
            }
            Column(modifier = Modifier.padding(10.dp)) {
                subtitle?.let {
                    Text(
                        it.uppercase(),
                        style = MaterialTheme.typography.labelSmall,
                        color = Slate400,
                        maxLines = 1,
                    )
                }
                Text(
                    title,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 2,
                    modifier = Modifier.padding(top = 2.dp, bottom = 6.dp),
                )
                if (!inStock) {
                    PttStatusBadge(text = "Out of stock", tone = PttBadgeTone.DANGER)
                } else {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            priceLabel,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = GreenDark,
                        )
                        originalPriceLabel?.let {
                            Text(
                                it,
                                style = MaterialTheme.typography.bodySmall,
                                color = Slate400,
                                textDecoration = TextDecoration.LineThrough,
                                modifier = Modifier.padding(start = 6.dp),
                            )
                        }
                    }
                }
            }
        }
    }
}
