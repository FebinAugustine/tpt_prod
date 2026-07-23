package com.thepowertrainer.mobile.feature.content.presentation

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.Card
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ListItem
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HelpRoute(
    onBack: () -> Unit,
    onFaq: () -> Unit,
    onShipping: () -> Unit,
    onReturns: () -> Unit,
    onCancellation: () -> Unit,
    onPayments: () -> Unit,
) {
    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text("Help Center") },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
            },
        )
        Column(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            HelpLink("FAQ", "Frequently asked questions", onFaq)
            HelpLink("Shipping", "Delivery timelines and process", onShipping)
            HelpLink("Returns & Refunds", "Return eligibility and refund timelines", onReturns)
            HelpLink("Cancellation", "How to cancel an order", onCancellation)
            HelpLink("Payments", "Accepted payment methods", onPayments)
        }
    }
}

@Composable
private fun HelpLink(title: String, subtitle: String, onClick: () -> Unit) {
    Card(onClick = onClick) {
        ListItem(
            headlineContent = { Text(title) },
            supportingContent = { Text(subtitle) },
            trailingContent = { Icon(Icons.Filled.ChevronRight, contentDescription = null) },
        )
    }
}
