package com.example.nativecomposeapp.ui.screens

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Group
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTag

sealed class BottomNavItem(
    val route: String,
    val title: String,
    val icon: ImageVector,
    val testTag: String
) {
    object Users : BottomNavItem("users", "Users", Icons.Default.Group, "users-tab")
    object Profile : BottomNavItem("profile", "Profile", Icons.Default.Person, "profile-tab")
    object Settings : BottomNavItem("settings", "Settings", Icons.Default.Settings, "settings-tab")
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onLogout: () -> Unit
) {
    var selectedTab by remember { mutableStateOf<BottomNavItem>(BottomNavItem.Users) }

    Scaffold(
        modifier = Modifier.semantics {
            testTag = "home-screen"
            contentDescription = "home-screen"
        },
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        text = "Native Android App",
                        modifier = Modifier.semantics {
                            testTag = "app-title"
                            contentDescription = "app-title"
                        }
                    )
                }
            )
        },
        bottomBar = {
            NavigationBar(
                modifier = Modifier.semantics {
                    testTag = "bottom-navigation"
                    contentDescription = "bottom-navigation"
                }
            ) {
                listOf(
                    BottomNavItem.Users,
                    BottomNavItem.Profile,
                    BottomNavItem.Settings
                ).forEach { item ->
                    NavigationBarItem(
                        icon = { Icon(item.icon, contentDescription = item.title) },
                        label = { Text(item.title) },
                        selected = selectedTab == item,
                        onClick = { selectedTab = item },
                        modifier = Modifier.semantics {
                            testTag = item.testTag
                            contentDescription = item.testTag
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        when (selectedTab) {
            is BottomNavItem.Users -> UsersListScreen(
                modifier = Modifier.padding(innerPadding)
            )
            is BottomNavItem.Profile -> ProfileScreen(
                modifier = Modifier.padding(innerPadding),
                onLogout = onLogout
            )
            is BottomNavItem.Settings -> SettingsScreen(
                modifier = Modifier.padding(innerPadding)
            )
        }
    }
}
