package com.thepowertrainer.mobile.feature.admin.presentation

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.PickVisualMediaRequest
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import coil3.compose.AsyncImage
import com.thepowertrainer.mobile.core.designsystem.component.PttPrimaryButton
import com.thepowertrainer.mobile.core.designsystem.component.PttSecondaryButton
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Slate400
import com.thepowertrainer.mobile.feature.admin.domain.PickedImage
import com.thepowertrainer.mobile.feature.admin.domain.UpiSettingsInput

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsAdminRoute(
    onBack: () -> Unit,
    viewModel: SettingsAdminViewModel = hiltViewModel(),
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()

    var upiId by remember(uiState.settings) { mutableStateOf(uiState.settings?.upiId ?: "") }
    var merchantName by remember(uiState.settings) { mutableStateOf(uiState.settings?.merchantName ?: "") }
    var pickedUri by remember { mutableStateOf<Uri?>(null) }

    val pickMedia = rememberLauncherForActivityResult(ActivityResultContracts.PickVisualMedia()) { uri ->
        pickedUri = uri
    }

    LaunchedEffect(uiState.saveSuccess) {
        if (uiState.saveSuccess) {
            pickedUri = null
            viewModel.clearSaveSuccess()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("UPI Settings") },
                navigationIcon = { IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back") } },
            )
        },
    ) { padding ->
        Box(modifier = Modifier.fillMaxSize().padding(padding)) {
            when {
                uiState.isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
                uiState.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text(uiState.error!!, color = MaterialTheme.colorScheme.error)
                }
                else -> Column(modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp)) {
                    Text(
                        "Configure the UPI ID and QR code customers see at checkout.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Slate400,
                    )

                    uiState.saveError?.let {
                        Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(top = 12.dp))
                    }

                    val previewModel = pickedUri ?: uiState.settings?.qrCodeUrl?.takeIf { it.isNotBlank() }
                    if (previewModel != null) {
                        Surface(
                            color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f),
                            shape = RoundedCornerShape(16.dp),
                            modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
                        ) {
                            AsyncImage(
                                model = previewModel,
                                contentDescription = "QR code preview",
                                modifier = Modifier.fillMaxWidth().height(220.dp).padding(16.dp),
                            )
                        }
                    }
                    PttSecondaryButton(
                        text = if (previewModel != null) "Change QR code" else "Pick QR code image",
                        onClick = { pickMedia.launch(PickVisualMediaRequest(ActivityResultContracts.PickVisualMedia.ImageOnly)) },
                        modifier = Modifier.padding(top = 8.dp),
                    )

                    OutlinedTextField(
                        value = upiId,
                        onValueChange = { upiId = it },
                        label = { Text("UPI ID") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GreenDark),
                        modifier = Modifier.fillMaxWidth().padding(top = 16.dp),
                    )
                    OutlinedTextField(
                        value = merchantName,
                        onValueChange = { merchantName = it },
                        label = { Text("Merchant name") },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(focusedBorderColor = GreenDark),
                        modifier = Modifier.fillMaxWidth().padding(top = 8.dp),
                    )

                    PttPrimaryButton(
                        text = if (uiState.isSaving) "Saving..." else "Save",
                        onClick = {
                            val uri = pickedUri
                            val image = if (uri != null) {
                                val bytes = context.contentResolver.openInputStream(uri)?.use { it.readBytes() }
                                val mimeType = context.contentResolver.getType(uri) ?: "image/jpeg"
                                bytes?.let { PickedImage(it, "qrcode.${mimeType.substringAfterLast('/')}", mimeType) }
                            } else null
                            viewModel.save(UpiSettingsInput(upiId.trim(), merchantName.trim()), image)
                        },
                        enabled = !uiState.isSaving && upiId.isNotBlank() && merchantName.isNotBlank(),
                        isLoading = uiState.isSaving,
                        modifier = Modifier.padding(top = 20.dp, bottom = 24.dp),
                    )
                }
            }
        }
    }
}
