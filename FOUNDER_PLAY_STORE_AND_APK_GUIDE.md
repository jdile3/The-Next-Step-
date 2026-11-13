# Founder's Personal Guide: Google Play Store, APK Packaging & Architecture

> **Personal Reference Document for Joshua**  
> All developer-facing notes (like Play Store fees, APK packaging tools, and hosting details) have been removed from the customer-facing app UI and saved here for your personal records.

---

## 1. Google Play Store vs. Apple App Store
- **Google Play Store (Android)**:
  - **Cost**: **$25 one-time registration fee for life** (no annual subscription).
  - Once registered at [play.google.com/console](https://play.google.com/console), you can publish unlimited apps and push unlimited updates forever without paying another dime.
- **Apple App Store (iOS)**:
  - **Cost**: **$99 every single year** forever just to keep an app listed.
  - Focusing on **Web + Android + Windows Desktop** lets you launch with zero recurring store fees.

---

## 2. How to Package Your Live Website into a Standalone Android `.APK` / `.AAB`
Because **The Next Step — Budgeting** is built with a full PWA Manifest (`manifest.json`), Service Worker (`sw.js`), and 192px/512px icons, you can turn your live website URL into a Google Play Store package in 2 minutes:

### Option A: PWABuilder (Easiest — No Coding Required)
1. Go to **[pwabuilder.com](https://www.pwabuilder.com)** and paste your live, Google-verified website URL.
2. Click **Package for Stores** → select **Android**.
3. Download the zip file. It contains:
   - Your `.apk` file (to install directly on any Android phone for testing).
   - Your `.aab` (Android App Bundle) file + signing key (ready to upload straight to Google Play Console).

### Option B: Google Bubblewrap CLI (Official Command-Line Tool)
```bash
npx @bubblewrap/cli init --manifest=https://your-live-domain.com/manifest.json
npx @bubblewrap/cli build
```

---

## 3. VIP Passcode Reference
- **Your Single Friends & Family VIP Passcode**: `VIPforMYhomie`
- **How It Works in Code**:
  - The app never stores the plain-text word `VIPforMYhomie` in the source code.
  - Instead, `src/utils/paywall.ts` hashes whatever the user types using `SHA-256` and compares it to the hash `fad02a6fcc62a4a3fa0ca301a6b879d935790af0feeebecb91a499d877135d4e`.
  - Entering `VIPforMYhomie` in **More → Settings → Unlock Pro / Enter VIP Passcode** permanently unlocks Lifetime Pro (`isPro: true`) with unlimited accounts and zero ads.

---

## 4. Zero-Liability & Zero-Cloud-Bill Architecture
- **100% Local Device Storage**: User financial data lives exclusively in their own device's `localStorage`. You never possess, host, or touch a single user's bank balance or transaction.
- **Zero Paid APIs**: Receipt viewfinder, smart merchant name cleaning, CSV auto-categorization, and recurring bill detection all run 100% inside the user's browser on their own CPU ($0.00 cost to you forever, whether you have 10 users or 1,000,000 users).
- **Zero Image Bloat**: Receipt photos are held only in temporary RAM while the user views the total and enters the transaction, then immediately shredded on save (`0 bytes` saved to storage).
