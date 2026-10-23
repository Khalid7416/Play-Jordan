export const PROJECT_GRAPH_ASCII = `
playjo-sports-platform/
├── 📁 .playjo/
│   ├── 📄 database.schema.sql         # Production PostgreSQL / Relational Schema DDL
│   └── 📄 seed-jordan-facilities.sql  # Initial Jordanian facilities, courts & sample data
├── 📁 public/
│   ├── 🖼️ logo.svg                    # PlayJo crown & sport emblem
│   └── 🖼️ favicon.ico
├── 📁 src/
│   ├── 📁 assets/                     # Sports icons, Jordanian landmarks, badges
│   ├── 📁 components/
│   │   ├── 📁 common/
│   │   │   ├── 📄 Navbar.tsx          # Top bar with RBAC role switcher & PlayPoints pill
│   │   │   ├── 📄 Footer.tsx          # Jordanian sports directory links, legal & contact
│   │   │   └── 📄 Toast.tsx           # Toast notifications (e.g. SMS OTP preview)
│   │   ├── 📁 customer/
│   │   │   ├── 📄 HeroBanner.tsx      # Jordanian hero search, quick sport chips & metrics
│   │   │   ├── 📄 CategoryFilter.tsx  # Sport icons (Padel, Football, Golf, Tennis, etc.)
│   │   │   ├── 📄 FacilityCard.tsx    # Facility card with pricing, amenities, badges
│   │   │   ├── 📄 FacilityModal.tsx   # Detailed court inventory, reviews, gallery
│   │   │   ├── 📄 BookingModal.tsx    # Multi-step booking flow, slots, loyalty points
│   │   │   ├── 📄 MapView.tsx         # Interactive Jordan map (Amman, Aqaba, Irbid)
│   │   │   ├── 📄 DealsPage.tsx       # Discount cards & active promotional coupons
│   │   │   └── 📄 LoyaltyDashboard.tsx# Customer points balance, streak multipliers & history
│   │   ├── 📁 owner/                  # Facility Owner (Field Admin) Portal
│   │   │   ├── 📄 OwnerDashboard.tsx  # KPI overview (JOD revenue, utilization, bookings)
│   │   │   ├── 📄 CourtManager.tsx    # Court inventory, peak/off-peak pricing, status
│   │   │   ├── 📄 ScheduleCalendar.tsx# Live court timetable & QR check-in scanner
│   │   │   └── 📄 PromoManager.tsx    # Facility-specific promo code creator
│   │   ├── 📁 admin/                  # Super Admin (Platform Owner) Portal
│   │   │   ├── 📄 SuperAdminDashboard.tsx # Platform GMV, total bookings & active venues
│   │   │   ├── 📄 FacilityApproval.tsx    # Verification queue for new Jordanian sports clubs
│   │   │   ├── 📄 UserManagement.tsx      # RBAC role management (Customer / Owner / Admin)
│   │   │   └── 📄 PlatformAnalytics.tsx   # Sports popularity chart & governorate metrics
│   │   └── 📁 auth/
│   │       ├── 📄 AuthModal.tsx       # Sign In / Sign Up tabs
│   │       ├── 📄 OTPVerificationModal.tsx # Phone SMS verification (6-digit, 60s cooldown)
│   │       └── 📄 JordanPhoneInput.tsx# Jordanian phone number formatter (+962 7 9/7/8)
│   ├── 📁 data/
│   │   ├── 📄 seedData.ts             # Trax Amman, Padel Arena, Ayla Golf, seed users
│   │   └── 📄 architectureDoc.ts      # Project graph, SQL schema, standalone HTML/JS snippets
│   ├── 📁 utils/
│   │   ├── 📄 pricingAndLoyalty.ts    # Peak hours, streak multiplier, PlayPoints logic
│   │   ├── 📄 pricingAndLoyalty.test.ts # Fast deterministic unit tests (node:test)
│   │   ├── 📄 otpVerification.ts      # Jordanian phone validation & OTP state machine
│   │   └── 📄 otpVerification.test.ts # OTP unit tests (node:test)
│   ├── 📁 types/
│   │   └── 📄 index.ts                # TypeScript interfaces for RBAC, Courts, Bookings
│   ├── 📄 App.tsx                     # Main interactive application shell
│   ├── 📄 main.tsx                    # React DOM entrypoint
│   └── 📄 index.css                   # Tailwind CSS v4 styling & typography
├── 📄 package.json                    # Project dependencies & scripts
├── 📄 tsconfig.json                   # TypeScript compiler configuration
└── 📄 vite.config.ts                  # Vite build configuration
`;

