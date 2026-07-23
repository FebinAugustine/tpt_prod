package com.thepowertrainer.mobile.feature.admin.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Article
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.CurrencyRupee
import androidx.compose.material.icons.filled.HourglassEmpty
import androidx.compose.material.icons.filled.Inventory2
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.PersonOutline
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material.icons.filled.VerifiedUser
import androidx.compose.material.icons.filled.ViewCarousel
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.thepowertrainer.mobile.core.designsystem.theme.Emerald
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Rose
import com.thepowertrainer.mobile.core.designsystem.theme.Slate400
import com.thepowertrainer.mobile.core.designsystem.theme.Sky
import com.thepowertrainer.mobile.feature.admin.domain.DashboardStats

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AdminDashboardRoute(
    onBack: () -> Unit,
    onLoggedOut: () -> Unit,
    onUsers: () -> Unit,
    onProducts: () -> Unit,
    onOrders: () -> Unit,
    onCategories: () -> Unit,
    onBanners: () -> Unit,
    onOfferCards: () -> Unit,
    onCareers: () -> Unit,
    onPress: () -> Unit,
    onUpiSettings: () -> Unit,
    onBackup: () -> Unit,
    viewModel: AdminDashboardViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.loggedOut) {
        if (uiState.loggedOut) onLoggedOut()
    }

    Column(modifier = Modifier.fillMaxSize()) {
        TopAppBar(
            title = { Text("Admin Panel", fontWeight = FontWeight.Bold) },
            navigationIcon = {
                IconButton(onClick = onBack) {
                    Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back")
                }
            },
            actions = {
                IconButton(onClick = viewModel::logout) {
                    Icon(Icons.Filled.Logout, contentDescription = "Log out", tint = Rose)
                }
            },
        )

        when {
            uiState.isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                CircularProgressIndicator(color = GreenDark)
            }
            uiState.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text(uiState.error!!, color = MaterialTheme.colorScheme.error)
            }
            uiState.stats != null -> StatsGrid(uiState.stats!!)
        }

        Column(modifier = Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text("Manage", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold)
            AdminLink("Users", Icons.Filled.People, Sky, onUsers)
            AdminLink("Products", Icons.Filled.Inventory2, GreenDark, onProducts)
            AdminLink("Orders", Icons.Filled.Receipt, Emerald, onOrders)
            AdminLink("Categories", Icons.Filled.Category, Rose, onCategories)
            AdminLink("Banners", Icons.Filled.ViewCarousel, Sky, onBanners)
            AdminLink("Offer Cards", Icons.Filled.ShoppingBag, GreenDark, onOfferCards)
            AdminLink("Careers", Icons.Filled.Work, Emerald, onCareers)
            AdminLink("Press", Icons.Filled.Article, Rose, onPress)
            AdminLink("UPI Settings", Icons.Filled.AccountBalanceWallet, Sky, onUpiSettings)
            AdminLink("Backup & Export", Icons.Filled.CloudDownload, GreenDark, onBackup)
        }
    }
}

private data class StatSpec(val label: String, val value: String, val icon: ImageVector, val color: Color)

@Composable
private fun StatsGrid(stats: DashboardStats) {
    val cards = listOf(
        StatSpec("Users", stats.totalUsers.toString(), Icons.Filled.PersonOutline, Sky),
        StatSpec("Active Users", stats.activeUsers.toString(), Icons.Filled.VerifiedUser, Emerald),
        StatSpec("Pending Verification", stats.pendingVerifications.toString(), Icons.Filled.HourglassEmpty, com.thepowertrainer.mobile.core.designsystem.theme.Amber),
        StatSpec("Revenue", "₹${stats.totalRevenue}", Icons.Filled.CurrencyRupee, GreenDark),
        StatSpec("Categories", stats.totalCategories.toString(), Icons.Filled.Category, Rose),
        StatSpec("Products", stats.totalProducts.toString(), Icons.Filled.Inventory2, Sky),
        StatSpec("Orders", stats.totalOrders.toString(), Icons.Filled.Receipt, Emerald),
    )
    LazyVerticalGrid(
        columns = GridCells.Fixed(2),
        contentPadding = PaddingValues(16.dp),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
        modifier = Modifier.fillMaxWidth(),
    ) {
        items(cards) { spec ->
            Card(
                shape = RoundedCornerShape(20.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
                colors = CardDefaults.cardColors(containerColor = spec.color.copy(alpha = 0.12f)),
                modifier = Modifier.fillMaxWidth(),
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(CircleShape)
                            .background(spec.color.copy(alpha = 0.20f)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(spec.icon, contentDescription = null, tint = spec.color, modifier = Modifier.size(20.dp))
                    }
                    Text(
                        spec.value,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        color = spec.color,
                        modifier = Modifier.padding(top = 10.dp),
                    )
                    Text(spec.label, style = MaterialTheme.typography.bodySmall, color = Slate400)
                }
            }
        }
    }
}

@Composable
private fun AdminLink(label: String, icon: ImageVector, color: Color, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        shape = RoundedCornerShape(18.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 14.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(color.copy(alpha = 0.18f)),
                contentAlignment = Alignment.Center,
            ) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(20.dp))
            }
            Text(
                label,
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.padding(start = 14.dp).weight(1f),
            )
            Icon(Icons.Filled.ChevronRight, contentDescription = null, tint = Slate400)
        }
    }
}
