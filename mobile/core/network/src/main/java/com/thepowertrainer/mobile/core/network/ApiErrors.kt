package com.thepowertrainer.mobile.core.network

import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import retrofit2.HttpException

/**
 * Extracts the real backend error message from an [HttpException]'s error
 * body, instead of falling back to [HttpException.message] — which is just
 * Retrofit's generic HTTP reason phrase ("Bad Request", "Not Found", etc.)
 * with none of the actual detail. NestJS's default exception shape (used by
 * every non-`@WrapResponse()` route, e.g. `/addresses`, `/auth/profile`) is
 * `{statusCode, message, error}`, where `message` is either a plain string
 * (thrown exceptions like `NotFoundException('User not found')`) or a
 * string array (class-validator's per-field messages, e.g.
 * `["phone must be longer than or equal to 10 characters"]`).
 *
 * Added 2026-07-23 after a bug report of raw "Bad Request"/"Not Found" text
 * showing in the UI with no indication of what actually went wrong — every
 * repository's `safeCall` should use this instead of `e.message()`.
 */
fun HttpException.backendMessage(json: Json): String {
    val rawBody = response()?.errorBody()?.charStream()?.readText()
    val fallback = message() ?: "Server error"
    if (rawBody.isNullOrBlank()) return fallback

    return runCatching {
        val root = json.parseToJsonElement(rawBody).jsonObject
        val messageElement = root["message"] ?: return fallback
        when {
            messageElement is JsonArray -> messageElement.jsonArray
                .mapNotNull { (it as? JsonPrimitive)?.contentOrNull() }
                .joinToString("; ")
                .ifBlank { fallback }
            else -> (messageElement as? JsonPrimitive)?.contentOrNull() ?: fallback
        }
    }.getOrDefault(fallback)
}

private fun JsonPrimitive.contentOrNull(): String? = runCatching { jsonPrimitive.content }.getOrNull()