export const SQL_DATABASE_SCHEMA = `-- =========================================================================
-- PLAYJO JORDAN SPORTS PLATFORM - RELATIONAL DATABASE SCHEMA (PostgreSQL)
-- Supports RBAC: Customer, Facility Owner, and Super Admin
-- =========================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. ENUMS
CREATE TYPE user_role AS ENUM ('customer', 'facility_owner', 'super_admin');
CREATE TYPE sport_category AS ENUM (
    'Padel', 'Football', 'Basketball', 'Golf', 
    'Tennis', 'Swimming', 'Squash', 'Badminton'
);
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'checked_in', 'cancelled', 'completed');
CREATE TYPE payment_method AS ENUM ('cash_at_venue', 'cliq_jordan', 'credit_card');
CREATE TYPE discount_type AS ENUM ('percentage', 'fixed_amount');
CREATE TYPE court_status AS ENUM ('active', 'maintenance', 'closed');

-- 3. USERS TABLE (Role-Based Access Control)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone_number VARCHAR(30) UNIQUE NOT NULL, -- Format: +9627XXXXXXXX
    phone_verified BOOLEAN DEFAULT FALSE NOT NULL,
    phone_verified_at TIMESTAMP WITH TIME ZONE,
    role user_role DEFAULT 'customer' NOT NULL,
    loyalty_points_balance INTEGER DEFAULT 0 NOT NULL CHECK (loyalty_points_balance >= 0),
    completed_bookings_count INTEGER DEFAULT 0 NOT NULL,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Index for phone & email lookups
CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 4. PHONE OTP VERIFICATION LOGS
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(30) NOT NULL,
    otp_code_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(50) DEFAULT 'registration' NOT NULL, -- 'registration', 'login', 'booking'
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts_count SMALLINT DEFAULT 0 NOT NULL,
    max_attempts SMALLINT DEFAULT 3 NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_otp_phone_unverified ON otp_verifications(phone_number, is_verified, expires_at);

-- 5. FACILITIES TABLE (Sports Clubs & Arenas across Jordan)
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name_en VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200),
    tagline VARCHAR(255),
    description TEXT NOT NULL,
    city VARCHAR(50) DEFAULT 'Amman' NOT NULL, -- 'Amman', 'Aqaba', 'Irbid', etc.
    area VARCHAR(100) NOT NULL,                -- 'Airport Road', 'Dabouq', 'Abdoun'
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    contact_phone VARCHAR(30) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    opening_time TIME NOT NULL DEFAULT '08:00',
    closing_time TIME NOT NULL DEFAULT '24:00',
    amenities JSONB DEFAULT '[]'::jsonb NOT NULL,
    images JSONB DEFAULT '[]'::jsonb NOT NULL,
    starting_price_jod DECIMAL(10, 2) NOT NULL,
    rating DECIMAL(3, 2) DEFAULT 5.0 NOT NULL,
    reviews_count INTEGER DEFAULT 0 NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE NOT NULL, -- Super Admin must approve
    is_featured BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_facilities_owner ON facilities(owner_id);
CREATE INDEX idx_facilities_city ON facilities(city);
CREATE INDEX idx_facilities_approved ON facilities(is_approved);

-- 6. COURTS / PITCHES TABLE
CREATE TABLE courts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL, -- e.g., 'Court 1 - Indoor Panoramico'
    sport sport_category NOT NULL,
    surface VARCHAR(100) NOT NULL, -- 'Mondo Supercourt XN', '5G AstroTurf', 'Hardwood'
    hourly_rate_offpeak_jod DECIMAL(10, 2) NOT NULL,
    hourly_rate_peak_jod DECIMAL(10, 2) NOT NULL,
    is_indoor BOOLEAN DEFAULT FALSE NOT NULL,
    status court_status DEFAULT 'active' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_courts_facility_sport ON courts(facility_id, sport);

-- 7. PROMOTIONS & DEALS TABLE
CREATE TABLE promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE, -- NULL = platform-wide
    promo_code VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    discount_type discount_type NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_spend_jod DECIMAL(10, 2) DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
    applicable_sports JSONB DEFAULT '["ALL"]'::jsonb NOT NULL,
    max_redemptions INTEGER,
    current_redemptions INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_promotions_code ON promotions(promo_code);

-- 8. BOOKINGS TABLE
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_reference VARCHAR(50) UNIQUE NOT NULL, -- e.g. PJ-2026-9041
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    court_id UUID NOT NULL REFERENCES courts(id) ON DELETE RESTRICT,
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration_minutes INTEGER NOT NULL,
    base_price_jod DECIMAL(10, 2) NOT NULL,
    discount_amount_jod DECIMAL(10, 2) DEFAULT 0.00 NOT NULL,
    points_redeemed INTEGER DEFAULT 0 NOT NULL,
    final_price_jod DECIMAL(10, 2) NOT NULL,
    points_earned INTEGER DEFAULT 0 NOT NULL,
    status booking_status DEFAULT 'confirmed' NOT NULL,
    payment_method payment_method DEFAULT 'cash_at_venue' NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    -- Prevent overlapping reservations on the same court
    CONSTRAINT no_overlapping_court_bookings EXCLUDE USING gist (
        court_id WITH =,
        booking_date WITH =,
        tsrange(
            (booking_date + start_time)::timestamp,
            (booking_date + end_time)::timestamp
        ) WITH &&
    ) WHERE (status IN ('confirmed', 'checked_in'))
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_court_date ON bookings(court_id, booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- 9. LOYALTY POINTS LEDGER TABLE (Audit Trail for Earned & Redeemed Points)
CREATE TABLE loyalty_points_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL, -- 'earned_booking', 'redeemed_booking', 'bonus_multiplier', 'admin_adjustment'
    points_delta INTEGER NOT NULL,          -- Positive for earnings, negative for redemptions
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_loyalty_user ON loyalty_points_ledger(user_id);

-- 10. REPEAT BOOKING STREAK TRIGGER & LOYALTY CALCULATION
CREATE OR REPLACE FUNCTION update_loyalty_on_booking_complete()
RETURNS TRIGGER AS $$
DECLARE
    current_bookings_count INTEGER;
    multiplier NUMERIC(3, 2);
    points_to_award INTEGER;
    new_balance INTEGER;
BEGIN
    IF (NEW.status = 'completed' AND OLD.status != 'completed') THEN
        -- Get user's completed bookings count
        SELECT completed_bookings_count INTO current_bookings_count
        FROM users WHERE id = NEW.user_id;

        -- Determine repeat booking streak multiplier
        IF current_bookings_count >= 5 THEN
            multiplier := 2.00;
        ELSIF current_bookings_count >= 3 THEN
            multiplier := 1.50;
        ELSIF current_bookings_count >= 2 THEN
            multiplier := 1.25;
        ELSIF current_bookings_count >= 1 THEN
            multiplier := 1.10;
        ELSE
            multiplier := 1.00;
        END IF;

        -- Base rule: 10 points per 1 JOD spent
        points_to_award := ROUND(NEW.final_price_jod * 10 * multiplier);

        -- Update user completed bookings and balance
        UPDATE users
        SET completed_bookings_count = completed_bookings_count + 1,
            loyalty_points_balance = loyalty_points_balance + points_to_award,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.user_id
        RETURNING loyalty_points_balance INTO new_balance;

        -- Record ledger entry
        INSERT INTO loyalty_points_ledger (
            user_id, booking_id, transaction_type, points_delta, balance_after, description
        ) VALUES (
            NEW.user_id, NEW.id, 'earned_booking', points_to_award, new_balance,
            CONCAT('Completed booking #', NEW.booking_reference, ' (Streak Multiplier ', multiplier, 'x)')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_booking_loyalty_complete
AFTER UPDATE OF status ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_loyalty_on_booking_complete();
`;

