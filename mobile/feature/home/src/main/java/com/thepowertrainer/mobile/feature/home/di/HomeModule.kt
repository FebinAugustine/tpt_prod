package com.thepowertrainer.mobile.feature.home.di

import com.thepowertrainer.mobile.feature.home.data.HomeApi
import com.thepowertrainer.mobile.feature.home.data.HomeRepositoryImpl
import com.thepowertrainer.mobile.feature.home.domain.HomeRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class HomeModule {

    @Binds
    @Singleton
    abstract fun bindHomeRepository(impl: HomeRepositoryImpl): HomeRepository

    companion object {
        @Provides
        @Singleton
        fun provideHomeApi(retrofit: Retrofit): HomeApi = retrofit.create(HomeApi::class.java)
    }
}
