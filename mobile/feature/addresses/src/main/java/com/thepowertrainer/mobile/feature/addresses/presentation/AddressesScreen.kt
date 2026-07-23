package com.thepowertrainer.mobile.feature.addresses.presentation

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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.outlined.StarBorder
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
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
import com.thepowertrainer.mobile.core.designsystem.component.PttStatusBadge
import com.thepowertrainer.mobile.core.designsystem.theme.Amber
import com.thepowertrainer.mobile.core.designsystem.theme.Emerald
import com.thepowertrainer.mobile.core.designsystem.theme.Green
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Rose
import com.thepowertrainer.mobile.feature.addresses.domain.Address
import com.thepowertrainer.mobile.feature.addresses.domain.AddressInput

/**
 * Addresses screen — redesigned 2026-07-22 alongside Cart/Wishlist/Orders/
 * Profile as part of the Amazon/Flipkart-style pass. Flat tinted-card rows
 * with a location icon chip, `PttStatusBadge` for the default flag, and
 * icon-labeled action pills instead of plain `TextButton`s.
 */
@Composable
fun AddressesRoute(
    viewModel: AddressesViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        floatingActionButton = {
            FloatingActionButton(onClick = viewModel::openAddForm, containerColor = Green) {
                Icon(Icons.Filled.Add, contentDescription = "Add address", tint = androidx.compose.ui.graphics.Color.White)
            }
        },
    ) { padding ->
        when {
            uiState.isLoading -> Box(Modifier.fillMaxSize().padding(padding), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = GreenDark)
            }
            uiState.addresses.isEmpty() -> EmptyAddresses(modifier = Modifier.padding(padding))
            else -> Column(modifier = Modifier.fillMaxSize().padding(padding)) {
                Text(
                    "My Addresses",
                    style = MaterialTheme.typography.headlineSmall,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 16.dp, vertical = 12.dp),
                )
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 4.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp),
                ) {
                    items(uiState.addresses, key = { it.id }) { address ->
                        AddressCard(
                            address = address,
                            onEdit = { viewModel.openEditForm(address) },
                            onDelete = { viewModel.delete(address.id) },
                            onSetDefault = { viewModel.setDefault(address.id) },
                        )
                    }
                }
            }
        }
    }

    if (uiState.showForm) {
        AddressFormDialog(
            editing = uiState.editingAddress,
            isSaving = uiState.isSaving,
            errorMessage = uiState.error,
            onDismiss = viewModel::closeForm,
            onSave = viewModel::save,
        )
    }
}

@Composable
private fun EmptyAddresses(modifier: Modifier = Modifier) {
    Box(modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Box(
                modifier = Modifier
                    .size(88.dp)
                    .clip(RoundedCornerShape(50))
                    .background(Emerald.copy(alpha = 0.12f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Filled.LocationOn, contentDescription = null, tint = Emerald, modifier = Modifier.size(40.dp))
            }
            Text(
                "No addresses saved",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(top = 16.dp),
            )
            Text(
                "Add a delivery address to speed up checkout.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 4.dp),
            )
        }
    }
}

@Composable
private fun AddressCard(address: Address, onEdit: () -> Unit, onDelete: () -> Unit, onSetDefault: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.30f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(50))
                        .background(Emerald.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center,
                ) {
                    Icon(Icons.Filled.LocationOn, contentDescription = null, tint = Emerald, modifier = Modifier.size(18.dp))
                }
                Text(
                    address.label,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(start = 10.dp).weight(1f),
                )
                if (address.isDefault) {
                    PttStatusBadge("DEFAULT", tone = PttBadgeTone.ACCENT)
                }
            }
            Text(address.fullName, modifier = Modifier.padding(top = 10.dp), fontWeight = FontWeight.Medium)
            Text(address.address, color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("${address.city}, ${address.state} - ${address.pincode}", color = MaterialTheme.colorScheme.onSurfaceVariant)
            Text("Phone: ${address.phone}", modifier = Modifier.padding(top = 4.dp), color = MaterialTheme.colorScheme.onSurfaceVariant)

            Row(modifier = Modifier.padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                ActionPill("Edit", Icons.Filled.Edit, GreenDark, onEdit)
                if (!address.isDefault) {
                    ActionPill("Set Default", Icons.Outlined.StarBorder, Amber, onSetDefault)
                }
                ActionPill("Delete", Icons.Filled.Delete, Rose, onDelete)
            }
        }
    }
}

