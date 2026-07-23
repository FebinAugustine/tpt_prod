import org.gradle.api.Project
import org.gradle.api.artifacts.VersionCatalog
import org.gradle.api.artifacts.VersionCatalogsExtension
import org.gradle.kotlin.dsl.getByType

/**
 * Gives every convention plugin access to the SAME `gradle/libs.versions.toml`
 * catalog the rest of the project uses (wired via build-logic's own
 * settings.gradle.kts `versionCatalogs { create("libs") { from(...) } }`).
 * This is how convention plugins resolve dependency/plugin versions without
 * hardcoding any of them.
 */
internal val Project.libs: VersionCatalog
    get() = extensions.getByType<VersionCatalogsExtension>().named("libs")
