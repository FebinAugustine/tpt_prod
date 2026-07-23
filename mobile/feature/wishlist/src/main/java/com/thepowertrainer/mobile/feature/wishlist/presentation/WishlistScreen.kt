package com.thepowertrainer.mobile.feature.wishlist.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.thepowertrainer.mobile.core.designsystem.component.PttImageOrPlaceholder
import com.thepowertrainer.mobile.core.designsystem.component.PttPillButton
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Rose
import com.thepowertrainer.mobile.feature.wishlist.domain.WishlistItem

/**
 * Wishlist screen — redesigned 2026-07-22 alongside Cart/Profile as part of
 * the Amazon/Flipkart-style pass. Same flat-card house style, shared
 * `PttImageOrPlaceholder` for image fallback, `PttPillButton` for the
 * "Move to cart" action instead of a plain filled `Button`.
 */
@Composable
fun WishlistRoute(
    viewModel: WishlistViewModel = hiltViewModel(),
) {
    val items by viewModel.items.collectAsState()

    if (items.isEmpty()) {
        EmptyWishlist()
        return
    }

    Column(modifier = Modifier.fillMaxSize()) {
        Text(
            "My Wishlist",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
        )
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            items(items, key = { it.id }) { item ->
                WishlistItemRow(
                    item = item,
                    onRemove = { viewModel.remove(item.id) },
                    onMoveToCart = { viewModel.moveToCart(item) },
                )
            }
        }
    }
}

@Composable
private fun EmptyWishlist() {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .size(88.dp)
                    .clip(RoundedCornerShape(50))
                    .background(Rose.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    Icons.Filled.FavoriteBorder,
                    contentDescription = null,
                    tint = Rose,
                    modifier = Modifier.size(40.dp),
                )
            }
            Text(
                "Your wishlist is empty",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(top = 16.dp),
            )
            Text(
                "Tap the heart on any product to save it here.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 4.dp),
            )
        }
    }
}

@Composable
private fun WishlistItemRow(item: WishlistItem, onRemove: () -> Unit, onMoveToCart: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.30f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Row(modifier = Modifier.padding(10.dp), verticalAlignment = Alignment.CenterVertically) {
            PttImageOrPlaceholder(
                imageUrl = item.imageUrl,
                contentDescription = item.name,
                modifier = Modifier
                    .width(76.dp)
                    .aspectRatio(1f)
                    .clip(RoundedCornerShape(12.dp)),
            )
            Column(modifier = Modifier.padding(start = 12.dp).weight(1f)) {
                Text(item.name, style = MaterialTheme.typography.titleSmall, maxLines = 2, fontWeight = FontWeight.Medium)
                Text(
                    "₹${item.displayPrice}",
                    style = MaterialTheme.typography.titleMedium,
                    color = GreenDark,
                    fontWeight = FontWeight.Bold,
                )
                if (!item.inStock) {
                    Text("Out of stock", color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
                } else {
                    PttPillButton(
                        text = "Move to cart",
                        onClick = onMoveToCart,
                        modifier = Modifier.padding(top = 8.dp),
                    )
                }
            }
            IconButton(onClick = onRemove) {
                Icon(Icons.Filled.Close, contentDescription = "Remove from wishlist", tint = Rose)
            }
        }
    }
}
