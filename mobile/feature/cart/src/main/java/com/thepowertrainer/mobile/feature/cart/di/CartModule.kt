package com.thepowertrainer.mobile.feature.cart.di

import com.thepowertrainer.mobile.core.common.cart.CartGateway
import com.thepowertrainer.mobile.feature.cart.data.CartRepositoryImpl
import com.thepowertrainer.mobile.feature.cart.domain.CartRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
abstract class CartModule {

    @Binds
    abstract fun bindCartRepository(impl: CartRepositoryImpl): CartRepository

    @Binds
    abstract fun bindCartGateway(impl: CartRepositoryImpl): CartGateway
}
