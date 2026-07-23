package com.thepowertrainer.mobile.feature.catalog.di

import com.thepowertrainer.mobile.feature.catalog.data.CatalogApi
import com.thepowertrainer.mobile.feature.catalog.data.CatalogRepositoryImpl
import com.thepowertrainer.mobile.feature.catalog.domain.CatalogRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class CatalogModule {

    @Binds
    @Singleton
    abstract fun bindCatalogRepository(impl: CatalogRepositoryImpl): CatalogRepository

    companion object {
        @Provides
        @Singleton
        fun provideCatalogApi(retrofit: Retrofit): CatalogApi = retrofit.create(CatalogApi::class.java)
    }
}
