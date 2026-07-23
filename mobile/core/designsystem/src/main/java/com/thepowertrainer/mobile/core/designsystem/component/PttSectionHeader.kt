package com.thepowertrainer.mobile.core.designsystem.component

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Slate400

/** "Section title" (+ optional subtitle) + optional "See all" action — used
 * above every horizontal product row / category row on the Home feed. */
@Composable
fun PttSectionHeader(
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    actionLabel: String? = null,
    onActionClick: (() -> Unit)? = null,
) {
    Row(
        modifier = modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column {
            Text(
                title,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
            )
            subtitle?.let {
                Text(it, style = MaterialTheme.typography.bodySmall, color = Slate400)
            }
        }
        if (actionLabel != null && onActionClick != null) {
            Text(
                actionLabel,
                style = MaterialTheme.typography.labelLarge,
                color = GreenDark,
                modifier = Modifier.clickable(onClick = onActionClick),
            )
        }
    }
}
