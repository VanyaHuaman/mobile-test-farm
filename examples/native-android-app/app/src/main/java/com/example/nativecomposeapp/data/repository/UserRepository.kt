package com.example.nativecomposeapp.data.repository

import com.example.nativecomposeapp.data.api.RetrofitClient
import com.example.nativecomposeapp.data.model.User
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class UserRepository {
    private val apiService = RetrofitClient.apiService

    suspend fun getUsers(): Result<List<User>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getUsers()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception("Failed to fetch users: ${response.code()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
