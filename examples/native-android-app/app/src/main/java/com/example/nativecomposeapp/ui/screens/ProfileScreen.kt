package com.example.nativecomposeapp.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTag
import androidx.compose.ui.unit.dp

@Composable
fun ProfileScreen(
    modifier: Modifier = Modifier,
    onLogout: () -> Unit
) {
    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
            .semantics {
                testTag = "profile-screen"
                contentDescription = "profile-screen"
            },
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Profile",
            style = MaterialTheme.typography.headlineMedium,
            modifier = Modifier
                .padding(bottom = 24.dp)
                .semantics {
                    testTag = "profile-title"
                    contentDescription = "profile-title"
                }
        )

        Card(
            modifier = Modifier
                .fillMaxWidth()
                .semantics {
                    testTag = "profile-card"
                    contentDescription = "profile-card"
                },
            elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
        ) {
            Column(
                modifier = Modifier.padding(24.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                ProfileInfoRow(
                    icon = Icons.Default.Person,
                    label = "Name",
                    value = "Demo User",
                    testTag = "profile-name"
                )

                Divider()

                ProfileInfoRow(
                    icon = Icons.Default.Email,
                    label = "Email",
                    value = "demo@example.com",
                    testTag = "profile-email"
                )

                Divider()

                ProfileInfoRow(
                    icon = Icons.Default.Phone,
                    label = "Phone",
                    value = "+1 (555) 123-4567",
                    testTag = "profile-phone"
                )
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = { /* Edit profile action */ },
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .semantics {
                    testTag = "edit-profile-button"
                    contentDescription = "edit-profile-button"
                },
            colors = ButtonDefaults.buttonColors(
                containerColor = MaterialTheme.colorScheme.secondary
            )
        ) {
            Text("Edit Profile")
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedButton(
            onClick = onLogout,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp)
                .semantics {
                    testTag = "logout-button"
                    contentDescription = "logout-button"
                }
        ) {
            Text("Logout")
        }
    }
}

@Composable
fun ProfileInfoRow(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    label: String,
    value: String,
    testTag: String
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .semantics {
                this.testTag = testTag
                this.contentDescription = testTag
            },
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = label,
            modifier = Modifier.size(24.dp),
            tint = MaterialTheme.colorScheme.primary
        )

        Spacer(modifier = Modifier.width(16.dp))

        Column {
            Text(
                text = label,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Text(
                text = value,
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}
