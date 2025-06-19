# ⚠️ URGENT: Fix Unauthorized Domain Error

## The Problem
You're getting `auth/unauthorized-domain` because your local development URLs aren't authorized in Firebase.

## Quick Fix (Do This Now):

### Step 1: Go to Firebase Console
1. Open: https://console.firebase.google.com/project/ymovies-e4cb4/authentication/settings
2. Click on "Authorized domains" tab

### Step 2: Add These Domains
Click "Add domain" and add each of these:
- `localhost`
- `127.0.0.1`
- `localhost:3001` 
- `127.0.0.1:3001`

### Step 3: Enable Google Provider
1. Go to: https://console.firebase.google.com/project/ymovies-e4cb4/authentication/providers
2. Click on "Google" provider
3. Toggle "Enable" to ON
4. Set your email as support email
5. Save

### Step 4: Test
1. Refresh http://127.0.0.1:3001
2. Try Google login again

## Alternative: Use Redirect Instead of Popup
If popup still doesn't work, use the "Continue with Google (Redirect)" button instead.

This should fix the unauthorized domain error immediately!