@Composable
private fun ActionPill(label: String, icon: androidx.compose.ui.graphics.vector.ImageVector, color: androidx.compose.ui.graphics.Color, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(color.copy(alpha = 0.10f))
            .clickable(onClick = onClick)
            .padding(horizontal = 12.dp, vertical = 7.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(14.dp))
        Text(label, color = color, style = MaterialTheme.typography.labelSmall, fontWeight = FontWeight.Medium, modifier = Modifier.padding(start = 5.dp))
    }
}

@Composable
private fun AddressFormDialog(
    editing: Address?,
    isSaving: Boolean,
    errorMessage: String?,
    onDismiss: () -> Unit,
    onSave: (AddressInput) -> Unit,
) {
    var label by remember { mutableStateOf(editing?.label ?: "") }
    var fullName by remember { mutableStateOf(editing?.fullName ?: "") }
    var phone by remember { mutableStateOf(editing?.phone ?: "") }
    var address by remember { mutableStateOf(editing?.address ?: "") }
    var city by remember { mutableStateOf(editing?.city ?: "") }
    var state by remember { mutableStateOf(editing?.state ?: "") }
    var pincode by remember { mutableStateOf(editing?.pincode ?: "") }
    var isDefault by remember { mutableStateOf(editing?.isDefault ?: false) }

    // Mirrors the backend's CreateAddressDto/UpdateAddressDto class-validator
    // constraints exactly (see address.dto.ts) — without this, a form that
    // looked "complete" (all fields non-blank) could still 400 server-side
    // on a too-short field, with no indication in the UI of which one.
    val validationError = when {
        label.trim().length < 2 -> "Label must be at least 2 characters"
        fullName.trim().length < 2 -> "Full name must be at least 2 characters"
        phone.trim().length < 10 -> "Phone must be at least 10 characters"
        address.trim().length < 5 -> "Address must be at least 5 characters"
        city.trim().length < 2 -> "City must be at least 2 characters"
        state.trim().length < 2 -> "State must be at least 2 characters"
        pincode.trim().length < 3 -> "Pincode must be at least 3 characters"
        else -> null
    }
    val canSave = validationError == null

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(if (editing != null) "Edit Address" else "Add New Address", fontWeight = FontWeight.Bold) },
        text = {
            Column(modifier = Modifier.verticalScroll(rememberScrollState())) {
                errorMessage?.let {
                    Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(bottom = 8.dp))
                }
                val allFieldsTouched = listOf(label, fullName, phone, address, city, state, pincode).all { it.isNotBlank() }
                if (allFieldsTouched && validationError != null) {
                    Text(validationError, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall, modifier = Modifier.padding(bottom = 8.dp))
                }
                OutlinedTextField(label, { label = it }, label = { Text("Label") }, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(fullName, { fullName = it }, label = { Text("Full name") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
                OutlinedTextField(phone, { phone = it }, label = { Text("Phone") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
                OutlinedTextField(address, { address = it }, label = { Text("Address") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
                OutlinedTextField(city, { city = it }, label = { Text("City") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
                OutlinedTextField(state, { state = it }, label = { Text("State") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
                OutlinedTextField(pincode, { pincode = it }, label = { Text("Pincode") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
                Row(modifier = Modifier.padding(top = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(checked = isDefault, onCheckedChange = { isDefault = it }, colors = androidx.compose.material3.CheckboxDefaults.colors(checkedColor = GreenDark))
                    Text("Set as default address")
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onSave(AddressInput(label, fullName, phone, address, city, state, pincode, isDefault)) },
                enabled = canSave && !isSaving,
                colors = ButtonDefaults.buttonColors(containerColor = GreenDark),
            ) {
                Text(if (isSaving) "Saving..." else "Save")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        },
    )
}
