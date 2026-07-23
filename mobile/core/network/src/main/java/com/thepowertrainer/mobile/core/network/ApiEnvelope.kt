package com.thepowertrainer.mobile.core.network

import kotlinx.serialization.Serializable

/**
 * Mirrors the NestJS backend's global ResponseInterceptor / HttpExceptionFilter
 * envelope shape: `{ success, data?, message?, error? }`. Every Retrofit
 * endpoint that returns backend-wrapped JSON should declare its response as
 * `ApiEnvelope<T>` so parsing stays consistent across every feature module.
 *
 * Some auth endpoints (login/refresh) return their fields flattened at the
 * top level rather than nested under `data` — those use dedicated response
 * DTOs instead of this envelope (see :feature:auth).
 */
@Serializable
data class ApiEnvelope<T>(
    val success: Boolean = true,
    val data: T? = null,
    val message: String? = null,
    val error: String? = null,
)
