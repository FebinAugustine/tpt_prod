# Fix MainActivity ClassCastException

The application is crashing on startup with a `java.lang.ClassCastException` in `MainActivity.kt`. The root cause is an invalid cast of the `setContent` result (which is `Unit`) to a `@Composable () -> Unit` function.

## Proposed Changes

### [app]

#### [MODIFY] [MainActivity.kt](file:///I:/Dev/ClaudeWorkspace/Project-ThePowerTrainer/mobile/app/src/main/java/com/thepowertrainer/mobile/MainActivity.kt)
- Remove the incorrect `as @Composable ComposableFunction0<Unit>` cast from the `setContent` call.
- Remove the unnecessary import of `androidx.compose.runtime.internal.ComposableFunction0`.

## Verification Plan

### Manual Verification
- Deploy the application to an Android device/emulator.
- Verify that the app starts successfully without crashing and displays the Login screen (the default `startDestination` in `AppNavHost`).
