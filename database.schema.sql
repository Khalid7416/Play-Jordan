-- =========================================================================
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

CREATE INDEX idx_users_phone ON users(phone_number);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 4. PHONE OTP VERIFICATION LOGS
CREATE TABLE otp_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(30) NOT NULL,
    otp_code_hash VARCHAR(255) NOT NULL,
    purpose VARCHAR(50) DEFAULT 'registration' NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts_count SMALLINT DEFAULT 0 NOT NULL,
    max_attempts SMALLINT DEFAULT 3 NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_otp_phone_unverified ON otp_verifications(phone_number, is_verified, expires_at);

-- 5. FACILITIES TABLE (Jordanian Sports Clubs & Arenas)
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    name_en VARCHAR(200) NOT NULL,
    name_ar VARCHAR(200),
    tagline VARCHAR(255),
    description TEXT NOT NULL,
    city VARCHAR(50) DEFAULT 'Amman' NOT NULL,
    area VARCHAR(100) NOT NULL,
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
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
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
    name VARCHAR(150) NOT NULL,
    sport sport_category NOT NULL,
    surface VARCHAR(100) NOT NULL,
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
    facility_id UUID REFERENCES facilities(id) ON DELETE CASCADE,
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
    booking_reference VARCHAR(50) UNIQUE NOT NULL,
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_court_date ON bookings(court_id, booking_date);
CREATE INDEX idx_bookings_status ON bookings(status);

-- 9. LOYALTY POINTS LEDGER (Audit Trail)
CREATE TABLE loyalty_points_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    transaction_type VARCHAR(50) NOT NULL,
    points_delta INTEGER NOT NULL,
    balance_after INTEGER NOT NULL CHECK (balance_after >= 0),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_loyalty_user ON loyalty_points_ledger(user_id);

-- 10. REPEAT STREAK MULTIPLIER TRIGGER
CREATE OR REPLACE FUNCTION update_loyalty_on_booking_complete()
RETURNS TRIGGER AS $$
DECLARE
    current_bookings_count INTEGER;
    multiplier NUMERIC(3, 2);
    points_to_award INTEGER;
    new_balance INTEGER;
BEGIN
    IF (NEW.status = 'completed' AND OLD.status != 'completed') THEN
        SELECT completed_bookings_count INTO current_bookings_count
        FROM users WHERE id = NEW.user_id;

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

        points_to_award := ROUND(NEW.final_price_jod * 10 * multiplier);

        UPDATE users
        SET completed_bookings_count = completed_bookings_count + 1,
            loyalty_points_balance = loyalty_points_balance + points_to_award,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.user_id
        RETURNING loyalty_points_balance INTO new_balance;

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
