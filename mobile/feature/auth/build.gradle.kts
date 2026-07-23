plugins {
    id("thepowertrainer.android.feature")
}

android {
    namespace = "com.thepowertrainer.mobile.feature.auth"
}

dependencies {
    // Icons.Filled.Email/Lock/Person/Phone/Visibility/VisibilityOff used by the
    // redesigned Login/Register screens (2026-07-23) — material-icons-core isn't
    // pulled in transitively by material3, so this needs to be explicit, same as
    // every other feature module that references Icons.Filled.*.
    implementation(libs.androidx.compose.material.icons.extended)
}
