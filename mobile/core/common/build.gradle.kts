plugins {
    id("thepowertrainer.android.library")
    alias(libs.plugins.kotlin.serialization)
}

android {
    namespace = "com.thepowertrainer.mobile.core.common"
}

dependencies {
    implementation(libs.kotlinx.coroutines.android)
    implementation(libs.kotlinx.serialization.json)
    implementation(libs.javax.inject)
}
