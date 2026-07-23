package com.thepowertrainer.mobile.feature.profile.presentation

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.ui.draw.clip
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.DeleteForever
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Logout
import androidx.compose.material.icons.filled.Map
import androidx.compose.material.icons.filled.Newspaper
import androidx.compose.material.icons.filled.PrivacyTip
import androidx.compose.material.icons.filled.Receipt
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.thepowertrainer.mobile.core.designsystem.component.PttBadgeTone
import com.thepowertrainer.mobile.core.designsystem.component.PttPrimaryButton
import com.thepowertrainer.mobile.core.designsystem.component.PttSectionHeader
import com.thepowertrainer.mobile.core.designsystem.component.PttStatusBadge
import com.thepowertrainer.mobile.core.designsystem.theme.Emerald
import com.thepowertrainer.mobile.core.designsystem.theme.Green
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.GreenLight
import com.thepowertrainer.mobile.core.designsystem.theme.PttGradients
import com.thepowertrainer.mobile.core.designsystem.theme.Rose
import com.thepowertrainer.mobile.core.designsystem.theme.Sky
import com.thepowertrainer.mobile.feature.profile.domain.ChangePasswordInput
import com.thepowertrainer.mobile.feature.profile.domain.ProfileInput
import com.thepowertrainer.mobile.feature.profile.domain.ProfileUser

/**
 * Account/profile screen — redesigned 2026-07-22 to move off plain stacked
 * Material `Card`/`TextButton` defaults toward an Amazon/Flipkart/Blinkit-
 * style account page: a branded avatar header, colorful quick-action chips
 * (Orders/Wishlist/Addresses — the destinations Home's bottom nav doesn't
 * already cover on their own tab), then grouped settings sections and a
 * "More" list with icon+chevron rows instead of plain text buttons. Every
 * card uses the house flat-card style (0.dp elevation, tinted background)
 * established after Febin's "big border" feedback on Admin Dashboard.
 */
@Composable
fun ProfileRoute(
    onLoggedOut: () -> Unit,
    onOrders: () -> Unit = {},
    onWishlist: () -> Unit = {},
    onAddresses: () -> Unit = {},
    onAbout: () -> Unit = {},
    onCareers: () -> Unit = {},
    onPress: () -> Unit = {},
    onHelp: () -> Unit = {},
    onSitemap: () -> Unit = {},
    onPrivacy: () -> Unit = {},
    onTerms: () -> Unit = {},
    onContact: () -> Unit = {},
    viewModel: ProfileViewModel = hiltViewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()

    LaunchedEffect(uiState.loggedOut) {
        if (uiState.loggedOut) onLoggedOut()
    }

    if (uiState.loggedOut) return

    when {
        uiState.isLoading -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            CircularProgressIndicator(color = GreenDark)
        }
        uiState.user != null -> ProfileContent(
            uiState = uiState,
            viewModel = viewModel,
            onOrders = onOrders,
            onWishlist = onWishlist,
            onAddresses = onAddresses,
            onAbout = onAbout,
            onCareers = onCareers,
            onPress = onPress,
            onHelp = onHelp,
            onSitemap = onSitemap,
            onPrivacy = onPrivacy,
            onTerms = onTerms,
            onContact = onContact,
        )
        uiState.error != null -> Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(uiState.error!!, color = MaterialTheme.colorScheme.error)
        }
    }

    if (uiState.showDeleteConfirm) {
        AlertDialog(
            onDismissRequest = viewModel::dismissDeleteAccount,
            title = { Text("Delete Account") },
            text = {
                Text(
                    "This will permanently delete your account, addresses, orders, cart, and wishlist. " +
                        "This action cannot be undone.",
                )
            },
            confirmButton = {
                TextButton(
                    onClick = viewModel::confirmDeleteAccount,
                    enabled = !uiState.isDeletingAccount,
                ) {
                    Text(if (uiState.isDeletingAccount) "Deleting..." else "Delete Permanently", color = MaterialTheme.colorScheme.error)
                }
            },
            dismissButton = {
                TextButton(onClick = viewModel::dismissDeleteAccount) { Text("Cancel") }
            },
        )
    }
}

