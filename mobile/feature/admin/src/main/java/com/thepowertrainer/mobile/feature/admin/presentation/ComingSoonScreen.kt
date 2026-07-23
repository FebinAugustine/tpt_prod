package com.thepowertrainer.mobile.feature.admin.presentation

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier

/**
 * Placeholder for admin sections not yet built out (Products/Orders/
 * Categories/Banners/Offer Cards/Careers/Press/UPI Settings management —
 * see root CLAUDE.md Phase 2 roadmap). Users + Dashboard stats are the only
 * fully implemented admin screens so far; the rest are being built
 * sequentially in the same order the frontend's admin nav lists them.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ComingSoonRoute(title: String, onBack: () -> Unit) {
    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text(title) },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
            },
        )
        Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("$title management is coming soon", color = MaterialTheme.colorScheme.onSurfaceVariant)
        }
    }
}
