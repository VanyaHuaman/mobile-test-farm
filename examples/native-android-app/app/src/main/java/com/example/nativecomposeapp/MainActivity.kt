package com.example.nativecomposeapp

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.testTagsAsResourceId
import androidx.compose.ui.ExperimentalComposeUiApi
import com.example.nativecomposeapp.navigation.AppNavGraph
import com.example.nativecomposeapp.ui.theme.NativeComposeAppTheme

class MainActivity : ComponentActivity() {
    @OptIn(ExperimentalComposeUiApi::class)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            NativeComposeAppTheme {
                Surface(
                    modifier = Modifier
                        .fillMaxSize()
                        .semantics {
                            // Makes testTags visible as resourceIds for UIAutomator2
                            // Useful for finding buttons, labels, navigation - NOT for text input
                            testTagsAsResourceId = true
                        },
                    color = MaterialTheme.colorScheme.background
                ) {
                    AppNavGraph()
                }
            }
        }
    }
}
