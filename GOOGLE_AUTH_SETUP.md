# Google Authentication Setup Guide

## 🔥 Firebase Console Setup Required

To enable Google authentication, you need to configure it in your Firebase project:

### Step 1: Enable Google Provider
1. Go to [Firebase Console](https://console.firebase.google.com/project/ymovies-e4cb4/authentication/providers)
2. Click on "Google" in the Sign-in providers list
3. Click the "Enable" toggle
4. You'll need to:
   - Set a project support email (your email)
   - The Google provider should auto-configure with your project

### Step 2: Add Authorized Domains
1. In the Firebase Console, go to Authentication > Settings > Authorized domains
2. Add these domains for local development:
   - `localhost`
   - `127.0.0.1`
   - `localhost:3001` (if not already there)
   - `127.0.0.1:3001` (if not already there)

### Step 3: Test the Authentication
1. Open http://127.0.0.1:3001 in your browser
2. Click "Continue with Google"
3. You should see a Google OAuth popup

## 🐛 Common Issues

### "Popup Blocked"
- Allow popups in your browser for 127.0.0.1:3001
- Chrome: Click the popup icon in address bar

### "Operation Not Allowed"
- Make sure Google provider is enabled in Firebase Console
- Check that authorized domains include your local development URLs

### "Invalid Origin"
- Add your local development URLs to authorized domains in Firebase Console

## 🔍 Debug Steps

1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Try Google login - you should see debug messages
4. Any errors will show the specific Firebase error code

## 🎯 Current Configuration

Your Firebase project: `ymovies-e4cb4`
Local development URL: `http://127.0.0.1:3001`

The authentication should work once you enable Google provider in Firebase Console!
