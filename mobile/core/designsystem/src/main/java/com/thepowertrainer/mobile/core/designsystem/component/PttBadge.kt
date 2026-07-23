package com.thepowertrainer.mobile.core.designsystem.component

import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.thepowertrainer.mobile.core.designsystem.theme.Amber
import com.thepowertrainer.mobile.core.designsystem.theme.Emerald
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.core.designsystem.theme.Rose
import com.thepowertrainer.mobile.core.designsystem.theme.Sky

/** Semantic tones for [PttStatusBadge] — mirrors globals.css's
 * `.badge-success` / `.badge-warning` / `.badge-danger` / `.badge-info`. */
enum class PttBadgeTone { SUCCESS, WARNING, DANGER, INFO, ACCENT }

/** Small pill badge for statuses (order status, in/out of stock, discount %). */
@Composable
fun PttStatusBadge(
    text: String,
    tone: PttBadgeTone,
    modifier: Modifier = Modifier,
) {
    val color = when (tone) {
        PttBadgeTone.SUCCESS -> Emerald
        PttBadgeTone.WARNING -> Amber
        PttBadgeTone.DANGER -> Rose
        PttBadgeTone.INFO -> Sky
        PttBadgeTone.ACCENT -> GreenDark
    }
    Surface(
        modifier = modifier,
        color = color.copy(alpha = 0.15f),
        contentColor = color,
        shape = RoundedCornerShape(50),
    ) {
        Text(
            text = text,
            style = MaterialTheme.typography.labelSmall,
            modifier = Modifier.padding(horizontal = 10.dp, vertical = 3.dp),
        )
    }
}
