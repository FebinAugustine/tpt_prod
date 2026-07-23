package com.thepowertrainer.mobile.feature.content.presentation

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Facebook
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.thepowertrainer.mobile.core.designsystem.theme.Emerald
import com.thepowertrainer.mobile.core.designsystem.theme.Green
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Sky

private const val CONTACT_EMAIL = "supporttpt@gmail.com"
private const val CONTACT_PHONE_DISPLAY = "+91 9447540035"
private const val CONTACT_PHONE_DIAL = "+919447540035"
private const val CONTACT_HOURS = "Mon-Sat, 9AM-6PM"

private data class SocialLink(val label: String, val url: String)

private val socialLinks = listOf(
    SocialLink("Facebook", "https://facebook.com"),
    SocialLink("Twitter", "https://twitter.com"),
    SocialLink("Instagram", "https://instagram.com"),
    SocialLink("YouTube", "https://youtube.com"),
)

/**
 * Mobile equivalent of the frontend's site-wide `Footer.tsx` contact block —
 * reachable from Profile's "More" list. Mirrors the exact contact details
 * and social links coded there (see root CLAUDE.md task notes), styled as a
 * proper screen instead of a text footer since mobile has no persistent
 * footer real estate. Also ends with the same brand + copyright line the
 * web footer shows.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ContactRoute(onBack: () -> Unit) {
    val context = LocalContext.current

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text("Contact Us") },
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
        ) {
            Text(
                "We're here to help",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
            )
            Text(
                "Reach out with any questions about orders, products, or your account.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 4.dp, bottom = 20.dp),
            )

            ContactRow(
                icon = Icons.Filled.Email,
                color = Sky,
                label = "Email",
                value = CONTACT_EMAIL,
                onClick = {
                    runCatching {
                        context.startActivity(
                            Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:$CONTACT_EMAIL")),
                        )
                    }
                },
            )
            ContactRow(
                icon = Icons.Filled.Call,
                color = Emerald,
                label = "Phone",
                value = CONTACT_PHONE_DISPLAY,
                onClick = {
                    runCatching {
                        context.startActivity(
                            Intent(Intent.ACTION_DIAL, Uri.parse("tel:$CONTACT_PHONE_DIAL")),
                        )
                    }
                },
            )
            ContactRow(
                icon = Icons.Filled.AccessTime,
                color = GreenDark,
                label = "Hours",
                value = CONTACT_HOURS,
                onClick = null,
            )

            Spacer(Modifier.height(24.dp))
            Text("Follow Us", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
            Row(
                modifier = Modifier.padding(top = 10.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                socialLinks.forEach { social ->
                    SocialIcon(social = social, onClick = {
                        runCatching {
                            context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(social.url)))
                        }
                    })
                }
            }

            Spacer(Modifier.height(32.dp))
            BrandFooter()
        }
    }
}

@Composable
private fun ContactRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    color: androidx.compose.ui.graphics.Color,
    label: String,
    value: String,
    onClick: (() -> Unit)?,
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(bottom = 10.dp)
            .let { base -> if (onClick != null) base.clickable(onClick = onClick) else base },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.30f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
            Column(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(50))
                    .background(color.copy(alpha = 0.15f)),
            ) {
                Column(modifier = Modifier.fillMaxSize(), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(18.dp))
                }
            }
            Column(modifier = Modifier.padding(start = 12.dp)) {
                Text(label, style = MaterialTheme.typography.labelSmall, color = MaterialTheme.colorScheme.onSurfaceVariant)
                Text(value, style = MaterialTheme.typography.bodyMedium, fontWeight = FontWeight.Medium)
            }
        }
    }
}

@Composable
private fun SocialIcon(social: SocialLink, onClick: () -> Unit) {
    Column(
        modifier = Modifier
            .size(44.dp)
            .clip(RoundedCornerShape(50))
            .background(Green.copy(alpha = 0.12f))
            .clickable(onClick = onClick),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Icon(Icons.Filled.Facebook, contentDescription = social.label, tint = GreenDark, modifier = Modifier.size(20.dp))
    }
}

@Composable
private fun BrandFooter() {
    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
        Text("The Power Trainer", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
        val currentYear = remember { java.util.Calendar.getInstance().get(java.util.Calendar.YEAR) }
        Text(
            "© $currentYear The Power Trainer. All rights reserved.",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 4.dp, bottom = 16.dp),
        )
    }
}
