pluginManagement {
    // Hooks in the custom convention plugins (thepowertrainer.android.*) —
    // see build-logic/convention/build.gradle.kts for what's registered.
    includeBuild("build-logic")
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "mobile"
include(":app")

// Core (generic, foundational — no feature/business logic lives here)
include(":core:common")
include(":core:network")
include(":core:designsystem")

// Feature modules — each owns its own UI, ViewModels, use cases, and
// repository implementation (decentralized domain layer; no shared
// :core:domain — see root CLAUDE.md "Decisions" #2).
include(":feature:auth")
include(":feature:home")
include(":feature:catalog")
include(":feature:cart")
include(":feature:checkout")
include(":feature:orders")
include(":feature:wishlist")
include(":feature:profile")
include(":feature:addresses")
include(":feature:content")
include(":feature:admin")
