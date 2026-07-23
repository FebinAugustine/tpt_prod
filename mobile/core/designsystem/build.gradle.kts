plugins {
    id("thepowertrainer.android.library.compose")
}

android {
    namespace = "com.thepowertrainer.mobile.core.designsystem"
}

dependencies {
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.coil.compose)
    implementation(libs.coil.network.okhttp)
}
