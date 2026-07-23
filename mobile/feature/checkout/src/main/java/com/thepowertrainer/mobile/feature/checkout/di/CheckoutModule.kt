package com.thepowertrainer.mobile.feature.checkout.di

import com.thepowertrainer.mobile.feature.checkout.data.CheckoutApi
import com.thepowertrainer.mobile.feature.checkout.data.CheckoutRepositoryImpl
import com.thepowertrainer.mobile.feature.checkout.domain.CheckoutRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class CheckoutModule {

    @Binds
    @Singleton
    abstract fun bindCheckoutRepository(impl: CheckoutRepositoryImpl): CheckoutRepository

    companion object {
        @Provides
        @Singleton
        fun provideCheckoutApi(retrofit: Retrofit): CheckoutApi = retrofit.create(CheckoutApi::class.java)
    }
}
