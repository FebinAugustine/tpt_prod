package com.thepowertrainer.mobile.core.designsystem.theme

import androidx.compose.ui.graphics.Color

/**
 * The Power Trainer brand palette — mirrors `frontend/app/globals.css`
 * (primary-navy surfaces + accent CTA gradient + slate neutrals +
 * semantic status colors) so the Android app and the web app read as the
 * same brand, not two different products.
 *
 * **2026-07-22 — accent rebrand**: the CTA/accent color was changed from
 * warm-orange to "parrot green" per Febin's (the app owner's) explicit
 * design direction — the old orange read poorly against the card redesign.
 * Base ~#22B14C (canonical parrot green), with a proper tonal scale built
 * around it (dark/base/light/pale) for shadows, CTAs, containers, and
 * subtle chip backgrounds respectively. All four tones were checked for
 * sufficient contrast against both the light theme's white/Slate50
 * background and the dark theme's Navy background. The Navy/Slate neutral
 * scale and the semantic Emerald/Amber/Sky/Rose colors are unchanged.
 */

// Navy — primary brand surface color (headers, nav bars, dark backgrounds)
val NavyDarkest = Color(0xFF0C1222)
val NavyDark = Color(0xFF0F172A)
val Navy = Color(0xFF1E293B)
val NavyLight = Color(0xFF334155)

// Parrot green — the brand's CTA/accent gradient (buttons, active states,
// price highlights, icon tints). Replaces the old warm-orange accent.
val GreenDark = Color(0xFF178C3B)   // shadows / gradient-start / pressed states
val Green = Color(0xFF22B14C)       // canonical parrot green — primary CTA/icon/accent
val GreenLight = Color(0xFF8FE3A0)  // light tint — secondary/container backgrounds
val GreenPale = Color(0xFFE6F9EA)   // very pale tint — subtle chip/badge backgrounds

// Slate neutrals
val Slate50 = Color(0xFFF8FAFC)
val Slate100 = Color(0xFFF1F5F9)
val Slate200 = Color(0xFFE2E8F0)
val Slate300 = Color(0xFFCBD5E1)
val Slate400 = Color(0xFF94A3B8) // "silver" in globals.css
val Slate600 = Color(0xFF475569)
val Slate800 = Color(0xFF1E293B)

// Semantic status colors — match globals.css's badge-success/warning/danger/info
val Emerald = Color(0xFF34D399) // success
val Amber = Color(0xFFFBBF24)   // warning
val Sky = Color(0xFF38BDF8)     // info / secondary accent
val Rose = Color(0xFFF87171)    // danger (soft, for text/icons on tinted bg)
val RoseStrong = Color(0xFFEF4444) // danger (solid, for filled surfaces)