@Composable
private fun ProfileContent(
    uiState: ProfileUiState,
    viewModel: ProfileViewModel,
    onOrders: () -> Unit,
    onWishlist: () -> Unit,
    onAddresses: () -> Unit,
    onAbout: () -> Unit,
    onCareers: () -> Unit,
    onPress: () -> Unit,
    onHelp: () -> Unit,
    onSitemap: () -> Unit,
    onPrivacy: () -> Unit,
    onTerms: () -> Unit,
    onContact: () -> Unit,
) {
    val user = uiState.user ?: return

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
    ) {
        ProfileHeaderCard(user = user)

        Spacer(Modifier.height(20.dp))
        QuickActionsRow(onOrders = onOrders, onWishlist = onWishlist, onAddresses = onAddresses)

        Spacer(Modifier.height(24.dp))
        PttSectionHeader("Account")
        Spacer(Modifier.height(10.dp))
        PersonalInfoCard(uiState = uiState, viewModel = viewModel)
        Spacer(Modifier.height(12.dp))
        ChangePasswordCard(uiState = uiState, onSubmit = viewModel::changePassword)

        Spacer(Modifier.height(24.dp))
        PttSectionHeader("More")
        Spacer(Modifier.height(10.dp))
        MoreLinksCard(
            onContact = onContact,
            onAbout = onAbout,
            onCareers = onCareers,
            onPress = onPress,
            onHelp = onHelp,
            onSitemap = onSitemap,
            onPrivacy = onPrivacy,
            onTerms = onTerms,
        )

        Spacer(Modifier.height(20.dp))
        LogoutRow(onClick = viewModel::logout)

        Spacer(Modifier.height(20.dp))
        DangerZoneCard(onDeleteClick = viewModel::requestDeleteAccount)

        Spacer(Modifier.height(24.dp))
    }
}

/** Branded header: gradient avatar with initials, name, email, verified badge. */
@Composable
private fun ProfileHeaderCard(user: ProfileUser) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = GreenPaleSurface()),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Row(
            modifier = Modifier.padding(18.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Box(
                modifier = Modifier
                    .size(64.dp)
                    .clip(CircleShapeCompat())
                    .background(PttGradients.primaryButton),
                contentAlignment = Alignment.Center,
            ) {
                Text(
                    initials(user.fullName),
                    color = Color.White,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
            }
            Spacer(Modifier.width(16.dp))
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    user.fullName,
                    style = MaterialTheme.typography.titleLarge,
                    fontWeight = FontWeight.Bold,
                )
                Text(
                    user.email,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
                Spacer(Modifier.height(6.dp))
                PttStatusBadge(
                    text = if (user.isVerified) "Verified" else "Pending verification",
                    tone = if (user.isVerified) PttBadgeTone.SUCCESS else PttBadgeTone.WARNING,
                )
            }
        }
    }
}

private fun initials(fullName: String): String {
    val parts = fullName.trim().split(Regex("\\s+")).filter { it.isNotBlank() }
    val chars = parts.take(2).mapNotNull { it.firstOrNull()?.uppercaseChar() }
    return if (chars.isEmpty()) "?" else chars.joinToString("")
}

private data class QuickAction(
    val label: String,
    val icon: ImageVector,
    val color: Color,
    val onClick: () -> Unit,
)

@Composable
private fun QuickActionsRow(onOrders: () -> Unit, onWishlist: () -> Unit, onAddresses: () -> Unit) {
    val actions = listOf(
        QuickAction("Orders", Icons.Filled.Receipt, Sky, onOrders),
        QuickAction("Wishlist", Icons.Filled.FavoriteBorder, Rose, onWishlist),
        QuickAction("Addresses", Icons.Filled.Map, Emerald, onAddresses),
    )
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        actions.forEach { action ->
            Card(
                modifier = Modifier
                    .weight(1f)
                    .clickable(onClick = action.onClick),
                shape = RoundedCornerShape(18.dp),
                colors = CardDefaults.cardColors(containerColor = action.color.copy(alpha = 0.10f)),
                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 14.dp, horizontal = 8.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(CircleShapeCompat())
                            .background(action.color.copy(alpha = 0.20f)),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(action.icon, contentDescription = null, tint = action.color)
                    }
                    Spacer(Modifier.height(8.dp))
                    Text(
                        action.label,
                        style = MaterialTheme.typography.labelMedium,
                        fontWeight = FontWeight.Medium,
                        textAlign = TextAlign.Center,
                    )
                }
            }
        }
    }
}

