import { Court, Promotion } from '../types';

export interface PriceBreakdown {
  isPeak: boolean;
  hourlyRate: number;
  durationHours: number;
  basePrice: number;
  promoDiscount: number;
  pointsDiscount: number;
  finalPrice: number;
  loyaltyPointsEarned: number;
  multiplier: number;
}

/**
 * Determines whether a time slot in Jordan is peak hour.
 * In Jordanian sports clubs, peak hours are 17:00 - 23:30.
 */
export function isPeakHour(timeStr: string): boolean {
  if (!timeStr) return false;
  const hour = parseInt(timeStr.split(':')[0], 10);
  return hour >= 17 && hour <= 23;
}

/**
 * Returns the loyalty tier based on total points.
 */
export function getLoyaltyTier(points: number): {
  tierName: 'Silver Jo-Athlete' | 'Gold Jo-Athlete' | 'Platinum Jo-Athlete';
  color: string;
  badgeBg: string;
  minPoints: number;
  nextTierPoints?: number;
  perks: string[];
} {
  if (points >= 2000) {
    return {
      tierName: 'Platinum Jo-Athlete',
      color: 'text-amber-500',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      minPoints: 2000,
      perks: [
        '2.0x Points Multiplier on 5+ booking streaks',
        'Free racquet & ball rental at partner clubs',
        'VIP priority booking access 14 days in advance',
        '15% off at venue cafes & pro-shops',
      ],
    };
  }
  if (points >= 500) {
    return {
      tierName: 'Gold Jo-Athlete',
      color: 'text-yellow-600',
      badgeBg: 'bg-yellow-100 text-yellow-900 border-yellow-300',
      minPoints: 500,
      nextTierPoints: 2000,
      perks: [
        '1.25x - 1.5x Points Multiplier on streaks',
        'Free bottled water & electrolyte towel at Trax & Padel Arena',
        'Priority booking hold for 15 minutes',
        '10% off at venue pro-shops',
      ],
    };
  }
  return {
    tierName: 'Silver Jo-Athlete',
    color: 'text-slate-600',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    minPoints: 0,
    nextTierPoints: 500,
    perks: [
      'Earn 10 PlayPoints per 1 JOD spent',
      'Redeem points for direct booking discounts',
      'Instant SMS court confirmation',
      'Exclusive member deals',
    ],
  };
}

/**
 * Streak multiplier based on completed past bookings.
 * Looping/repeated bookings yield multipliers.
 */
export function getStreakMultiplier(completedBookingsCount: number): number {
  if (completedBookingsCount >= 5) return 2.0;
  if (completedBookingsCount >= 3) return 1.5;
  if (completedBookingsCount >= 2) return 1.25;
  if (completedBookingsCount >= 1) return 1.1;
  return 1.0;
}

/**
 * Convert loyalty points to JOD discount.
 * 100 points = 1.000 JOD.
 */
export function pointsToJOD(points: number): number {
  return Math.floor(points / 100);
}

/**
 * Calculate full booking pricing, promotions, points redemption and points earned.
 */
export function calculateBookingPrice(params: {
  court: Court;
  startTime: string;
  durationMinutes: number;
  promo?: Promotion | null;
  pointsToRedeem?: number;
  completedBookingsCount: number;
}): PriceBreakdown {
  const {
    court,
    startTime,
    durationMinutes,
    promo,
    pointsToRedeem = 0,
    completedBookingsCount,
  } = params;

  const isPeak = isPeakHour(startTime);
  const hourlyRate = isPeak ? court.hourlyRatePeak : court.hourlyRateOffPeak;
  const durationHours = durationMinutes / 60;
  const rawBasePrice = hourlyRate * durationHours;
  const basePrice = Math.round(rawBasePrice * 100) / 100;

  // Promo code discount
  let promoDiscount = 0;
  if (promo) {
    if (!promo.minSpendJOD || basePrice >= promo.minSpendJOD) {
      if (promo.discountType === 'percentage') {
        promoDiscount = Math.round((basePrice * (promo.discountValue / 100)) * 100) / 100;
      } else {
        promoDiscount = Math.min(basePrice, promo.discountValue);
      }
    }
  }

  const priceAfterPromo = Math.max(0, basePrice - promoDiscount);

  // Maximum redeemable discount is 50% of price after promo
  const maxPointsDiscount = Math.floor(priceAfterPromo * 0.5);
  const requestedPointsDiscount = pointsToJOD(pointsToRedeem);
  const pointsDiscount = Math.min(maxPointsDiscount, requestedPointsDiscount);

  const finalPrice = Math.max(0, Math.round((priceAfterPromo - pointsDiscount) * 100) / 100);

  // Points earned calculation
  const multiplier = getStreakMultiplier(completedBookingsCount);
  const basePointsEarned = Math.round(finalPrice * 10);
  const loyaltyPointsEarned = Math.round(basePointsEarned * multiplier);

  return {
    isPeak,
    hourlyRate,
    durationHours,
    basePrice,
    promoDiscount,
    pointsDiscount,
    finalPrice,
    loyaltyPointsEarned,
    multiplier,
  };
}
