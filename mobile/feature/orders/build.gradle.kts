plugins {
    id("thepowertrainer.android.feature")
}

android {
    namespace = "com.thepowertrainer.mobile.feature.orders"
}

dependencies {
    implementation(libs.androidx.compose.material.icons.extended)
    implementation(libs.coil.compose)
    implementation(libs.coil.network.okhttp)
}