@Composable
private fun PersonalInfoCard(uiState: ProfileUiState, viewModel: ProfileViewModel) {
    val user = uiState.user ?: return
    FlatSectionCard {
        Text("Personal Information", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        if (uiState.isEditing) {
            EditProfileForm(
                user = user,
                isSaving = uiState.isSavingProfile,
                onSave = viewModel::saveProfile,
                onCancel = { viewModel.setEditing(false) },
            )
        } else {
            InfoRow("Phone", user.phone)
            InfoRow("Role", user.role.replaceFirstChar { it.uppercase() })
            Spacer(Modifier.height(12.dp))
            EditPill(onClick = { viewModel.setEditing(true) })
        }
    }
}

@Composable
private fun EditPill(onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(GreenDark.copy(alpha = 0.10f))
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Icon(Icons.Filled.Edit, contentDescription = null, tint = GreenDark, modifier = Modifier.size(16.dp))
        Spacer(Modifier.width(6.dp))
        Text("Edit Profile", color = GreenDark, style = MaterialTheme.typography.labelMedium, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun ChangePasswordCard(uiState: ProfileUiState, onSubmit: (ChangePasswordInput) -> Unit) {
    FlatSectionCard {
        Text("Change Password", style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.SemiBold)
        ChangePasswordForm(
            isChanging = uiState.isChangingPassword,
            error = uiState.passwordError,
            success = uiState.passwordSuccess,
            onSubmit = onSubmit,
        )
    }
}

private data class MoreLink(val label: String, val icon: ImageVector, val onClick: () -> Unit)

@Composable
private fun MoreLinksCard(
    onContact: () -> Unit,
    onAbout: () -> Unit,
    onCareers: () -> Unit,
    onPress: () -> Unit,
    onHelp: () -> Unit,
    onSitemap: () -> Unit,
    onPrivacy: () -> Unit,
    onTerms: () -> Unit,
) {
    val links = listOf(
        MoreLink("Contact Us", Icons.Filled.Call, onContact),
        MoreLink("About Us", Icons.Filled.Info, onAbout),
        MoreLink("Careers", Icons.Filled.Work, onCareers),
        MoreLink("Press", Icons.Filled.Newspaper, onPress),
        MoreLink("Help Center", Icons.Filled.HelpOutline, onHelp),
        MoreLink("Sitemap", Icons.Filled.Map, onSitemap),
        MoreLink("Privacy Policy", Icons.Filled.PrivacyTip, onPrivacy),
        MoreLink("Terms of Use", Icons.Filled.Description, onTerms),
    )
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.35f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column {
            links.forEach { link -> MoreLinkRow(link) }
        }
    }
}

@Composable
private fun MoreLinkRow(link: MoreLink) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = link.onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            modifier = Modifier
                .size(34.dp)
                .clip(CircleShapeCompat())
                .background(Sky.copy(alpha = 0.15f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(link.icon, contentDescription = null, tint = Sky, modifier = Modifier.size(18.dp))
        }
        Spacer(Modifier.width(12.dp))
        Text(link.label, style = MaterialTheme.typography.bodyMedium, modifier = Modifier.weight(1f))
        Icon(
            Icons.Filled.ChevronRight,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
        )
    }
}

@Composable
private fun LogoutRow(onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(Rose.copy(alpha = 0.10f))
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.Center,
    ) {
        Icon(Icons.Filled.Logout, contentDescription = null, tint = Rose, modifier = Modifier.size(18.dp))
        Spacer(Modifier.width(8.dp))
        Text("Log out", color = Rose, style = MaterialTheme.typography.titleSmall, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun DangerZoneCard(onDeleteClick: () -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.errorContainer.copy(alpha = 0.35f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Filled.Shield, contentDescription = null, tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(18.dp))
                Spacer(Modifier.width(8.dp))
                Text("Danger Zone", style = MaterialTheme.typography.titleMedium, color = MaterialTheme.colorScheme.error, fontWeight = FontWeight.SemiBold)
            }
            Text(
                "Deleting your account permanently removes all your data — orders, addresses, cart, and wishlist.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 6.dp, bottom = 12.dp),
            )
            Row(
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(MaterialTheme.colorScheme.error.copy(alpha = 0.12f))
                    .clickable(onClick = onDeleteClick)
                    .padding(horizontal = 14.dp, vertical = 10.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Icon(Icons.Filled.DeleteForever, contentDescription = null, tint = MaterialTheme.colorScheme.error, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("Delete Account", color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.labelLarge, fontWeight = FontWeight.Medium)
            }
        }
    }
}

/** Shared flat, tinted-background card wrapper — house style since the
 * "big border" fix (0.dp elevation, larger radius, no shadow-driven depth). */
@Composable
private fun FlatSectionCard(content: @Composable androidx.compose.foundation.layout.ColumnScope.() -> Unit) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.30f)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(modifier = Modifier.padding(16.dp), content = content)
    }
}

