package com.thepowertrainer.mobile.feature.content.presentation

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

/**
 * Reusable scaffold for the app's static/legal content pages (About, Privacy,
 * Terms, Shipping/Returns/Cancellation/Payments help pages). Each of these is
 * plain informational text on the frontend with no backend endpoint — mirrors
 * that exactly by hardcoding the same copy, just laid out for a phone screen
 * instead of replicating the desktop grid/table layouts verbatim.
 */
data class ContentSection(val heading: String, val body: String)

private const val CONTACT_EMAIL = "supporttpt@gmail.com"
private const val CONTACT_PHONE = "+91 9447540035"
private const val CONTACT_HOURS = "Mon-Sat, 9AM-6PM"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun StaticContentScreen(
    title: String,
    subtitle: String?,
    sections: List<ContentSection>,
    onBack: () -> Unit,
    showContactFooter: Boolean = true,
) {
    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text(title) },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
            },
        )
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            subtitle?.let {
                Text(it, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
            sections.forEach { section ->
                Column {
                    Text(section.heading, style = MaterialTheme.typography.titleMedium)
                    Text(
                        section.body,
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.padding(top = 6.dp),
                    )
                }
            }
            if (showContactFooter) {
                HorizontalDivider()
                Column {
                    Text("Contact Us", style = MaterialTheme.typography.titleMedium)
                    Text("Email: $CONTACT_EMAIL", modifier = Modifier.padding(top = 6.dp))
                    Text("Phone: $CONTACT_PHONE")
                    Text("Hours: $CONTACT_HOURS")
                }
            }
        }
    }
}
