package com.thepowertrainer.mobile.feature.orders.di

import com.thepowertrainer.mobile.feature.orders.data.OrdersApi
import com.thepowertrainer.mobile.feature.orders.data.OrdersRepositoryImpl
import com.thepowertrainer.mobile.feature.orders.domain.OrdersRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class OrdersModule {

    @Binds
    @Singleton
    abstract fun bindOrdersRepository(impl: OrdersRepositoryImpl): OrdersRepository

    companion object {
        @Provides
        @Singleton
        fun provideOrdersApi(retrofit: Retrofit): OrdersApi = retrofit.create(OrdersApi::class.java)
    }
}
