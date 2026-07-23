package com.thepowertrainer.mobile.feature.auth.presentation

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.thepowertrainer.mobile.core.designsystem.theme.GreenDark
import com.thepowertrainer.mobile.feature.auth.R

// "Dark parrot green" backdrop, per Febin's exact request (2026-07-23):
// a richer, deeper green than the button-accent GreenDark, so the splash
// reads as a bold brand moment rather than just a tinted loading screen.
private val SplashGreenDark = Color(0xFF0B4A22)

/**
 * Real start destination of the app. Resolves [SessionViewModel]'s
 * suspend-backed `isLoggedIn` check once, then hands off to Home or Login —
 * this is what lets the nav host pick a startDestination "dynamically"
 * despite NavHost itself requiring a static one. Also doubles as the app's
 * branded splash — a white dumbbell mark over a dark parrot-green
 * background, with "TPT" bold and "The Power Trainer" beneath it, matching
 * the launcher icon's palette (2026-07-23, per Febin's exact spec).
 */
@Composable
fun SplashRoute(
    onLoggedIn: (isAdmin: Boolean) -> Unit,
    onLoggedOut: () -> Unit,
    viewModel: SessionViewModel = hiltViewModel(),
) {
    val sessionState by viewModel.sessionState.collectAsState()
    val isAdmin by viewModel.isAdmin.collectAsState()

    LaunchedEffect(sessionState) {
        when (sessionState) {
            SessionState.LOGGED_IN -> onLoggedIn(isAdmin)
            SessionState.LOGGED_OUT -> onLoggedOut()
            SessionState.LOADING -> Unit
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Brush.verticalGradient(listOf(GreenDark, SplashGreenDark))),
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Image(
                painter = painterResource(R.drawable.ic_dumbbell),
                contentDescription = null,
                modifier = Modifier.size(96.dp),
            )
            Text(
                "TPT",
                color = Color.White,
                fontSize = 32.sp,
                fontWeight = FontWeight.Black,
                letterSpacing = 1.sp,
                modifier = Modifier.padding(top = 20.dp),
            )
            Text(
                "The Power Trainer",
                color = Color.White,
                style = MaterialTheme.typography.bodySmall,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(top = 4.dp),
            )
            CircularProgressIndicator(
                color = Color.White,
                strokeWidth = 3.dp,
                modifier = Modifier.padding(top = 36.dp).size(28.dp),
            )
        }
    }
}
