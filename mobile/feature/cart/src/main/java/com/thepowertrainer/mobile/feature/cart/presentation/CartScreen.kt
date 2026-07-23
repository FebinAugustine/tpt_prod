package com.thepowertrainer.mobile.feature.cart.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.outlined.ShoppingCart
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.thepowertrainer.mobile.core.designsystem.component.PttImageOrPlaceholder
import com.thepowertrainer.mobile.core.designsystem.component.PttPrimaryButton
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Rose
import com.thepowertrainer.mobile.feature.cart.domain.CartItem

/**
 * Cart screen — redesigned 2026-07-22 as part of the Amazon/Flipkart-style
 * pass across the app's "plain" screens (see CLAUDE.md). Flat tinted-card
 * item rows, a pill quantity stepper, and a raised summary sheet with the
 * shared `PttPrimaryButton` gradient CTA — matching Profile/Home/Catalog's
 * already-restyled look.
 */
@Composable
fun CartRoute(
    onCheckout: () -> Unit,
    viewModel: CartViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()

    CartScreen(
        uiState = uiState,
        onRemove = viewModel::removeFromCart,
        onQuantityChange = viewModel::updateQuantity,
        onCheckout = onCheckout,
    )
}

@Composable
private fun CartScreen(
    uiState: CartUiState,
    onRemove: (String) -> Unit,
    onQuantityChange: (String, Int) -> Unit,
    onCheckout: () -> Unit,
) {
    Scaffold(
        bottomBar = {
            if (uiState.items.isNotEmpty()) {
                CartSummaryBar(uiState = uiState, onCheckout = onCheckout)
            }
        },
    ) { padding ->
        if (uiState.items.isEmpty()) {
            EmptyCart(modifier = Modifier.padding(padding))
        } else {
            Column(modifier = Modifier.fillMaxSize().padding(padding)) {
                Text(
                    "My Bag",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                )
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(uiState.items, key = { it.id }) { item ->
                        CartItemRow(
                            item = item,
                            onRemove = { onRemove(item.id) },
                            onIncrement = { onQuantityChange(item.id, item.quantity + 1) },
                            onDecrement = { onQuantityChange(item.id, item.quantity - 1) },
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun EmptyCart(modifier: Modifier = Modifier) {
    Box(modifier = modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .size(88.dp)
                    .clip(RoundedCornerShape(50))
                    .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.4f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(
                    Icons.Outlined.ShoppingCart,
                    contentDescription = null,
                    tint = MaterialTheme.colorScheme.onSurfaceVariant,
                    modifier = Modifier.size(40.dp),
                )
            }
            Text(
                "Your cart is empty",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(top = 16.dp),
            )
            Text(
                "Items you add to your cart will show up here.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 4.dp),
            )
        }
    }
}

@Composable
private fun CartItemRow(
    item: CartItem,
    onRemove: () -> Unit,
    onIncrement: () -> Unit,
    onDecrement: () -> Unit,
) {
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
                if (!item.inStock) {
                    Text(
                        "Out of stock",
                        color = MaterialTheme.colorScheme.error,
                        style = MaterialTheme.typography.bodySmall,
                    )
                }
                Text(
                    "₹${item.unitPrice}",
                    style = MaterialTheme.typography.titleMedium,
                    color = GreenDark,
                    fontWeight = FontWeight.Bold,
                )

                QuantityStepper(
                    quantity = item.quantity,
                    onIncrement = onIncrement,
                    onDecrement = onDecrement,
                    modifier = Modifier.padding(top = 8.dp),
                )
            }

            IconButton(onClick = onRemove) {
                Icon(Icons.Filled.Close, contentDescription = "Remove from cart", tint = Rose)
            }
        }
    }
}

@Composable
private fun QuantityStepper(
    quantity: Int,
    onIncrement: () -> Unit,
    onDecrement: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(50))
            .background(GreenDark.copy(alpha = 0.10f)),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = onDecrement, modifier = Modifier.size(34.dp)) {
            Icon(Icons.Filled.Remove, contentDescription = "Decrease quantity", tint = GreenDark, modifier = Modifier.size(16.dp))
        }
        Text(
            "$quantity",
            style = MaterialTheme.typography.titleSmall,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 4.dp),
        )
        IconButton(onClick = onIncrement, modifier = Modifier.size(34.dp)) {
            Icon(Icons.Filled.Add, contentDescription = "Increase quantity", tint = GreenDark, modifier = Modifier.size(16.dp))
        }
    }
}

@Composable
private fun CartSummaryBar(uiState: CartUiState, onCheckout: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(elevation = 12.dp, shape = RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
            .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
            .background(MaterialTheme.colorScheme.surface)
            .padding(16.dp),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column {
                Text(
                    "${uiState.totalItems} item(s)",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Text(
                    "₹${uiState.totalPrice}",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                )
            }
        }
        PttPrimaryButton(
            text = "Proceed to Checkout",
            onClick = onCheckout,
            modifier = Modifier.padding(top = 12.dp),
        )
    }
}
