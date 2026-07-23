package com.thepowertrainer.mobile.feature.catalog.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Replay
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.thepowertrainer.mobile.core.designsystem.component.PttBadgeTone
import com.thepowertrainer.mobile.core.designsystem.component.PttImageOrPlaceholder
import com.thepowertrainer.mobile.core.designsystem.component.PttPrimaryButton
import com.thepowertrainer.mobile.core.designsystem.component.PttSecondaryButton
import com.thepowertrainer.mobile.core.designsystem.component.PttStatusBadge
import com.thepowertrainer.mobile.core.designsystem.theme.Emerald
import com.thepowertrainer.mobile.core.designsystem.theme.Green
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Sky
import com.thepowertrainer.mobile.feature.catalog.domain.Product

/**
 * Individual product page — redesigned 2026-07-22 for full parity with
 * `frontend/app/product/[id]/page.tsx`: image gallery w/ thumbnail strip,
 * discount/out-of-stock/imported badges, verified-only trainer price,
 * quantity stepper, Add to Cart + Buy Now, and the 4-tab info section
 * (Description / How to Use / When to Use / Additional Info).
 */
@Composable
fun ProductDetailRoute(
    onBuyNow: () -> Unit = {},
    viewModel: ProductDetailViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    val wishlistedIds by viewModel.wishlistedIds.collectAsState()
    val isVerified by viewModel.isVerified.collectAsState()

    LaunchedEffect(uiState.buyNowRequested) {
        if (uiState.buyNowRequested) {
            viewModel.onBuyNowHandled()
            onBuyNow()
        }
    }

    when {
        uiState.isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = GreenDark)
        }

        uiState.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(uiState.error!!, color = MaterialTheme.colorScheme.error)
        }

        uiState.product != null -> ProductDetailContent(
            product = uiState.product!!,
            quantity = uiState.quantity,
            addedToCart = uiState.addedToCart,
            isWishlisted = wishlistedIds.contains(uiState.product!!.id),
            isVerified = isVerified,
            onAddToCart = viewModel::addToCart,
            onBuyNow = viewModel::buyNow,
            onWishlistToggle = viewModel::onWishlistToggle,
            onIncrement = viewModel::incrementQuantity,
            onDecrement = viewModel::decrementQuantity,
        )
    }
}

private enum class DetailTab(val label: String) {
    DESCRIPTION("Description"),
    HOW_TO_USE("How to Use"),
    WHEN_TO_USE("When to Use"),
    ADDITIONAL_INFO("Additional Info"),
}

