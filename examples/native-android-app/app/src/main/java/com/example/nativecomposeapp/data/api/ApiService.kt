package com.example.nativecomposeapp.data.api

import com.example.nativecomposeapp.data.model.User
import retrofit2.Response
import retrofit2.http.GET

interface ApiService {
    @GET("users")
    suspend fun getUsers(): Response<List<User>>
}
