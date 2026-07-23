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
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

private data class SitemapGroup(val title: String, val items: List<String>)

/**
 * Mirrors the frontend's /sitemap page. Since this is a link directory rather
 * than a functional screen, and several of its targets (admin pages) aren't
 * built for mobile yet (see root CLAUDE.md Phase 2), this renders as a plain
 * read-only index rather than live navigation links.
 */
private val sitemapGroups = listOf(
    SitemapGroup("Shop", listOf("Home", "Product catalog", "Cart", "Checkout", "Wishlist")),
    SitemapGroup("Account", listOf("My Orders", "My Addresses", "My Profile", "Login / Register")),
    SitemapGroup("About", listOf("About Us", "Careers", "Press")),
    SitemapGroup("Help", listOf("FAQ", "Shipping", "Returns", "Cancellation", "Payments")),
    SitemapGroup("Legal", listOf("Privacy Policy", "Terms of Use")),
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SitemapRoute(onBack: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text("Sitemap") },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
            },
        )
        Column(
            modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            Text(
                "All sections of the app, at a glance.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            sitemapGroups.forEach { group ->
                Column {
                    Text(group.title, style = MaterialTheme.typography.titleMedium)
                    group.items.forEach { item ->
                        Text(item, modifier = Modifier.padding(top = 6.dp))
                    }
                }
            }
        }
    }
}
