import com.android.build.api.dsl.CommonExtension
import org.gradle.api.JavaVersion
import org.gradle.api.Project

/**
 * Common `android { ... }` block shared by every module in this project —
 * lifted verbatim from what was previously duplicated in every module's
 * build.gradle.kts (compileSdk 36, minSdk 24, Java 11 compileOptions).
 *
 * IMPORTANT: this project's AGP (9.3.0) has built-in Kotlin compilation —
 * do NOT apply `org.jetbrains.kotlin.android` here or anywhere else in
 * build-logic. That plugin is fundamentally incompatible with AGP 9's
 * built-in Kotlin support ("not compatible with built-in Kotlin support")
 * and was removed project-wide when migrating kapt -> KSP (see root
 * CLAUDE.md "Known gaps" #1, fix #2). Every module already builds and runs
 * fine without it — this convention plugin must preserve that.
 *
 * NOTE: the hand-written build files used AGP 9's newer
 * `compileSdk { version = release(36) { minorApiLevel = 1 } }` block DSL.
 * That's sugar over the classic `compileSdk = 36` integer setter used here —
 * functionally equivalent for our purposes (minorApiLevel just pins a
 * specific preview SDK revision, not relevant to this app). Verify this
 * simplification is acceptable on first build-logic sync; switch back to
 * the block form if a specific minor SDK revision turns out to matter.
 */
internal fun Project.configureKotlinAndroid(
    commonExtension: CommonExtension,
) {
    commonExtension.apply {
        compileSdk = 36

        defaultConfig.minSdk = 24

        compileOptions.sourceCompatibility = JavaVersion.VERSION_11
        compileOptions.targetCompatibility = JavaVersion.VERSION_11
    }
}