@Composable
private fun GreenPaleSurface(): Color = GreenLight.copy(alpha = 0.18f)

private fun CircleShapeCompat() = CircleShape

@Composable
private fun InfoRow(label: String, value: String) {
    Text("$label: $value", style = MaterialTheme.typography.bodyMedium, modifier = Modifier.padding(top = 6.dp))
}

@Composable
private fun EditProfileForm(
    user: ProfileUser,
    isSaving: Boolean,
    onSave: (ProfileInput) -> Unit,
    onCancel: () -> Unit,
) {
    var fullName by remember { mutableStateOf(user.fullName) }
    var email by remember { mutableStateOf(user.email) }
    var phone by remember { mutableStateOf(user.phone) }

    Column(modifier = Modifier.padding(top = 8.dp)) {
        OutlinedTextField(fullName, { fullName = it }, label = { Text("Full name") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(email, { email = it }, label = { Text("Email") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
        OutlinedTextField(phone, { phone = it }, label = { Text("Phone") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
        Column {
            PttPrimaryButton(
                text = if (isSaving) "Saving..." else "Save Changes",
                onClick = { onSave(ProfileInput(fullName, email, phone)) },
                enabled = !isSaving,
                isLoading = isSaving,
                modifier = Modifier.padding(top = 12.dp),
            )
            TextButton(onClick = onCancel, modifier = Modifier.fillMaxWidth()) {
                Text("Cancel")
            }
        }
    }
}

@Composable
private fun ChangePasswordForm(
    isChanging: Boolean,
    error: String?,
    success: String?,
    onSubmit: (ChangePasswordInput) -> Unit,
) {
    var currentPassword by remember { mutableStateOf("") }
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }

    Column(modifier = Modifier.padding(top = 8.dp)) {
        success?.let { Text(it, color = Green, modifier = Modifier.padding(bottom = 8.dp)) }
        error?.let { Text(it, color = MaterialTheme.colorScheme.error, modifier = Modifier.padding(bottom = 8.dp)) }

        OutlinedTextField(currentPassword, { currentPassword = it }, label = { Text("Current password") }, modifier = Modifier.fillMaxWidth())
        OutlinedTextField(newPassword, { newPassword = it }, label = { Text("New password") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))
        OutlinedTextField(confirmPassword, { confirmPassword = it }, label = { Text("Confirm new password") }, modifier = Modifier.fillMaxWidth().padding(top = 8.dp))

        if (confirmPassword.isNotBlank() && newPassword != confirmPassword) {
            Text("Passwords do not match", color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodySmall)
        }

        val canSubmit = currentPassword.isNotBlank() && newPassword.isNotBlank() && newPassword == confirmPassword

        PttPrimaryButton(
            text = if (isChanging) "Updating..." else "Update Password",
            onClick = { onSubmit(ChangePasswordInput(currentPassword, newPassword)) },
            enabled = canSubmit && !isChanging,
            isLoading = isChanging,
            modifier = Modifier.padding(top = 12.dp),
        )
    }
}
