package com.thepowertrainer.mobile.feature.orders.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
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
import com.thepowertrainer.mobile.core.designsystem.component.PttBadgeTone
import com.thepowertrainer.mobile.core.designsystem.component.PttStatusBadge
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Sky
import com.thepowertrainer.mobile.feature.orders.domain.Order

/**
 * Orders list + Order detail — redesigned 2026-07-22 as part of the
 * Amazon/Flipkart-style pass. Flat tinted-card rows with real status
 * badges (`PttStatusBadge`, mapped from the order/payment status strings
 * via [statusTone]) instead of plain colored text.
 */
@Composable
fun OrdersRoute(
    onOrderClick: (String) -> Unit,
    viewModel: OrdersViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()

    when {
        uiState.isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = GreenDark)
        }
        uiState.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(uiState.error!!, color = MaterialTheme.colorScheme.error)
                Text(
                    "Tap to retry",
                    color = GreenDark,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(top = 8.dp).clickable(onClick = viewModel::loadOrders),
                )
            }
        }
        uiState.orders.isEmpty() -> EmptyOrders()
        else -> Column(modifier = Modifier.fillMaxSize()) {
            Text(
                "My Orders",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
            )
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(uiState.orders, key = { it.id }) { order ->
                    OrderRow(order = order, onClick = { onOrderClick(order.id) })
                }
            }
        }
    }
}

@Composable
private fun EmptyOrders() {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .size(88.dp)
                    .clip(RoundedCornerShape(50))
                    .background(Sky.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Filled.Receipt, contentDescription = null, tint = Sky, modifier = Modifier.size(40.dp))
            }
            Text(
                "No orders yet",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(top = 16.dp),
            )
            Text(
                "Start shopping to see your orders here.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 4.dp),
            )
        }
    }
}

@Composable
private fun OrderRow(order: Order, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.30f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Order #${order.shortId}", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                Text("₹${order.total}", style = MaterialTheme.typography.titleSmall, color = GreenDark, fontWeight = FontWeight.Bold)
            }
            Row(modifier = Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                PttStatusBadge(order.orderStatus.uppercase(), tone = statusTone(order.orderStatus))
                PttStatusBadge(order.paymentStatus.uppercase(), tone = statusTone(order.paymentStatus))
            }
            Text(
                "${order.items.size} item(s) — ${order.paymentMethod.uppercase()}",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 8.dp),
            )
        }
    }
}

/** Maps a raw order/payment status string to a semantic badge tone. Shared
 * with [OrderDetailScreen] (same package). */
internal fun statusTone(status: String): PttBadgeTone = when (status.lowercase()) {
    "delivered", "paid", "completed" -> PttBadgeTone.SUCCESS
    "cancelled", "failed", "refunded" -> PttBadgeTone.DANGER
    "shipped", "processing" -> PttBadgeTone.INFO
    "pending" -> PttBadgeTone.WARNING
    else -> PttBadgeTone.INFO
}
