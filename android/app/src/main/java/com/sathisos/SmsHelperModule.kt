package com.sathisos

import android.app.Activity
import android.content.Intent
import android.provider.Telephony
import android.os.Build
import android.app.role.RoleManager
import android.content.Context
import com.facebook.react.bridge.*

class SmsHelperModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "SmsHelper"

    @ReactMethod
    fun requestDefaultSmsApp(promise: Promise) {
        val activity = currentActivity ?: run {
            promise.reject("NO_ACTIVITY", "Activity is null")
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            val roleManager = reactContext.getSystemService(Context.ROLE_SERVICE) as RoleManager
            if (roleManager.isRoleAvailable(RoleManager.ROLE_SMS)) {
                val intent = roleManager.createRequestRoleIntent(RoleManager.ROLE_SMS)
                activity.startActivityForResult(intent, 2001)
                promise.resolve("ROLE_REQUESTED")
            } else {
                promise.reject("ROLE_NOT_AVAILABLE", "SMS role not available")
            }
        } else {
            val packageName = reactContext.packageName
            val intent = Intent(Telephony.Sms.Intents.ACTION_CHANGE_DEFAULT)
            intent.putExtra(Telephony.Sms.Intents.EXTRA_PACKAGE_NAME, packageName)
            activity.startActivity(intent)
            promise.resolve("INTENT_STARTED")
        }
    }
}
