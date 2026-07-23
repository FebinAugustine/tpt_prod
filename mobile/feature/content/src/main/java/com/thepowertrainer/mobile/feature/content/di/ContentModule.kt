package com.thepowertrainer.mobile.feature.content.di

import com.thepowertrainer.mobile.feature.content.data.ContentApi
import com.thepowertrainer.mobile.feature.content.data.ContentRepositoryImpl
import com.thepowertrainer.mobile.feature.content.domain.ContentRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class ContentModule {

    @Binds
    @Singleton
    abstract fun bindContentRepository(impl: ContentRepositoryImpl): ContentRepository

    companion object {
        @Provides
        @Singleton
        fun provideContentApi(retrofit: Retrofit): ContentApi = retrofit.create(ContentApi::class.java)
    }
}
