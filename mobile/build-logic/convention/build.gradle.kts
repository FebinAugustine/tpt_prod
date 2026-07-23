plugins {
    `kotlin-dsl`
}

group = "com.thepowertrainer.mobile.buildlogic"

// NOTE: this is the JVM level build-logic itself compiles/runs at as a plain
// Gradle/Kotlin project — completely separate from the Java 11 compileOptions
// the app's own modules target (see KotlinAndroid.kt). AGP 9.3.0's Gradle
// plugin artifact (com.android.tools.build:gradle) requires a Java 17
// compile-compatible consumer; without this, resolving it as a compileOnly
// dependency below fails with "Incompatible because this component declares
// a component, compatible with Java 17 and the consumer needed a component,
// compatible with Java 11".
java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    // compileOnly: these classes are only needed to compile the convention
    // plugins themselves (so their Kotlin code can reference AGP/Kotlin/Hilt/
    // KSP Gradle API types) — the actual plugin application at build time is
    // resolved through the normal plugin portal/pluginManagement mechanism.
    compileOnly(libs.android.gradlePlugin)
    compileOnly(libs.kotlin.gradlePlugin)
    compileOnly(libs.compose.compiler.gradlePlugin)
    compileOnly(libs.kotlin.serialization.gradlePlugin)
    compileOnly(libs.ksp.gradlePlugin)
    compileOnly(libs.hilt.gradlePlugin)
}

gradlePlugin {
    plugins {
        register("androidApplication") {
            id = "thepowertrainer.android.application"
            implementationClass = "AndroidApplicationConventionPlugin"
        }
        register("androidLibrary") {
            id = "thepowertrainer.android.library"
            implementationClass = "AndroidLibraryConventionPlugin"
        }
        register("androidLibraryCompose") {
            id = "thepowertrainer.android.library.compose"
            implementationClass = "AndroidLibraryComposeConventionPlugin"
        }
        register("androidHilt") {
            id = "thepowertrainer.android.hilt"
            implementationClass = "AndroidHiltConventionPlugin"
        }
        register("androidFeature") {
            id = "thepowertrainer.android.feature"
            implementationClass = "AndroidFeatureConventionPlugin"
        }
    }
}
