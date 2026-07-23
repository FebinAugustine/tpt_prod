package com.thepowertrainer.mobile.core.network

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideJson(): Json = Json {
        ignoreUnknownKeys = true
        coerceInputValues = true
        isLenient = true
        // CRITICAL (2026-07-23 bugfix): kotlinx.serialization's `encodeDefaults`
        // defaults to false — a property is omitted from the serialized JSON
        // entirely whenever its value equals its Kotlin default, even if the
        // caller never explicitly set it. This silently dropped
        // CreateOrderRequest.paymentMethod (default "upi", never passed
        // explicitly by CheckoutRepositoryImpl) from every order request body,
        // and the backend's CreateOrderDto.paymentMethod has no @IsOptional —
        // so every single checkout attempt failed with 400 Bad Request before
        // ever reaching OrdersService, with no way to tell from the request
        // body alone (it just silently wasn't there). Root-caused by comparing
        // the exact bytes class-validator complains about isn't visible over
        // BASIC-level OkHttp logging, only inferred from re-reading every DTO's
        // default-value fields against the backend's required/optional
        // decorators. Setting this true makes every request DTO serialize
        // ALL its fields, matching what a human reading the Kotlin data class
        // would expect — the same fix protects every other request DTO in the
        // app that also relies on a default value (e.g. CreateAddressRequest's
        // `isDefault = false`, CreateOrderRequest's `shippingCost = 0.0`).
        encodeDefaults = true
    }

    @Provides
    @Singleton
    fun provideLoggingInterceptor(): HttpLoggingInterceptor =
        HttpLoggingInterceptor().apply {
            // BuildConfig.DEBUG isn't visible from :core:network's own
            // BuildConfig for release builds of consuming apps, so this
            // stays BASIC by default; bump to BODY locally when debugging.
            level = HttpLoggingInterceptor.Level.BASIC
        }

    @Provides
    @Singleton
    fun provideOkHttpClient(
        authInterceptor: AuthInterceptor,
        tokenAuthenticator: TokenAuthenticator,
        loggingInterceptor: HttpLoggingInterceptor,
    ): OkHttpClient = OkHttpClient.Builder()
        .addInterceptor(authInterceptor)
        .addInterceptor(loggingInterceptor)
        .authenticator(tokenAuthenticator)
        .build()

    @Provides
    @Singleton
    fun provideRetrofit(
        okHttpClient: OkHttpClient,
        json: Json,
    ): Retrofit = Retrofit.Builder()
        .baseUrl(ApiConfig.BASE_URL)
        .client(okHttpClient)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()
}