export const STANDALONE_LANDING_PAGE_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PlayJo - Jordan's Sports Facilities & Court Booking</title>
  <!-- Tailwind CSS CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; }
    h1, h2, h3, .font-heading { font-family: 'Space Grotesk', sans-serif; }
  </style>
</head>
<body class="bg-slate-50 text-slate-900 min-h-screen">

  <!-- Header / Navigation -->
  <header class="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-md shadow-emerald-500/20">
          PJ
        </div>
        <div>
          <span class="text-2xl font-black font-heading tracking-tight text-slate-900">Play<span class="text-emerald-600">Jo</span></span>
          <span class="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">الأردن 🇯🇴</span>
        </div>
      </div>

      <nav class="hidden md:flex items-center gap-8 font-medium text-slate-600">
        <a href="#facilities" class="hover:text-emerald-600 transition">Facilities</a>
        <a href="#deals" class="hover:text-emerald-600 transition">Deals & Offers</a>
        <a href="#loyalty" class="hover:text-emerald-600 transition">PlayPoints Rewards</a>
        <a href="#map" class="hover:text-emerald-600 transition">Jordan Map</a>
      </nav>

      <div class="flex items-center gap-4">
        <button id="open-otp-demo" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition shadow-md shadow-emerald-600/20 flex items-center gap-2">
          <span>Join / Sign In</span>
          <span class="text-xs bg-emerald-800 px-1.5 py-0.5 rounded text-emerald-100">SMS OTP</span>
        </button>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <section class="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white py-20 px-4">
    <div class="max-w-6xl mx-auto text-center">
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-sm font-medium mb-6">
        <span>🏆 Jordan's Premier Sports Booking Ecosystem</span>
      </div>
      <h1 class="text-4xl sm:text-6xl font-extrabold font-heading tracking-tight mb-6">
        Book Courts & Fields in <span class="text-emerald-400">Amman & Jordan</span>
      </h1>
      <p class="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10">
        Reserve Padel, Football, Tennis, Golf, and Basketball courts instantly. Earn PlayPoints on every reservation with repeat streak multipliers.
      </p>

      <!-- Search & Filter Bar -->
      <div class="bg-white p-3 sm:p-4 rounded-2xl shadow-2xl max-w-4xl mx-auto text-slate-800 flex flex-col md:flex-row gap-3 items-center">
        <div class="flex-1 w-full text-left px-3">
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider">Sport</label>
          <select class="w-full font-semibold text-slate-800 bg-transparent focus:outline-none">
            <option>All Sports</option>
            <option>Padel</option>
            <option>Football</option>
            <option>Tennis</option>
            <option>Golf</option>
            <option>Basketball</option>
          </select>
        </div>
        <div class="w-full md:w-px md:h-10 bg-slate-200"></div>
        <div class="flex-1 w-full text-left px-3">
          <label class="block text-xs font-bold text-slate-400 uppercase tracking-wider">City / Area</label>
          <select class="w-full font-semibold text-slate-800 bg-transparent focus:outline-none">
            <option>Amman (All Areas)</option>
            <option>Airport Road, Amman</option>
            <option>Dabouq & Khalda, Amman</option>
            <option>Abdoun, Amman</option>
            <option>Aqaba (Ayla & Coast)</option>
            <option>Irbid</option>
          </select>
        </div>
        <button class="w-full md:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/30">
          Find Courts
        </button>
      </div>

      <!-- Trust Badges -->
      <div class="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-slate-400">
        <div class="flex items-center gap-2">✓ 45+ Verified Jordanian Venues</div>
        <div class="flex items-center gap-2">✓ Instant SMS OTP Confirmation</div>
        <div class="flex items-center gap-2">✓ Pay via Cash or CliQ Jordan</div>
        <div class="flex items-center gap-2">✓ Looping Loyalty Multipliers</div>
      </div>
    </div>
  </section>

  <!-- Sports Category Selector -->
  <section class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold font-heading text-slate-900">Explore by Sport</h2>
    </div>
    <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-3">
      <button class="p-4 rounded-xl bg-emerald-600 text-white font-bold text-center flex flex-col items-center gap-2 shadow-sm">
        <span class="text-2xl">🎾</span>
        <span class="text-sm">Padel</span>
      </button>
      <button class="p-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-center flex flex-col items-center gap-2 transition">
        <span class="text-2xl">⚽</span>
        <span class="text-sm">Football</span>
      </button>
      <button class="p-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-center flex flex-col items-center gap-2 transition">
        <span class="text-2xl">🏀</span>
        <span class="text-sm">Basketball</span>
      </button>
      <button class="p-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-center flex flex-col items-center gap-2 transition">
        <span class="text-2xl">⛳</span>
        <span class="text-sm">Golf</span>
      </button>
      <button class="p-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-center flex flex-col items-center gap-2 transition">
        <span class="text-2xl">🎾</span>
        <span class="text-sm">Tennis</span>
      </button>
      <button class="p-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-center flex flex-col items-center gap-2 transition">
        <span class="text-2xl">🏊‍♂️</span>
        <span class="text-sm">Swimming</span>
      </button>
      <button class="p-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-center flex flex-col items-center gap-2 transition">
        <span class="text-2xl">🏸</span>
        <span class="text-sm">Badminton</span>
      </button>
      <button class="p-4 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-center flex flex-col items-center gap-2 transition">
        <span class="text-2xl">💥</span>
        <span class="text-sm">Squash</span>
      </button>
    </div>
  </section>

  <!-- Featured Jordanian Facilities Grid -->
  <section id="facilities" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h2 class="text-3xl font-extrabold font-heading text-slate-900">Featured Jordanian Facilities</h2>
        <p class="text-slate-500 mt-1">Verified clubs with instant court reservation & lighting</p>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- Card 1: Trax Amman -->
      <div class="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition group">
        <div class="relative h-56 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80" alt="Trax Amman" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <div class="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">Verified Club</div>
          <div class="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg">Airport Road, Amman</div>
        </div>
        <div class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Padel • Football • Basketball</span>
            <div class="flex items-center gap-1 text-amber-500 font-bold text-sm">★ 4.9 <span class="text-slate-400 font-normal">(384)</span></div>
          </div>
          <h3 class="text-xl font-bold font-heading text-slate-900 mb-1">Trax Amman (تراكس عمان)</h3>
          <p class="text-sm text-slate-500 line-clamp-2 mb-4">Jordan's premier multi-sport hub with WPT standard indoor/outdoor padel courts, FIFA turf pitches, and lounge.</p>
          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <span class="text-xs text-slate-400 block">Starting from</span>
              <span class="text-xl font-black text-slate-900">18 JOD <span class="text-xs text-slate-500 font-normal">/ hour</span></span>
            </div>
            <button class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition">
              Book Court
            </button>
          </div>
        </div>
      </div>

      <!-- Card 2: Padel Arena Jordan -->
      <div class="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition group">
        <div class="relative h-56 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?auto=format&fit=crop&w=800&q=80" alt="Padel Arena" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <div class="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">Verified Club</div>
          <div class="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg">Dabouq / Khalda</div>
        </div>
        <div class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Indoor Padel</span>
            <div class="flex items-center gap-1 text-amber-500 font-bold text-sm">★ 4.8 <span class="text-slate-400 font-normal">(260)</span></div>
          </div>
          <h3 class="text-xl font-bold font-heading text-slate-900 mb-1">Padel Arena Jordan (بادل أرينا)</h3>
          <p class="text-sm text-slate-500 line-clamp-2 mb-4">6 climate-controlled indoor courts with 12m clear heights, Bullpadel pro shop, and automated video match recording.</p>
          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <span class="text-xs text-slate-400 block">Starting from</span>
              <span class="text-xl font-black text-slate-900">22 JOD <span class="text-xs text-slate-500 font-normal">/ hour</span></span>
            </div>
            <button class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition">
              Book Court
            </button>
          </div>
        </div>
      </div>

      <!-- Card 3: Ayla Golf Club Aqaba -->
      <div class="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition group">
        <div class="relative h-56 overflow-hidden">
          <img src="https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=800&q=80" alt="Ayla Golf Club" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
          <div class="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow">Verified Club</div>
          <div class="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-lg">Aqaba Oasis</div>
        </div>
        <div class="p-6">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-emerald-600 uppercase tracking-wider">Golf • Padel</span>
            <div class="flex items-center gap-1 text-amber-500 font-bold text-sm">★ 4.95 <span class="text-slate-400 font-normal">(195)</span></div>
          </div>
          <h3 class="text-xl font-bold font-heading text-slate-900 mb-1">Ayla Golf Club (أيلة العقبة)</h3>
          <p class="text-sm text-slate-500 line-clamp-2 mb-4">Greg Norman signature 18-hole championship course, floodlit night driving range bays, and Red Sea panoramic padel courts.</p>
          <div class="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <span class="text-xs text-slate-400 block">Starting from</span>
              <span class="text-xl font-black text-slate-900">20 JOD <span class="text-xs text-slate-500 font-normal">/ hour</span></span>
            </div>
            <button class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition">
              Book Court
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

