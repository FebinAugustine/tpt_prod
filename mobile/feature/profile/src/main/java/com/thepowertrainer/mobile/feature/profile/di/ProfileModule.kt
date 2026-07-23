package com.thepowertrainer.mobile.feature.profile.di

import com.thepowertrainer.mobile.feature.profile.data.ProfileApi
import com.thepowertrainer.mobile.feature.profile.data.ProfileRepositoryImpl
import com.thepowertrainer.mobile.feature.profile.domain.ProfileRepository
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class ProfileModule {

    @Binds
    @Singleton
    abstract fun bindProfileRepository(impl: ProfileRepositoryImpl): ProfileRepository

    companion object {
        @Provides
        @Singleton
        fun provideProfileApi(retrofit: Retrofit): ProfileApi = retrofit.create(ProfileApi::class.java)
    }
}
