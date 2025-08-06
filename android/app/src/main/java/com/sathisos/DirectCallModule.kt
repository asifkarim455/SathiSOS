package com.sathisos

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import android.content.Context
import androidx.core.content.ContextCompat.startActivity
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DirectCallModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "DirectCallModule"

    @ReactMethod
    fun makeDirectCall(phoneNumber: String) {
        try {
            val context = reactApplicationContext
            val callIntent = Intent(Intent.ACTION_CALL)
            callIntent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
            callIntent.data = Uri.parse("tel:$phoneNumber")
            context.startActivity(callIntent)
        } catch (e: Exception) {
            Log.e("DirectCall", "Error placing call: ${e.message}")
        }
    }
}
