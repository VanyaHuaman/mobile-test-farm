package com.example.nativecomposeapp.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTag
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.nativecomposeapp.data.model.User
import com.example.nativecomposeapp.viewmodel.UsersUiState
import com.example.nativecomposeapp.viewmodel.UsersViewModel

@Composable
fun UsersListScreen(
    modifier: Modifier = Modifier,
    viewModel: UsersViewModel = viewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
            .semantics {
                testTag = "users-list-screen"
                contentDescription = "users-list-screen"
            }
    ) {
        Text(
            text = "Users",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier
                .padding(bottom = 16.dp)
                .semantics {
                    testTag = "users-title"
                    contentDescription = "users-title"
                }
        )

        when (val state = uiState) {
            is UsersUiState.Loading -> {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(
                        modifier = Modifier.semantics {
                            testTag = "loading-indicator"
                            contentDescription = "loading-indicator"
                        }
                    )
                }
            }

            is UsersUiState.Success -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .semantics {
                            testTag = "users-list"
                            contentDescription = "users-list"
                        },
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(state.users) { user ->
                        UserItem(user = user)
                    }
                }
            }

            is UsersUiState.Error -> {
                Column(
                    modifier = Modifier.fillMaxSize(),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.Center
                ) {
                    Text(
                        text = state.message,
                        color = MaterialTheme.colorScheme.error,
                        modifier = Modifier
                            .padding(16.dp)
                            .semantics {
                                testTag = "error-message"
                                contentDescription = "error-message"
                            }
                    )

                    Button(
                        onClick = { viewModel.refresh() },
                        modifier = Modifier.semantics {
                            testTag = "retry-button"
                            contentDescription = "retry-button"
                        }
                    ) {
                        Text("Retry")
                    }
                }
            }
        }
    }
}

@Composable
fun UserItem(user: User) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .semantics {
                testTag = "user-item-${user.id}"
                contentDescription = "user-item-${user.id}"
            },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = user.name,
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.semantics {
                    testTag = "user-name-${user.id}"
                    contentDescription = "user-name-${user.id}"
                }
            )

            Spacer(modifier = Modifier.height(4.dp))

            Text(
                text = user.email,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.semantics {
                    testTag = "user-email-${user.id}"
                    contentDescription = "user-email-${user.id}"
                }
            )

            if (user.phone != null) {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = user.phone,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
