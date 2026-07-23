package com.thepowertrainer.mobile.feature.orders.presentation

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.thepowertrainer.mobile.core.designsystem.component.PttStatusBadge
import com.thepowertrainer.mobile.core.designsystem.theme.Emerald
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Sky
import com.thepowertrainer.mobile.feature.orders.domain.Order

@Composable
fun OrderDetailRoute(
    viewModel: OrderDetailViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()

    when {
        uiState.isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = GreenDark)
        }
        uiState.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(uiState.error!!, color = MaterialTheme.colorScheme.error)
        }
        uiState.order != null -> OrderDetailContent(uiState.order!!)
    }
}

@Composable
private fun OrderDetailContent(order: Order) {
    Column(
        modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
    ) {
        Text("Order #${order.shortId}", style = MaterialTheme.typography.headlineSmall, fontWeight = FontWeight.Bold)
        order.createdAt?.let {
            Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
        }

        DetailCard(icon = Icons.Filled.Payments, iconTint = Sky, modifier = Modifier.padding(top = 16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Payment", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                PttStatusBadge(order.paymentStatus.uppercase(), tone = statusTone(order.paymentStatus))
            }
            order.upiTransactionId?.let {
                Text("Transaction ID: $it", style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(top = 6.dp))
            }
            order.upiReferenceNo?.takeIf { it.isNotBlank() }?.let {
                Text("Reference No: $it", style = MaterialTheme.typography.bodySmall)
            }
        }

        DetailCard(icon = Icons.Filled.LocalShipping, iconTint = Emerald, modifier = Modifier.padding(top = 12.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text("Order Status", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                PttStatusBadge(order.orderStatus.uppercase(), tone = statusTone(order.orderStatus))
            }
        }

        DetailCard(icon = Icons.Filled.ShoppingBag, iconTint = GreenDark, modifier = Modifier.padding(top = 12.dp)) {
            Text("Items", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            order.items.forEach { item ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Column {
                        Text(item.name, style = MaterialTheme.typography.bodyMedium)
                        Text("Qty: ${item.quantity}", style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    }
                    Text("₹${item.lineTotal}", fontWeight = FontWeight.Medium)
                }
            }
            HorizontalDivider(modifier = Modifier.padding(vertical = 12.dp))
            SummaryRow("Subtotal", order.subtotal)
            SummaryRow("Shipping", order.shippingCost)
            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp))
            SummaryRow("Total", order.total, emphasize = true)
        }

        order.shippingAddress?.let { address ->
            Card(
                modifier = Modifier.fillMaxWidth().padding(top = 12.dp, bottom = 16.dp),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.30f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text("Shipping Address", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
                    Text(address.fullName, modifier = Modifier.padding(top = 8.dp), fontWeight = FontWeight.Medium)
                    Text(address.address, color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("${address.city}, ${address.state} - ${address.pincode}", color = MaterialTheme.colorScheme.onSurfaceVariant)
                    Text("Phone: ${address.phone}", modifier = Modifier.padding(top = 4.dp), color = MaterialTheme.colorScheme.onSurfaceVariant)
                }
            }
        }
    }
}

@Composable
private fun DetailCard(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    iconTint: androidx.compose.ui.graphics.Color,
    modifier: Modifier = Modifier,
    content: @Composable androidx.compose.foundation.layout.ColumnScope.() -> Unit,
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.30f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Row(modifier = Modifier.padding(16.dp)) {
            Box(
                modifier = Modifier
                    .size(30.dp),
                contentAlignment = Alignment.Center,
            ) {
                Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(20.dp))
            }
            Column(modifier = Modifier.padding(start = 8.dp).fillMaxWidth(), content = content)
        }
    }
}

@Composable
private fun SummaryRow(label: String, amount: Double, emphasize: Boolean = false) {
    Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(
            label,
            style = if (emphasize) MaterialTheme.typography.titleMedium else MaterialTheme.typography.bodyMedium,
            fontWeight = if (emphasize) FontWeight.Bold else FontWeight.Normal,
        )
        Text(
            "₹$amount",
            style = if (emphasize) MaterialTheme.typography.titleMedium else MaterialTheme.typography.bodyMedium,
            color = if (emphasize) GreenDark else MaterialTheme.colorScheme.onSurface,
            fontWeight = if (emphasize) FontWeight.Bold else FontWeight.Normal,
        )
    }
}
