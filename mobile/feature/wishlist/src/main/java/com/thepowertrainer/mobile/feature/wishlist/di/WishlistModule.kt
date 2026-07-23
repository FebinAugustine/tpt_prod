package com.thepowertrainer.mobile.feature.wishlist.di

import com.thepowertrainer.mobile.core.common.wishlist.WishlistGateway
import com.thepowertrainer.mobile.feature.wishlist.data.WishlistRepositoryImpl
import com.thepowertrainer.mobile.feature.wishlist.domain.WishlistRepository
import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
abstract class WishlistModule {

    @Binds
    abstract fun bindWishlistRepository(impl: WishlistRepositoryImpl): WishlistRepository

    @Binds
    abstract fun bindWishlistGateway(impl: WishlistRepositoryImpl): WishlistGateway
}