</body>
</html>
`;

export const STANDALONE_OTP_MODAL_HTML = `<!-- =========================================================================
     STANDALONE PHONE VERIFICATION (OTP) MODAL WITH TAILWIND CSS
     ========================================================================= -->
<div id="otp-modal-overlay" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
  <div class="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
    
    <!-- Modal Header -->
    <div class="p-6 pb-0 flex items-center justify-between">
      <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold">
        📱
      </div>
      <button id="close-otp-btn" class="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition">
        ✕
      </button>
    </div>

    <!-- Content -->
    <div class="p-6">
      <h3 class="text-2xl font-extrabold font-heading text-slate-900 mb-2">Verify Phone Number</h3>
      <p class="text-sm text-slate-500 mb-6">
        We sent a 6-digit SMS code to <span id="display-phone" class="font-bold text-slate-800">+962 7 9123 4567</span> to activate your PlayJo athlete account.
      </p>

      <!-- Simulated Demo Helper Banner -->
      <div class="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6 flex items-start gap-3">
        <span class="text-amber-600 text-lg">💡</span>
        <div class="text-xs text-amber-800">
          <span class="font-bold">Jordan SMS Simulator:</span> Use verification code <span id="demo-code-pill" class="font-mono font-bold bg-amber-200 px-1.5 py-0.5 rounded text-amber-900">482910</span> to test verification.
        </div>
      </div>

      <!-- 6-Digit OTP Input Grid -->
      <div class="flex justify-between gap-2 mb-6">
        <input type="text" maxlength="1" class="otp-digit w-12 h-14 text-center text-2xl font-black rounded-xl border-2 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition" autofocus />
        <input type="text" maxlength="1" class="otp-digit w-12 h-14 text-center text-2xl font-black rounded-xl border-2 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition" />
        <input type="text" maxlength="1" class="otp-digit w-12 h-14 text-center text-2xl font-black rounded-xl border-2 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition" />
        <input type="text" maxlength="1" class="otp-digit w-12 h-14 text-center text-2xl font-black rounded-xl border-2 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition" />
        <input type="text" maxlength="1" class="otp-digit w-12 h-14 text-center text-2xl font-black rounded-xl border-2 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition" />
        <input type="text" maxlength="1" class="otp-digit w-12 h-14 text-center text-2xl font-black rounded-xl border-2 border-slate-200 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-none transition" />
      </div>

      <!-- Error / Status Message -->
      <div id="otp-status-message" class="text-sm font-medium text-center mb-4 min-h-[20px]"></div>

      <!-- Verify Button -->
      <button id="verify-otp-btn" class="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition disabled:opacity-50">
        Verify & Continue
      </button>

      <!-- Resend Timer -->
      <div class="mt-6 text-center text-sm text-slate-500">
        Didn't receive code? 
        <button id="resend-otp-btn" disabled class="font-bold text-slate-400 cursor-not-allowed ml-1 hover:underline">
          Resend SMS in <span id="countdown-timer">59</span>s
        </button>
      </div>
    </div>
  </div>
