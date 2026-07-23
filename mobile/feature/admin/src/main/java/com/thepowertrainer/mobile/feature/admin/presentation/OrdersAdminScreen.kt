package com.thepowertrainer.mobile.feature.admin.presentation

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.thepowertrainer.mobile.feature.admin.domain.AdminOrder
import com.thepowertrainer.mobile.feature.admin.domain.ORDER_STATUS_OPTIONS
import com.thepowertrainer.mobile.feature.admin.domain.PAYMENT_STATUS_OPTIONS

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OrdersAdminRoute(
    onBack: () -> Unit,
    viewModel: OrdersAdminViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Orders") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                    }
                },
            )
        },
    ) { padding ->
        Column(modifier = Modifier.fillMaxSize().padding(padding)) {
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = viewModel::onSearchQueryChanged,
                label = { Text("Search by order ID or transaction ID") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
            )
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(horizontal = 16.dp),
            ) {
                item {
                    FilterChip(
                        selected = uiState.statusFilter == null,
                        onClick = { viewModel.onStatusFilterChanged(null) },
                        label = { Text("All") },
                    )
                }
                items(ORDER_STATUS_OPTIONS) { status ->
                    FilterChip(
                        selected = uiState.statusFilter == status,
                        onClick = { viewModel.onStatusFilterChanged(status) },
                        label = { Text(status) },
                    )
                }
            }

            when {
                uiState.isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator()
                }
                uiState.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(uiState.error!!, color = MaterialTheme.colorScheme.error)
                }
                uiState.orders.isEmpty() -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("No orders found")
                }
                else -> LazyColumn(
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(uiState.orders, key = { it.id }) { order ->
                        OrderRow(order = order, onClick = { viewModel.openEdit(order) })
                    }
                }
            }
        }
    }

    uiState.editingOrder?.let { order ->
        OrderStatusDialog(
            order = order,
            isSaving = uiState.isSaving,
            onDismiss = viewModel::closeEdit,
            onSave = { orderStatus, paymentStatus -> viewModel.updateStatuses(order.id, orderStatus, paymentStatus) },
        )
    }
}

@Composable
private fun OrderRow(order: AdminOrder, onClick: () -> Unit) {
    Card(onClick = onClick, modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(12.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("#${order.id.takeLast(8)}", style = MaterialTheme.typography.titleSmall)
                Text("₹${order.total}", style = MaterialTheme.typography.titleSmall)
            }
            order.customerName?.let {
                Text(it, style = MaterialTheme.typography.bodySmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            Row(modifier = Modifier.padding(top = 6.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AssistChip(onClick = {}, label = { Text(order.orderStatus) })
                AssistChip(onClick = {}, label = { Text("payment: ${order.paymentStatus}") })
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun OrderStatusDialog(
    order: AdminOrder,
    isSaving: Boolean,
    onDismiss: () -> Unit,
    onSave: (orderStatus: String, paymentStatus: String) -> Unit,
) {
    var orderStatus by remember { mutableStateOf(order.orderStatus) }
    var paymentStatus by remember { mutableStateOf(order.paymentStatus) }
    var orderExpanded by remember { mutableStateOf(false) }
    var paymentExpanded by remember { mutableStateOf(false) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Order #${order.id.takeLast(8)}") },
        text = {
            Column {
                ExposedDropdownMenuBox(expanded = orderExpanded, onExpandedChange = { orderExpanded = it }) {
                    OutlinedTextField(
                        value = orderStatus,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Order status") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = orderExpanded) },
                        modifier = Modifier.menuAnchor(MenuAnchorType.PrimaryNotEditable, enabled = true).fillMaxWidth(),
                    )
                    DropdownMenu(expanded = orderExpanded, onDismissRequest = { orderExpanded = false }) {
                        ORDER_STATUS_OPTIONS.forEach { option ->
                            DropdownMenuItem(text = { Text(option) }, onClick = { orderStatus = option; orderExpanded = false })
                        }
                    }
                }
                ExposedDropdownMenuBox(
                    expanded = paymentExpanded,
                    onExpandedChange = { paymentExpanded = it },
                    modifier = Modifier.padding(top = 8.dp),
                ) {
                    OutlinedTextField(
                        value = paymentStatus,
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Payment status") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = paymentExpanded) },
                        modifier = Modifier.menuAnchor(MenuAnchorType.PrimaryNotEditable, enabled = true).fillMaxWidth(),
                    )
                    DropdownMenu(expanded = paymentExpanded, onDismissRequest = { paymentExpanded = false }) {
                        PAYMENT_STATUS_OPTIONS.forEach { option ->
                            DropdownMenuItem(text = { Text(option) }, onClick = { paymentStatus = option; paymentExpanded = false })
                        }
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = { onSave(orderStatus, paymentStatus) }, enabled = !isSaving) {
                Text(if (isSaving) "Saving..." else "Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
    )
}
