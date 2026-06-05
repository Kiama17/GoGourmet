# Play Store / App Store Assets

## Required Screenshots

Place screenshots in this directory before store submission.

### Phone Screenshots (Android)
- `phone-home.png` — Home screen with menu (1080×1920)
- `phone-menu.png` — Food detail view (1080×1920)
- `phone-cart.png` — Cart screen (1080×1920)
- `phone-checkout.png` — Checkout flow (1080×1920)
- `phone-orders.png` — Order tracking (1080×1920)

### Phone Screenshots (iOS)
Same files as above; iOS requires 6.5" (1242×2688) and 5.5" (1242×2208) variants.

### Tablet Screenshots (optional)
- `tablet-home.png` (2048×2732)

### Feature Graphic (Android)
- `feature-graphic.png` — 1024×500, used in Play Store listing

### App Icon
- `icon.png` — 1024×1024 (used for both stores)

### Preview Video (optional)
- `preview.mp4` — 30s max, highlights key features

---

## How to capture screenshots

### Option 1: ADB script (Android emulator)
1. Build and install the APK on an Android emulator
2. Open the app and navigate to each screen
3. Run `.\scripts\take-screenshots.ps1` (requires PowerShell 7+ and ADB)
4. The script will save PNGs to this directory

### Option 2: Manual capture
1. Open the app on an emulator or device
2. Take screenshots via the device's screenshot gesture
3. Transfer the images to this directory with the filenames listed above

### Option 3: Expo Go capture
1. Open the app in Expo Go on a physical device
2. Take screenshots on the device
3. Transfer and rename to match the filenames above

---

## Generating the Feature Graphic

Create a 1024×500 PNG (`feature-graphic.png`) using any image editor with the app logo and tagline. The feature graphic appears at the top of the Play Store listing.

Recommended layout:
- Background: warm orange gradient (#ff6b00 → #ffa559)
- App logo centered
- App name "GoGourmet" in white bold text
- Tagline: "Delicious food, delivered fast"
- Minimal, clean design

## App Icon generation

Generate a 1024×1024 PNG (`icon.png`) with the app icon:
- Orange background (#ff6b00)
- White plate/fork icon or "G" monogram centered
- Rounded corners implied by the store (use a square image, stores apply their own mask)