</div>
`;

export const STANDALONE_OTP_LOGIC_JS = `// =========================================================================
// PLAYJO - PHONE NUMBER VERIFICATION (OTP) FLOW LOGIC (Vanilla JavaScript)
// Demonstrates SMS send, 6-digit auto-focus, countdown timer, and verification
// =========================================================================

class PlayJoOTPVerifier {
  constructor(options = {}) {
    this.phone = options.phone || '+962 7 9123 4567';
    this.mockCode = options.mockCode || '482910';
    this.cooldownSeconds = 60;
    this.timerInterval = null;
    this.attemptsRemaining = 3;
    this.isVerified = false;

    this.initElements();
    this.bindEvents();
    this.startCountdown();
  }

  initElements() {
    this.inputs = Array.from(document.querySelectorAll('.otp-digit'));
    this.verifyBtn = document.getElementById('verify-otp-btn');
    this.resendBtn = document.getElementById('resend-otp-btn');
    this.statusEl = document.getElementById('otp-status-message');
    this.countdownEl = document.getElementById('countdown-timer');
    this.demoCodeEl = document.getElementById('demo-code-pill');
    this.displayPhoneEl = document.getElementById('display-phone');

    if (this.displayPhoneEl) this.displayPhoneEl.textContent = this.phone;
    if (this.demoCodeEl) this.demoCodeEl.textContent = this.mockCode;
  }

