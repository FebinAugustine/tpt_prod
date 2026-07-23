package com.thepowertrainer.mobile.feature.checkout.presentation

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.QrCode2
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.thepowertrainer.mobile.core.designsystem.component.PttPrimaryButton
import com.thepowertrainer.mobile.core.designsystem.component.PttSecondaryButton
import com.thepowertrainer.mobile.core.designsystem.component.PttStatusBadge
import com.thepowertrainer.mobile.core.designsystem.component.PttBadgeTone
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Rose
import com.thepowertrainer.mobile.core.designsystem.theme.Slate400
import com.thepowertrainer.mobile.feature.checkout.domain.NewAddressInput
import com.thepowertrainer.mobile.feature.checkout.domain.ShippingAddress

@Composable
fun CheckoutRoute(
    onOrderPlaced: (String) -> Unit,
    viewModel: CheckoutViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.placedOrderId) {
        uiState.placedOrderId?.let(onOrderPlaced)
    }

    when {
        uiState.placedOrderId != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = GreenDark)
        }
        uiState.isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = GreenDark)
        }
        uiState.step == CheckoutStep.SHIPPING -> ShippingStep(uiState, viewModel)
        else -> PaymentStep(uiState, viewModel)
    }
}

@Composable
private fun CheckoutStepHeader(title: String, stepLabel: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Text(title, style = MaterialTheme.typography.titleLarge, fontWeight = FontWeight.Bold)
        PttStatusBadge(text = stepLabel, tone = PttBadgeTone.ACCENT)
    }
}

@Composable
private fun ShippingStep(uiState: CheckoutUiState, viewModel: CheckoutViewModel) {
    Column(
        modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
    ) {
        CheckoutStepHeader("Shipping Address", "Step 1 of 2")

        uiState.error?.let {
            Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 8.dp))
        }

        if (!uiState.showNewAddressForm && uiState.addresses.isNotEmpty()) {
            Column(modifier = Modifier.padding(top = 16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                uiState.addresses.forEach { addr ->
                    AddressOption(
                        address = addr,
                        selected = uiState.selectedAddressId == addr.id,
                        onSelect = { viewModel.selectAddress(addr.id ?: "") },
                    )
                }
            }
            PttSecondaryButton(
                text = "+ Add a new address",
                onClick = viewModel::toggleNewAddressForm,
                modifier = Modifier.padding(top = 12.dp),
            )
        } else {
            NewAddressForm(onSubmit = viewModel::addAddress)
        }

        PttPrimaryButton(
            text = "Continue to Payment",
            onClick = viewModel::goToPayment,
            enabled = uiState.canProceedToPayment,
            modifier = Modifier.padding(top = 24.dp),
        )
    }
}

@Composable
private fun AddressOption(address: ShippingAddress, selected: Boolean, onSelect: () -> Unit) {
    val tint = if (selected) GreenDark else Slate400
    Card(
        onClick = onSelect,
        shape = RoundedCornerShape(16.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (selected) GreenDark.copy(alpha = 0.10f) else MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f),
        ),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(modifier = Modifier.fillMaxWidth().padding(14.dp), verticalAlignment = Alignment.Top) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(tint.copy(alpha = 0.16f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(Icons.Filled.LocationOn, contentDescription = null, tint = tint, modifier = Modifier.size(18.dp))
            }
            Column(modifier = Modifier.padding(start = 12.dp).weight(1f)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(address.label, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                    if (selected) {
                        Icon(
                            Icons.Filled.CheckCircle,
                            contentDescription = "Selected",
                            tint = GreenDark,
                            modifier = Modifier.padding(start = 6.dp).size(16.dp),
                        )
                    }
                }
                Text(
                    "${address.fullName} — ${address.phone}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate400,
                    modifier = Modifier.padding(top = 2.dp),
                )
                Text(
                    "${address.address}, ${address.city}, ${address.state} - ${address.pincode}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Slate400,
                    modifier = Modifier.padding(top = 2.dp),
                )
            }
        }
    }
}

private val fieldColors: androidx.compose.material3.TextFieldColors
    @Composable get() = OutlinedTextFieldDefaults.colors(focusedBorderColor = GreenDark)

