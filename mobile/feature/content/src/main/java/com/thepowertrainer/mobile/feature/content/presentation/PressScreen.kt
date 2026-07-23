package com.thepowertrainer.mobile.feature.content.presentation

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.thepowertrainer.mobile.feature.content.domain.PressItem

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PressRoute(
    onBack: () -> Unit,
    viewModel: PressViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text("Press Room") },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
            },
        )
        when {
            uiState.isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator()
            }
            uiState.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(uiState.error!!, color = MaterialTheme.colorScheme.error)
            }
            else -> Column(
                modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp),
            ) {
                Column {
                    Text("About The Power Trainer", style = MaterialTheme.typography.titleMedium)
                    Text(
                        "India's trusted destination for premium fitness supplements. Founded in 2024, " +
                            "headquartered in Kerala, India. 100+ products, 50,000+ satisfied customers, " +
                            "delivering to 500+ cities across India.",
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.padding(top = 6.dp),
                    )
                }

                Column {
                    Text("Press Releases", style = MaterialTheme.typography.titleMedium)
                    if (uiState.pressReleases.isEmpty()) {
                        Text("No press releases yet.", modifier = Modifier.padding(top = 8.dp))
                    } else {
                        Column(modifier = Modifier.padding(top = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            uiState.pressReleases.forEach { PressCard(it) }
                        }
                    }
                }

                Column {
                    Text("Media Coverage", style = MaterialTheme.typography.titleMedium)
                    if (uiState.mediaCoverage.isEmpty()) {
                        Text("No media coverage yet.", modifier = Modifier.padding(top = 8.dp))
                    } else {
                        Column(modifier = Modifier.padding(top = 8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            uiState.mediaCoverage.forEach { PressCard(it) }
                        }
                    }
                }

                Column {
                    Text("Media Inquiries", style = MaterialTheme.typography.titleMedium)
                    Text("Email: supporttpt@gmail.com", modifier = Modifier.padding(top = 6.dp))
                    Text("Phone: +91 9447540035")
                }
            }
        }
    }
}

@Composable
private fun PressCard(item: PressItem) {
    Card(modifier = Modifier.fillMaxWidth()) {
        Column(modifier = Modifier.padding(12.dp)) {
            if (item.publication != null) {
                Text(
                    "${item.publication} • ${item.date}",
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            } else {
                Text(item.date, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.primary)
            }
            Text(item.title, style = MaterialTheme.typography.titleSmall, modifier = Modifier.padding(top = 4.dp))
            Text(item.description, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(top = 4.dp))
        }
    }
}