  bindEvents() {
    // Auto-focus next input and backspace handling
    this.inputs.forEach((input, index) => {
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\\D/g, '');
        e.target.value = val;

        if (val && index < this.inputs.length - 1) {
          this.inputs[index + 1].focus();
        }
      });

      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !input.value && index > 0) {
          this.inputs[index - 1].focus();
        }
      });

      // Support paste full 6-digit code
      input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasted = (e.clipboardData || window.clipboardData).getData('text').trim();
        if (/^\\d{6}$/.test(pasted)) {
          pasted.split('').forEach((char, idx) => {
            if (this.inputs[idx]) this.inputs[idx].value = char;
          });
          this.inputs[this.inputs.length - 1].focus();
        }
      });
    });

    if (this.verifyBtn) {
      this.verifyBtn.addEventListener('click', () => this.handleVerify());
    }

    if (this.resendBtn) {
      this.resendBtn.addEventListener('click', () => this.handleResend());
    }
  }

  getEnteredCode() {
    return this.inputs.map(input => input.value).join('');
  }

  startCountdown() {
    let timeLeft = this.cooldownSeconds;
    if (this.resendBtn) {
      this.resendBtn.disabled = true;
      this.resendBtn.className = 'font-bold text-slate-400 cursor-not-allowed ml-1';
    }

    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      timeLeft -= 1;
      if (this.countdownEl) this.countdownEl.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(this.timerInterval);
        if (this.resendBtn) {
          this.resendBtn.disabled = false;
          this.resendBtn.className = 'font-bold text-emerald-600 cursor-pointer ml-1 hover:underline';
          this.resendBtn.textContent = 'Resend SMS OTP';
        }
      }
    }, 1000);
  }

  handleResend() {
    // Generate new mock code
    this.mockCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (this.demoCodeEl) this.demoCodeEl.textContent = this.mockCode;

    // Reset inputs
    this.inputs.forEach(i => i.value = '');
    this.inputs[0].focus();

    this.showStatus('New SMS code dispatched to ' + this.phone, 'text-emerald-600');
    this.startCountdown();
  }

  handleVerify() {
    const entered = this.getEnteredCode();

    if (entered.length < 6) {
      this.showStatus('Please enter all 6 digits of the SMS code.', 'text-rose-600');
      return;
    }

    this.verifyBtn.disabled = true;
    this.verifyBtn.textContent = 'Verifying...';

    // Simulate backend verification latency
    setTimeout(() => {
      if (entered === this.mockCode) {
        this.isVerified = true;
        this.showStatus('✓ Phone number verified successfully!', 'text-emerald-600 font-bold');
        this.verifyBtn.className = 'w-full py-3.5 bg-emerald-700 text-white font-bold rounded-xl shadow-lg';
        this.verifyBtn.textContent = 'Verified! Welcome to PlayJo';

        // Trigger callback / close modal after 1.2s
        setTimeout(() => {
          const modal = document.getElementById('otp-modal-overlay');
          if (modal) modal.remove();
        }, 1200);
      } else {
        this.attemptsRemaining -= 1;
        this.verifyBtn.disabled = false;
        this.verifyBtn.textContent = 'Verify & Continue';

        if (this.attemptsRemaining <= 0) {
          this.showStatus('Maximum attempts reached. Please request a new code.', 'text-rose-600 font-bold');
          this.verifyBtn.disabled = true;
        } else {
          this.showStatus('Invalid verification code. ' + this.attemptsRemaining + ' attempts remaining.', 'text-rose-600');
        }
      }
    }, 600);
  }

  showStatus(msg, className) {
    if (!this.statusEl) return;
    this.statusEl.textContent = msg;
    this.statusEl.className = 'text-sm font-medium text-center mb-4 ' + className;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.playJoVerifier = new PlayJoOTPVerifier({
    phone: '+962 7 9123 4567',
    mockCode: '482910'
  });
});
`;

export const GITHUB_VERSIONING_GUIDE = `# =========================================================================
# PLAYJO JORDAN - GITHUB SETUP & MULTI-VERSION MANAGEMENT GUIDE
# =========================================================================

