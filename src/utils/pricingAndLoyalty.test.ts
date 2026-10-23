import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isPeakHour,
  getLoyaltyTier,
  getStreakMultiplier,
  pointsToJOD,
  calculateBookingPrice,
} from './pricingAndLoyalty';
import { Court, Promotion } from '../types';

const mockCourt: Court = {
  id: 'c-1',
  name: 'Trax Court 1 - Panoramic',
  sport: 'Padel',
  surface: 'Indoor Mondo Supercourt',
  hourlyRateOffPeak: 20, // 20 JOD
  hourlyRatePeak: 30, // 30 JOD
  isIndoor: true,
  status: 'active',
};

test('isPeakHour detects daytime off-peak vs evening peak hours in Jordan', () => {
  assert.equal(isPeakHour('10:00'), false);
  assert.equal(isPeakHour('14:30'), false);
  assert.equal(isPeakHour('16:59'), false);
  assert.equal(isPeakHour('17:00'), true);
  assert.equal(isPeakHour('20:30'), true);
  assert.equal(isPeakHour('23:00'), true);
});

test('getLoyaltyTier assigns proper tiers based on points threshold', () => {
  assert.equal(getLoyaltyTier(250).tierName, 'Silver Jo-Athlete');
  assert.equal(getLoyaltyTier(500).tierName, 'Gold Jo-Athlete');
  assert.equal(getLoyaltyTier(1450).tierName, 'Gold Jo-Athlete');
  assert.equal(getLoyaltyTier(2000).tierName, 'Platinum Jo-Athlete');
  assert.equal(getLoyaltyTier(5000).tierName, 'Platinum Jo-Athlete');
});

test('getStreakMultiplier scales with repeated completed bookings', () => {
  assert.equal(getStreakMultiplier(0), 1.0);
  assert.equal(getStreakMultiplier(1), 1.1);
  assert.equal(getStreakMultiplier(2), 1.25);
  assert.equal(getStreakMultiplier(3), 1.5);
  assert.equal(getStreakMultiplier(4), 1.5);
  assert.equal(getStreakMultiplier(5), 2.0);
  assert.equal(getStreakMultiplier(10), 2.0);
});

test('pointsToJOD converts 100 PlayPoints to 1 JOD', () => {
  assert.equal(pointsToJOD(0), 0);
  assert.equal(pointsToJOD(99), 0);
  assert.equal(pointsToJOD(100), 1);
  assert.equal(pointsToJOD(550), 5);
  assert.equal(pointsToJOD(1450), 14);
});

test('calculateBookingPrice calculates base price, off-peak vs peak correctly', () => {
  // Off-peak 60 mins: 20 JOD
  const offPeak = calculateBookingPrice({
    court: mockCourt,
    startTime: '11:00',
    durationMinutes: 60,
    completedBookingsCount: 0,
  });
  assert.equal(offPeak.isPeak, false);
  assert.equal(offPeak.hourlyRate, 20);
  assert.equal(offPeak.basePrice, 20);
  assert.equal(offPeak.finalPrice, 20);
  assert.equal(offPeak.loyaltyPointsEarned, 200); // 20 * 10 * 1.0

  // Peak 90 mins: 30 * 1.5 = 45 JOD
  const peak = calculateBookingPrice({
    court: mockCourt,
    startTime: '19:00',
    durationMinutes: 90,
    completedBookingsCount: 3, // multiplier 1.5x
  });
  assert.equal(peak.isPeak, true);
  assert.equal(peak.hourlyRate, 30);
  assert.equal(peak.basePrice, 45);
  assert.equal(peak.multiplier, 1.5);
  // 45 JOD * 10 = 450 base points * 1.5 multiplier = 675 points
  assert.equal(peak.loyaltyPointsEarned, 675);
});

test('calculateBookingPrice handles promotions and points discount with 50% cap', () => {
  const promo: Promotion = {
    id: 'promo-1',
    title: 'Amman Weekend 20% Off',
    code: 'WEEKEND20',
    discountType: 'percentage',
    discountValue: 20,
    validUntil: '2026-12-31',
    applicableSports: ['Padel'],
    description: 'Get 20% off',
    usageCount: 12,
  };

  // Base 30 JOD peak slot
  // 20% off = 6 JOD discount -> price = 24 JOD
  // Redeem 500 points (5 JOD)
  // Final price = 24 - 5 = 19 JOD
  const result = calculateBookingPrice({
    court: mockCourt,
    startTime: '18:00',
    durationMinutes: 60,
    promo,
    pointsToRedeem: 500,
    completedBookingsCount: 1, // 1.1x multiplier
  });

  assert.equal(result.basePrice, 30);
  assert.equal(result.promoDiscount, 6);
  assert.equal(result.pointsDiscount, 5);
  assert.equal(result.finalPrice, 19);
});
