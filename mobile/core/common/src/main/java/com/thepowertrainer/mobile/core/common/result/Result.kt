package com.thepowertrainer.mobile.core.common.result

/**
 * Generic wrapper mirroring the backend's response envelope
 * (`{ success, data, message/error }`, see NestJS ResponseInterceptor)
 * so every feature module's repository layer returns a consistent shape
 * regardless of which backend endpoint it's calling.
 */
sealed class AppResult<out T> {
    data class Success<out T>(val data: T) : AppResult<T>()
    data class Error(val message: String, val cause: Throwable? = null) : AppResult<Nothing>()

    inline fun onSuccess(action: (T) -> Unit): AppResult<T> {
        if (this is Success) action(data)
        return this
    }

    inline fun onError(action: (String) -> Unit): AppResult<T> {
        if (this is Error) action(message)
        return this
    }
}

inline fun <T, R> AppResult<T>.map(transform: (T) -> R): AppResult<R> = when (this) {
    is AppResult.Success -> AppResult.Success(transform(data))
    is AppResult.Error -> this
}