@Composable
private fun NewAddressForm(onSubmit: (NewAddressInput) -> Unit) {
    var label by remember { mutableStateOf("Home") }
    var fullName by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var address by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var state by remember { mutableStateOf("") }
    var pincode by remember { mutableStateOf("") }

    Column(modifier = Modifier.padding(top = 16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
        OutlinedTextField(label, { label = it }, label = { Text("Label (e.g. Home)") }, colors = fieldColors, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(fullName, { fullName = it }, label = { Text("Full name") }, colors = fieldColors, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(phone, { phone = it }, label = { Text("Phone") }, colors = fieldColors, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(address, { address = it }, label = { Text("Address") }, colors = fieldColors, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(city, { city = it }, label = { Text("City") }, colors = fieldColors, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(state, { state = it }, label = { Text("State") }, colors = fieldColors, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(pincode, { pincode = it }, label = { Text("Pincode") }, colors = fieldColors, modifier = Modifier.fillMaxWidth())

        val canSave = fullName.isNotBlank() && phone.isNotBlank() && address.isNotBlank() &&
            city.isNotBlank() && state.isNotBlank() && pincode.isNotBlank()

        PttPrimaryButton(
            text = "Save address",
            onClick = { onSubmit(NewAddressInput(label, fullName, phone, address, city, state, pincode)) },
            enabled = canSave,
            modifier = Modifier.padding(top = 4.dp),
        )
    }
}

@Composable
private fun FlatSectionCard(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Card(
        shape = RoundedCornerShape(18.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)),
        modifier = modifier.fillMaxWidth(),
    ) {
        Column(modifier = Modifier.padding(16.dp), content = { content() })
    }
}

@Composable
private fun PaymentStep(uiState: CheckoutUiState, viewModel: CheckoutViewModel) {
    Column(
        modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
    ) {
        CheckoutStepHeader("Payment", "Step 2 of 2")
        Text(
            "Scan the UPI QR code to pay, then enter the transaction details below",
            style = MaterialTheme.typography.bodySmall,
            color = Slate400,
            modifier = Modifier.padding(top = 4.dp),
        )

        FlatSectionCard(modifier = Modifier.padding(top = 16.dp)) {
            Text("Order Summary", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            uiState.cartItems.forEach { line ->
                Row(
                    modifier = Modifier.fillMaxWidth().padding(top = 10.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                ) {
                    Text(
                        "${line.item.name} x ${line.quantity}",
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.weight(1f),
                    )
                    Text(
                        "₹${(line.item.offerPrice ?: line.item.price) * line.quantity}",
                        style = MaterialTheme.typography.bodyMedium,
                        fontWeight = FontWeight.SemiBold,
                    )
                }
            }
            HorizontalDivider(modifier = Modifier.padding(vertical = 10.dp))
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text("Total", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
                Text(
                    "₹${uiState.totalPrice}",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = GreenDark,
                )
            }
        }

        val upi = uiState.upiSettings
        FlatSectionCard(modifier = Modifier.padding(top = 12.dp)) {
            if (upi != null) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Filled.QrCode2, contentDescription = null, tint = GreenDark, modifier = Modifier.size(20.dp))
                    Text(
                        "Scan QR to pay",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(start = 8.dp),
                    )
                }
                val qrBitmap = rememberQrCodeBitmap(upi.buildPaymentUri(uiState.totalPrice))
                Box(modifier = Modifier.fillMaxWidth().padding(top = 14.dp), contentAlignment = Alignment.Center) {
                    Surface(
                        color = Color.White,
                        shape = RoundedCornerShape(16.dp),
                        modifier = Modifier.padding(4.dp),
                    ) {
                        if (qrBitmap != null) {
                            Image(
                                bitmap = qrBitmap,
                                contentDescription = "UPI payment QR code",
                                modifier = Modifier.size(220.dp).padding(12.dp),
                            )
                        }
                    }
                }
                Text(
                    upi.merchantName,
                    style = MaterialTheme.typography.bodyMedium,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.padding(top = 10.dp),
                )
                Text("Pay amount: ₹${uiState.totalPrice}", style = MaterialTheme.typography.bodySmall, color = Slate400)
            } else {
                Text(
                    "UPI payment isn't configured yet. Please contact support to complete this order.",
                    color = Rose,
                )
            }

            Column(modifier = Modifier.fillMaxWidth().padding(top = 16.dp)) {
                Text("Enter payment details after paying", style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
                OutlinedTextField(
                    value = uiState.transactionId,
                    onValueChange = viewModel::onTransactionIdChanged,
                    label = { Text("Transaction ID / UPI Ref No.") },
                    colors = fieldColors,
                    modifier = Modifier.fillMaxWidth().padding(top = 10.dp),
                )
                OutlinedTextField(
                    value = uiState.referenceNo,
                    onValueChange = viewModel::onReferenceNoChanged,
                    label = { Text("Reference / UTR number") },
                    colors = fieldColors,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                )
            }
        }

        uiState.error?.let {
            Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 12.dp))
        }

        PttPrimaryButton(
            text = if (uiState.isPlacingOrder) "Placing order..." else "Place Order (₹${uiState.totalPrice})",
            onClick = viewModel::placeOrder,
            enabled = uiState.canPlaceOrder && !uiState.isPlacingOrder,
            isLoading = uiState.isPlacingOrder,
            modifier = Modifier.padding(top = 20.dp),
        )

        PttSecondaryButton(
            text = "Back to shipping",
            onClick = viewModel::backToShipping,
            modifier = Modifier.padding(top = 8.dp),
        )
    }
}
