# THE NEXT STEP — Master AI Welcome Packet & Brand Bible

> **ATTENTION AI AGENT / CODING ASSISTANT:**  
> Read this entire document before writing a single line of code. This is the official **Master Welcome Packet, Architecture Constitution, Brand Identity & Design System** for **The Next Step** ecosystem, founded by **Josh**.

---

## 1. How to Collaborate with Josh (Communication & Workflow Rules)
1. **Collaborate First, Code Second**: Josh is the founder and product visionary, not a traditional coder. Do **not** blindly assume requirements or start rewriting code without explaining your plan in plain, everyday English first. Ask clarifying questions, share your honest technical opinion, go back and forth until you are 100% on the same page, and wait for his green light before executing big changes.
2. **Zero Developer Clutter in the Customer UI**: Never put messages meant for Josh (such as APK packaging instructions, Google Play Store fee notes, or debug telemetry) inside the customer-facing app UI. If you create reference notes for Josh, save them in a separate `.md` file or founder-only view.
3. **Always Use the Latest, Most Updated Coding & Development Techniques**:
   - **Strict Modern Stack**: Use modern **React 19+ functional components & hooks** (`useState`, `useMemo`, `useCallback`, `useEffect`), **strict TypeScript 5.8+**, **Tailwind CSS v4** (`@import "tailwindcss";`), **Vite ES Modules** (`import.meta.dirname`, relative base paths `base: './'`), and the native **Web Crypto API** (`crypto.subtle.digest('SHA-256')`).
   - **Ban Outdated / Legacy Patterns**: Never use legacy React class components, `var`, CommonJS `require()`, `window.alert()`, `window.confirm()`, `window.prompt()`, non-responsive fixed-height modals, or external paid APIs.
   - **Mobile-First Touch Ergonomics**: Every modal popup MUST use `z-[100]`, `max-h-[85vh]`, a flex-column layout with an `overflow-y-auto flex-1` scrollable body, and `shrink-0` sticky headers/footers. Bottom navigation bars MUST stay at `z-40` so modal action buttons are never trapped behind the bottom nav bar on mobile screens.

---

## 2. The Soul & General Feel of "The Next Step"

### Core Philosophy
> **"Meet people where they are. Give them the next step."**  
> *"People who are in a hard place are not horrible people. They need compassion, understanding, and a clear path."*

- **Zero Judgment, Zero Preaching**: Our apps never lecture, scold, or guilt-trip users. Reality is treated as honest math and practical daily execution.
- **Survival & Essentials First**: Whether locking down survival bills before spending, finding a shelter entrance on a cracked phone screen, or logging raw sets in a basement gym, every interface prioritizes clarity, high contrast, and immediate usefulness in 1–2 taps.
- **100% User Privacy**: All user data lives locally on the user's own device (`localStorage`) with zero corporate cloud tracking, zero bank-login spying, and easy 1-tap device-to-device sync codes / JSON backups.

---

## 3. Official Color Scheme & Typography System

Every app in **The Next Step** ecosystem uses this unified color palette and typography:

| Color Name | Hex Code | Tailwind Equivalent | Usage Across the Ecosystem |
| :--- | :--- | :--- | :--- |
| **Midnight Navy** | `#061629` | `bg-[#061629]` | Primary dark brand background, sticky top headers, hero cards |
| **Deep Abyss** | `#040e1b` | `bg-[#040e1b]` | Secondary dark section background & modal footers |
| **Slate Ice** | `#e8eef4` | `bg-[#e8eef4]` | Clean, high-contrast daytime app workspace background |
| **Electric Blue** | `#0284c7` | `bg-sky-600` | Primary action buttons & active highlights |
| **Sky Glow** | `#38bdf8` | `text-sky-400` / `bg-[#38bdf8]` | Signature glowing cyan stairs/arch accent & highlight cards |
| **Growth Emerald**| `#10b981` | `bg-emerald-500` | Positive progress, paid/completed states, recovery bridges |
| **Lime Accent** | `#84cc16` | `text-[#84cc16]` / `bg-lime-500` | Upward arrow accent & **The Next Step: Iron (Gym)** signature color |
| **Alert Rose** | `#f43f5e` | `bg-rose-500` | Past-due bills, stop-loss cliff warnings & street survival alerts |

- **Font Family**: `'Plus Jakarta Sans', sans-serif` (Use `font-black` / `800–900` weight for titles, hero numbers, and badges; `font-bold` / `font-semibold` for buttons and labels).

---

## 4. Official Ecosystem App Logos (`/public/assets/logos/`)

All 5 apps use the exact same engraved 3D visual mark—**rising glowing cyan stairs with `"The Next Step"` engraved along the side, leading to a lime-green upward arrow framed by a glowing cyan circular arch on a dark `#061629` rounded app icon**—with a unique center emblem for each app:

1. **The Next Step: Money (Cash Flow & Bill Defense — LIVE)**
   - **Logo Path**: `/public/assets/logos/the_next_step_money_logo.png`
   - **Center Emblem**: Glowing Lime-to-Emerald Dollar Sign (`$`)
   - **Live URL**: `https://jdile3.github.io/The-Next-Step-/budget.html`
   - **Complete Source & Compiled Archive**: `/public/budget-app-complete-backup.zip`
2. **The Next Step: Iron (Gym & Raw Progressive Overload — NEXT IN LINE)**
   - **Logo Path**: `/public/assets/logos/the_next_step_iron_gym_logo.jpg`
   - **Center Emblem**: Glowing Lime-to-Emerald Heavy Barbell with Weight Plates
   - **Core Purpose**: Fast 1-tap set logging (Weight, Reps, RPE), automatic target progressive overload calculator based on last session, plate math calculator, 100% offline for basement/garage gyms.
3. **The Next Step: Keys (Second-Chance Housing & Work)**
   - **Logo Path**: `/public/assets/logos/the_next_step_housing_logo.jpg`
   - **Center Emblem**: Glowing Lime-to-Emerald House Roofline & Key
   - **Core Purpose**: Second-chance rental listings for people with past evictions or felony records, apartment furnishing connections, and a pocket workforce hub.
4. **The Next Step: Recovery (Detox, Support & "A Better Way")**
   - **Logo Path**: `/public/assets/logos/the_next_step_recovery_logo.jpg`
   - **Center Emblem**: Glowing Lime-to-Emerald Guardian Shield
   - **Core Purpose**: Immediate bridge when someone chooses *"A Better Way"*—connecting directly to local detox beds, peer support, and crisis help without bureaucracy.
5. **The Next Step: Street (Unhoused Survival Resource Finder)**
   - **Logo Path**: `/public/assets/logos/the_next_step_unhoused_logo.jpg`
   - **Center Emblem**: Glowing Lime-to-Emerald A-Frame Shelter Tent
   - **Core Purpose**: Street-level building entrance photos, harm-reduction guides, broken-screen accessibility, and the quiet *"A Better Way"* escape tab.

---

## 5. Non-Negotiable Architecture, Monetization & Deployment Rules

Every app built for **The Next Step** MUST follow this exact architecture:

1. **Zero Monthly Server Bills (100% Local-First)**:
   - Never use paid cloud APIs, paid LLM calls, or monthly database servers. All calculations, OCR/viewfinders, and storage run 100% locally in the user's browser (`localStorage`).
2. **Permanent License Vault (`the_next_step_pro_license_vault_v1`)**:
   - Store the user's `isPro`, `proSource`, `installDate`, `unlockedAt`, and `ownershipSig` inside a dedicated `localStorage` key separate from the app's working data.
   - If a user clicks "Erase / Reset Data" to start fresh, **never** wipe their Pro status or reset their 30-day trial clock. Also embed `ownershipSig` inside JSON backups and device-sync codes.
3. **30-Day Full Trial + Three-Stage Ad Engine + Total Pro Cleanup**:
   - **Days 1–30 (Trial Active, `!isPro`)**: Unrestricted access to features + rotating bottom `AdBanner`.
   - **Day 31+ (Trial Ended, `!isPro`)**: Free tier limits + bottom `AdBanner` + 5-second skippable `VideoAdModal` commercial break on tab switches (with cooldown).
   - **When Paid or VIP (`isPro === true`)**: **100% of banner ads, video ads, upgrade buttons, and settings sections mentioning trials, ads, or VIP codes MUST disappear completely.** Only a static, non-clickable gold `PRO` badge remains in the top header.
4. **Stripe One-Time Checkout ($6.99) + Self-Expiring Session Token**:
   - Live Stripe Link (for Money app): `https://buy.stripe.com/3cIfZiaWi0MYaBz8YNfjG00`
   - Clicking Upgrade starts a 30-minute expiring checkout session in `localStorage`. Returning with `?tns_unlock=TNS_STRIPE_VERIFIED_2026` verifies the active session, immediately destroys the session token so the URL cannot be shared, cleans the URL bar via `window.history.replaceState`, and stamps `ownershipSig` into the License Vault.
5. **Founder's Friends & Family VIP Passcode**:
   - The single manual VIP passcode is `VIPforMYhomie`.
   - **Never** write the plaintext string in code; verify user input using `crypto.subtle.digest('SHA-256')` against hash `fad02a6fcc62a4a3fa0ca301a6b879d935790af0feeebecb91a499d877135d4e`.
6. **GitHub Pages Flat-Root Portability + `ads-and-links.js` Easy Edit Config**:
   - Every app must compile into a single self-contained HTML file (e.g., `budget.html` or `iron.html`) + a tiny plain-English `ads-and-links.js` config file (`window.TNS_MONETIZATION_CONFIG`) so Josh can edit sponsor links and Stripe links directly on GitHub in 10 seconds without recompiling.
