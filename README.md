# PlayJo (الأردن 🇯🇴) — Sports Facilities Directory & Court Booking Platform

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React 19](https://img.shields.io/badge/React-19.0.1-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178c6.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)

**PlayJo** is a comprehensive sports club directory, online court reservation platform, and athlete loyalty system built specifically for the Hashemite Kingdom of Jordan (Amman, Aqaba, Irbid, and the Dead Sea).

---

## 🌟 Key Features

### 1. Multi-Role Access Control (RBAC)
- **Customer Portal**:
  - Interactive sports directory and filterable map of Jordan (Amman, Aqaba, Irbid).
  - Search by sport (Padel, Football, Tennis, Golf, Basketball, Swimming, Squash, Badminton).
  - Multi-step court booking with peak (evening) and off-peak rate calculation in Jordanian Dinars (JOD).
  - Digital Match Pass with QR code for quick check-in at club receptions.
  - Looping Loyalty & Rewards Program: Earn PlayPoints on every match with repeat streak multipliers (1.1x to 2.0x), redeemable for direct booking discounts.
- **Facility Owner Portal (Field Admin)**:
  - Multi-venue switcher (e.g., Trax Amman, Padel Arena Jordan).
  - Real-time revenue & court occupancy analytics.
  - Live daily match schedule with 1-click visitor check-in.
  - Courts & pitches inventory management (surfaces, indoor/outdoor, peak/off-peak rates).
  - Venue-specific promotion creator.
- **Super Admin Portal (Platform Owner)**:
  - Kingdom-wide platform GMV, reservations, and active user metrics.
  - Facility verification and approval queue.
  - User and RBAC role governance.
  - Sports popularity and governorate analytics (Amman 75%, Aqaba 15%, Irbid 10%).

### 2. Mandatory Phone Verification via SMS OTP
- Formatted for Jordanian carriers (+962 7 9xxx xxxx for Zain, 077 for Orange, 078 for Umniah).
- 6-digit OTP verification with automatic input advance, paste support, 60s resend timer, and 3-attempt security limit.

---

## 🏗️ Technical Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide React icons, Motion animations.
- **Build System**: Vite 8.
- **Testing**: Built-in `node:test` and `node:assert/strict` test runner for deterministic unit testing.
- **Database (Concept & Schema)**: PostgreSQL relational schema with UUID primary keys, role enums, foreign keys, non-overlapping court reservation constraints, and loyalty trigger functions.

---

## 🚀 Quick Start & Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/playjo-jordan.git
cd playjo-jordan

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Run unit tests
npm test

# 5. Build for production (outputs to ./dist with relative base path)
npm run build
```

---

## 🌐 Deploying to GitHub Pages (Fix for Blank White Page)

If you saw a blank white page on GitHub Pages, it was caused by two common factors:
1. **Asset Base Path**: Vite by default looks for `/assets/` at the root domain (`https://username.github.io/assets/`) instead of your repository subfolder (`https://username.github.io/playjo/assets/`). This has been fixed in `vite.config.ts` by configuring `base: './'`.
2. **Serving Uncompiled Code**: If GitHub Pages is pointed directly to the `main` branch root, it serves uncompiled `.tsx` files which browsers cannot execute.

### Method 1: Automated GitHub Actions (Recommended)
1. Push your repository to GitHub.
2. In your GitHub repository, click **Settings** → **Pages** (in the left sidebar).
3. Under **Build and deployment** → **Source**, change from *Deploy from a branch* to **GitHub Actions**.
4. The workflow in `.github/workflows/deploy.yml` will automatically build and deploy your site on every commit!

### Method 2: 1-Click CLI Deployment (`gh-pages`)
```bash
npm run deploy
```
This builds your project and publishes the compiled `dist/` directory to a `gh-pages` branch on GitHub. In **Settings** → **Pages**, set **Branch: `gh-pages`** and **Folder: `/ (root)`**.

---

## 📁 Repository Structure

```
├── database.schema.sql         # Production PostgreSQL / Relational Schema DDL
├── src/
│   ├── components/            # UI Components (Customer, Owner, Admin, Auth)
│   ├── data/                  # Seed data (Jordanian facilities, clubs, users)
│   ├── utils/                 # Pure domain logic (pricing, streaks, OTP verification)
│   ├── types/                 # TypeScript interfaces
│   ├── App.tsx                # Main SPA application
│   └── index.css              # Tailwind CSS styling
├── package.json
└── vite.config.ts
```

---

## 🌿 Managing Multiple Versions on GitHub

To support multiple versions or feature tracks (e.g., MVP release, Mobile app integration, Payment gateway rollout):

```bash
# 1. Create a release tag for version 1.0
git tag -a v1.0.0 -m "Release v1.0.0: MVP with Customer, Owner, Admin & SMS OTP"
git push origin v1.0.0

# 2. Create a new branch for the next version (e.g., v2.0-cliq-payments)
git checkout -b feature/v2.0-cliq-direct-integration
git push -u origin feature/v2.0-cliq-direct-integration

# 3. Create a branch for mobile optimization / PWA
git checkout -b feature/v2.0-mobile-pwa
```

---

## ⚖️ License
Licensed under the Apache-2.0 License.