# The local Git repository is initialized with:
# - Active Branch: main
# - Release Tag: v1.0.0 (MVP Complete with RBAC, SMS OTP & Loyalty Ledger)
# - Clean .gitignore and comprehensive README.md

# -------------------------------------------------------------------------
# STEP 1: CREATE A REPOSITORY ON GITHUB
# -------------------------------------------------------------------------
# 1. Open https://github.com/new
# 2. Name your repo: playjo-jordan
# 3. Choose Public or Private
# 4. Leave "Add a README" UNCHECKED (already created in workspace)
# 5. Click "Create repository"

# -------------------------------------------------------------------------
# STEP 2: LINK YOUR WORKSPACE TO GITHUB & PUSH
# -------------------------------------------------------------------------
# Replace YOUR_USERNAME with your GitHub handle:

git remote add origin https://github.com/YOUR_USERNAME/playjo-jordan.git
git branch -M main
git push -u origin main --tags

# -------------------------------------------------------------------------
# STEP 3: FIX BLANK WHITE PAGE ON GITHUB PAGES
# -------------------------------------------------------------------------
# Why it was blank:
# 1. Vite defaulted to base: '/' which looked for assets at root domain instead of repo subfolder.
#    -> FIXED: We configured base: './' in vite.config.ts!
# 2. GitHub Pages must serve the compiled 'dist' bundle, NOT raw .tsx files!
#
# HOW TO ACTIVATE GITHUB PAGES (Two Easy Methods):
#
# Method A (Recommended - Automated GitHub Actions):
# 1. Go to your repo on GitHub -> Settings -> Pages.
# 2. Under 'Build and deployment' -> 'Source', select 'GitHub Actions'.
# 3. Done! The workflow in .github/workflows/deploy.yml will auto-build and publish on every push!
#
# Method B (CLI 1-Click with gh-pages):
# Run in terminal:
# npm run deploy
# Then in Settings -> Pages, select branch 'gh-pages' -> '/ (root)'.

# -------------------------------------------------------------------------
# STEP 4: CREATING & MANAGING MULTIPLE VERSIONS
# -------------------------------------------------------------------------

# 1. Semantic Version Releases (Tags):
git tag -a v1.0.0 -m "Release v1.0.0: Full RBAC, SMS OTP, Jordan Venues"
git push origin v1.0.0

# 2. Branch for Version 1.1 (Minor enhancements):
git checkout -b v1.1-court-photos-gallery
git push -u origin v1.1-court-photos-gallery

# 3. Branch for Version 2.0 (Major payments integration):
git checkout -b v2.0-cliq-bank-integration
git push -u origin v2.0-cliq-bank-integration

# 4. Branch for Version 3.0 (Cross-platform PWA / Mobile):
git checkout -b v3.0-mobile-pwa
git push -u origin v3.0-mobile-pwa

# Switch back to stable v1.0 anytime:
git checkout main
`;