@Composable
private fun ProductDetailContent(
    product: Product,
    quantity: Int,
    addedToCart: Boolean,
    isWishlisted: Boolean,
    isVerified: Boolean,
    onAddToCart: () -> Unit,
    onBuyNow: () -> Unit,
    onWishlistToggle: () -> Unit,
    onIncrement: () -> Unit,
    onDecrement: () -> Unit,
) {
    var selectedImage by remember { mutableIntStateOf(0) }
    var selectedTab by remember { mutableStateOf(DetailTab.DESCRIPTION) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState()),
    ) {
        // --- Image gallery ---
        Box {
            PttImageOrPlaceholder(
                imageUrl = product.images.getOrNull(selectedImage),
                contentDescription = product.name,
                modifier = Modifier.fillMaxWidth().aspectRatio(1.1f),
            )
            if (!product.inStock) {
                PttStatusBadge(
                    "OUT OF STOCK",
                    tone = PttBadgeTone.DANGER,
                    modifier = Modifier.padding(12.dp).align(Alignment.TopStart),
                )
            }
            if (product.hasDiscount) {
                PttStatusBadge(
                    "${product.discountPercent}% OFF",
                    tone = PttBadgeTone.ACCENT,
                    modifier = Modifier.padding(12.dp).align(Alignment.TopEnd),
                )
            }
        }

        if (product.images.size > 1) {
            LazyRow(
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                items(product.images.size) { index ->
                    val isSelected = index == selectedImage
                    PttImageOrPlaceholder(
                        imageUrl = product.images[index],
                        contentDescription = null,
                        modifier = Modifier
                            .size(64.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .border(
                                width = if (isSelected) 2.dp else 0.dp,
                                color = if (isSelected) GreenDark else androidx.compose.ui.graphics.Color.Transparent,
                                shape = RoundedCornerShape(10.dp),
                            )
                            .clickable { selectedImage = index },
                    )
                }
            }
        }

        Column(modifier = Modifier.padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(product.name, style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
                    product.company?.let {
                        Text("by $it", style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                }
                IconButton(onClick = onWishlistToggle) {
                    Icon(
                        if (isWishlisted) Icons.Filled.Favorite else Icons.Filled.FavoriteBorder,
                        contentDescription = if (isWishlisted) "Remove from wishlist" else "Add to wishlist",
                        tint = if (isWishlisted) MaterialTheme.colorScheme.error else MaterialTheme.colorScheme.onSurfaceVariant,
                    )
                }
            }

            if (product.isImported) {
                PttStatusBadge("IMPORTED", tone = PttBadgeTone.INFO, modifier = Modifier.padding(top = 6.dp))
            }

            // --- Price ---
            Row(modifier = Modifier.padding(top = 14.dp), verticalAlignment = Alignment.Bottom) {
                Text(
                    "₹${product.displayPrice}",
                    style = MaterialTheme.typography.headlineMedium,
                    color = GreenDark,
                    fontWeight = FontWeight.Bold,
                )
                if (product.hasDiscount) {
                    Text(
                        "₹${product.price}",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                        textDecoration = androidx.compose.ui.text.style.TextDecoration.LineThrough,
                        modifier = Modifier.padding(start = 8.dp),
                    )
                }
            }
            Text(
                "Inclusive of all taxes",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            if (isVerified && (product.trainerPrice ?: 0.0) > 0.0) {
                Text(
                    "Trainer Price: ₹${product.trainerPrice}",
                    style = MaterialTheme.typography.titleSmall,
                    color = Emerald,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(top = 4.dp),
                )
            }

            // --- Details list ---
            Column(modifier = Modifier.padding(top = 14.dp)) {
                product.flavour?.let { DetailRow("Flavour", it) }
                product.weight?.let { DetailRow("Weight", it) }
                product.serve?.let { DetailRow("Serves", it) }
                DetailRow(
                    "Availability",
                    if (product.inStock) "In Stock" else "Out of Stock",
                    valueColor = if (product.inStock) Emerald else MaterialTheme.colorScheme.error,
                )
            }

            // --- Quantity stepper ---
            Row(modifier = Modifier.padding(top = 16.dp), verticalAlignment = Alignment.CenterVertically) {
                Text("Quantity", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.Medium, modifier = Modifier.padding(end = 16.dp))
                QuantityStepper(quantity = quantity, onIncrement = onIncrement, onDecrement = onDecrement)
            }

            // --- Actions ---
            Row(
                modifier = Modifier.fillMaxWidth().padding(top = 18.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                PttSecondaryButton(
                    text = when {
                        !product.inStock -> "Out of stock"
                        addedToCart -> "Added ✓"
                        else -> "Add to Cart"
                    },
                    onClick = onAddToCart,
                    enabled = product.inStock,
                    modifier = Modifier.weight(1f),
                )
                PttPrimaryButton(
                    text = "Buy Now",
                    onClick = onBuyNow,
                    enabled = product.inStock,
                    modifier = Modifier.weight(1f),
                )
            }

            TrustRow()

            Spacer(Modifier.height(20.dp))
            DetailTabsSection(product = product, selectedTab = selectedTab, onTabSelected = { selectedTab = it })
        }
    }
}

@Composable
private fun DetailRow(label: String, value: String, valueColor: androidx.compose.ui.graphics.Color = MaterialTheme.colorScheme.onSurface) {
    Row(modifier = Modifier.fillMaxWidth().padding(vertical = 3.dp), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
        Text(value, style = MaterialTheme.typography.bodyMedium, color = valueColor, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun QuantityStepper(quantity: Int, onIncrement: () -> Unit, onDecrement: () -> Unit) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(GreenDark.copy(alpha = 0.10f)),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        IconButton(onClick = onDecrement, modifier = Modifier.size(36.dp)) {
            Text("−", color = GreenDark, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }
        Text("$quantity", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold, modifier = Modifier.padding(horizontal = 8.dp))
        IconButton(onClick = onIncrement, modifier = Modifier.size(36.dp)) {
            Text("+", color = GreenDark, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun TrustRow() {
    Row(
        modifier = Modifier.fillMaxWidth().padding(top = 18.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        TrustItem(Icons.Filled.LocalShipping, Sky, "Free delivery\nabove ₹500")
        TrustItem(Icons.Filled.VerifiedUser, Emerald, "Authentic\nProducts")
        TrustItem(Icons.Filled.Replay, Green, "Easy\nReturns")
    }
}

@Composable
private fun TrustItem(icon: androidx.compose.ui.graphics.vector.ImageVector, color: androidx.compose.ui.graphics.Color, label: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.width(96.dp)) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(22.dp))
        Text(
            label,
            style = MaterialTheme.typography.labelSmall,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 4.dp),
        )
    }
}

@Composable
private fun DetailTabsSection(product: Product, selectedTab: DetailTab, onTabSelected: (DetailTab) -> Unit) {
    Column {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)),
        ) {
            DetailTab.entries.forEach { tab ->
                val selected = tab == selectedTab
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(12.dp))
                        .background(if (selected) GreenDark else androidx.compose.ui.graphics.Color.Transparent)
                        .clickable { onTabSelected(tab) }
                        .padding(vertical = 10.dp),
                    contentAlignment = Alignment.Center,
                ) {
                    Text(
                        tab.label,
                        style = MaterialTheme.typography.labelSmall,
                        color = if (selected) androidx.compose.ui.graphics.Color.White else MaterialTheme.colorScheme.onSurfaceVariant,
                        fontWeight = FontWeight.Medium,
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    )
                }
            }
        }
        Text(
            when (selectedTab) {
                DetailTab.DESCRIPTION -> product.description ?: "No description available."
                DetailTab.HOW_TO_USE -> product.howToUse ?: "No usage instructions available."
                DetailTab.WHEN_TO_USE -> product.whenToUse ?: "No timing recommendations available."
                DetailTab.ADDITIONAL_INFO -> buildAdditionalInfo(product)
            },
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 14.dp, bottom = 24.dp),
        )
    }
}

private fun buildAdditionalInfo(product: Product): String {
    val lines = buildList {
        product.manufacturer?.let { add("Manufacturer: $it") }
        product.company?.let { add("Brand: $it") }
        product.flavour?.let { add("Flavour: $it") }
        product.weight?.let { add("Weight: $it") }
        product.serve?.let { add("Serves: $it") }
    }
    return if (lines.isEmpty()) "No additional information available." else lines.joinToString("\n")
}
