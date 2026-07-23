dependencyResolutionManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
    // Share the SAME version catalog the rest of the project uses, so
    // convention plugins pull dependency/plugin versions from one place
    // (gradle/libs.versions.toml) instead of a second, divergent source.
    versionCatalogs {
        create("libs") {
            from(files("../gradle/libs.versions.toml"))
        }
    }
}

rootProject.name = "build-logic"
include(":convention")
