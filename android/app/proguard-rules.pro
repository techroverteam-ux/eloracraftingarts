# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }

# Keep React Native classes
-keep class com.facebook.react.bridge.** { *; }
-keep class com.facebook.react.uimanager.** { *; }
-keep class com.facebook.react.views.** { *; }

# Keep application class
-keep class com.eloracraftingarts.MainApplication { *; }
-keep class com.eloracraftingarts.MainActivity { *; }

# Keep native modules
-keep class * extends com.facebook.react.bridge.ReactContextBaseJavaModule { *; }
-keep class * extends com.facebook.react.bridge.BaseJavaModule { *; }

# Keep React Native Vector Icons
-keep class com.oblador.vectoricons.** { *; }

# Keep Async Storage
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# Keep Navigation
-keep class com.reactnavigation.** { *; }
-keep class com.swmansion.** { *; }

# Keep Gesture Handler
-keep class com.swmansion.gesturehandler.** { *; }

# Keep Safe Area Context
-keep class com.th3rdwave.safeareacontext.** { *; }

# Keep Linear Gradient
-keep class com.BV.LinearGradient.** { *; }

# Keep Screens
-keep class com.swmansion.rnscreens.** { *; }

# Keep Toast Message
-keep class com.calendarevents.** { *; }

# Axios and networking
-keep class okhttp3.** { *; }
-keep class okio.** { *; }
-keep class retrofit2.** { *; }

# General Android optimizations
-optimizationpasses 5
-dontusemixedcaseclassnames
-dontskipnonpubliclibraryclasses
-dontpreverify
-verbose

# Keep annotations
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes InnerClasses
-keepattributes EnclosingMethod

# Keep serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}