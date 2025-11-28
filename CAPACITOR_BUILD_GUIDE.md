# BlueCycle APK Build Guide 📱

## ✅ Setup Complete!

Capacitor has been installed and configured for BlueCycle Android app build.

### Build APK (3 Easy Steps)

#### Step 1: Build Web Assets
```bash
npm run build
```

#### Step 2: Add Android Platform
```bash
npx cap add android
```
(Only needed first time)

#### Step 3: Build APK
```bash
npx cap build android
```

This generates: `android/app/build/outputs/apk/release/app-release.apk`

### Alternative: Using Android Studio (Recommended for Testing)

```bash
# Open Android Studio and sync
npx cap open android
```

Then in Android Studio:
1. Build → Generate Signed Bundle/APK
2. Select "APK"
3. Choose release keystore (or create new)
4. Finish!

### APK Features Enabled
✅ GPS/Geolocation - For pickup location tracking
✅ Camera - For photo verification
✅ Network - Full API connectivity
✅ Notifications - SMS & push ready

### File Structure
```
/android          ← Generated Android project
  /app/build/outputs/apk/release/  ← Your APK goes here
capacitor.config.ts  ← Configuration
```

### Troubleshooting

**APK won't build?**
- Ensure `npm run build` completes first
- Run `npx cap sync` to update Android files
- Check Android SDK is installed

**App crashes on launch?**
- Check logs: `npx cap run android`
- Ensure API endpoints are correct in production
- Database URL must be accessible

### Publishing to Google Play

When ready:
1. Create signed APK (see Android Studio steps above)
2. Sign with release keystore
3. Upload to Google Play Console
4. Configure: App name, description, privacy policy, etc.

---

**Ready to build?** Run: `npm run build && npx cap add android && npx cap build android`

For detailed docs: https://capacitorjs.com/docs
