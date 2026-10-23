export type UserRole = 'customer' | 'facility_owner' | 'super_admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  phoneVerified: boolean;
  avatarUrl?: string;
  loyaltyPoints: number;
  completedBookingsCount: number;
  createdAt: string;
  facilityIds?: string[]; // IDs of facilities owned if facility_owner
}

export type SportCategory = 
  | 'Padel' 
  | 'Football' 
  | 'Basketball' 
  | 'Golf' 
  | 'Tennis' 
  | 'Swimming' 
  | 'Squash' 
  | 'Badminton';

export type JordanianCity = 
  | 'Amman' 
  | 'Aqaba' 
  | 'Irbid' 
  | 'Dead Sea' 
  | 'Zarqa';

export interface Court {
  id: string;
  name: string;
  sport: SportCategory;
  surface: string; // e.g., 'Indoor Mondo Supercourt', 'Outdoor AstroTurf 5G', 'Clay'
  hourlyRateOffPeak: number; // in JOD
  hourlyRatePeak: number; // in JOD
  isIndoor: boolean;
  status: 'active' | 'maintenance' | 'closed';
}

export interface Facility {
  id: string;
  ownerId: string;
  name: string;
  nameArabic?: string;
  tagline: string;
  description: string;
  city: JordanianCity;
  area: string; // e.g., 'Airport Road', 'Dabouq', '7th Circle', 'Abdoun'
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  phone: string;
  email: string;
  sports: SportCategory[];
  amenities: string[]; // e.g. ['Floodlights', 'Free Parking', 'Locker Rooms & Showers', 'Pro Shop', 'Cafe & Smoothies']
  courts: Court[];
  openingHours: {
    open: string; // '08:00'
    close: string; // '24:00'
  };
  rating: number;
  reviewCount: number;
  images: string[];
  startingPriceJOD: number;
  isVerified: boolean;
  isFeatured?: boolean;
}

export interface Promotion {
  id: string;
  facilityId?: string; // null means platform-wide
  facilityName?: string;
  title: string;
  code: string;
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number; // e.g. 20 for 20% or 5 for 5 JOD
  minSpendJOD?: number;
  validUntil: string;
  applicableSports: (SportCategory | 'ALL')[];
  description: string;
  usageCount: number;
  maxUsage?: number;
}

export type BookingStatus = 'confirmed' | 'checked_in' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  bookingRef: string; // e.g. PJ-2026-8921
  userId: string;
  userName: string;
  userPhone: string;
  facilityId: string;
  facilityName: string;
  facilityArea: string;
  courtId: string;
  courtName: string;
  sport: SportCategory;
  date: string; // YYYY-MM-DD
  startTime: string; // '18:00'
  endTime: string; // '19:30'
  durationMinutes: number;
  basePriceJOD: number;
  discountAmountJOD: number;
  loyaltyPointsRedeemed: number;
  finalPriceJOD: number;
  loyaltyPointsEarned: number;
  status: BookingStatus;
  createdAt: string;
  paymentMethod: 'cash_at_venue' | 'cliq_jordan' | 'credit_card';
  notes?: string;
}

export interface LoyaltyLedgerEntry {
  id: string;
  userId: string;
  bookingId?: string;
  description: string;
  pointsDelta: number; // positive earned, negative redeemed
  balanceAfter: number;
  createdAt: string;
}

export interface OTPRecord {
  id: string;
  phone: string;
  code: string;
  purpose: 'registration' | 'login' | 'booking_confirmation';
  expiresAt: number; // timestamp
  attempts: number;
  verified: boolean;
  createdAt: number;
}
