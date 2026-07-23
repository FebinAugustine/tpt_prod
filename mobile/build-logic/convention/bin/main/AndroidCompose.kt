import com.android.build.api.dsl.CommonExtension
import org.gradle.api.Project
import org.gradle.kotlin.dsl.dependencies

/**
 * Common Compose setup shared by every module that needs it — mirrors the
 * `buildFeatures.compose = true` + BOM + core Compose deps + debug tooling
 * block that was previously duplicated in :app, :core:designsystem, and
 * every :feature:* module.
 *
 * Applies the Compose compiler plugin (`org.jetbrains.kotlin.plugin.compose`)
 * itself too, so callers don't need a separate `alias(libs.plugins.kotlin.compose)`.
 */
internal fun Project.configureAndroidCompose(
    commonExtension: CommonExtension,
) {
    commonExtension.apply {
        buildFeatures.compose = true
    }

    pluginManager.apply(libs.findPlugin("kotlin-compose").get().get().pluginId)

    dependencies {
        val bom = libs.findLibrary("androidx-compose-bom").get()
        add("implementation", platform(bom))
        add("implementation", libs.findLibrary("androidx-compose-ui").get())
        add("implementation", libs.findLibrary("androidx-compose-ui-graphics").get())
        add("implementation", libs.findLibrary("androidx-compose-ui-tooling-preview").get())
        add("implementation", libs.findLibrary("androidx-compose-material3").get())
        add("debugImplementation", libs.findLibrary("androidx-compose-ui-tooling").get())
    }
}
