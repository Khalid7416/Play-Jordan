import React, { useState, useId } from 'react';
import { Facility, Court, User, Promotion, Booking } from '../types';
import { calculateBookingPrice, pointsToJOD } from '../utils/pricingAndLoyalty';
import { 
  X, 
  Calendar, 
  Clock, 
  Tag, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  CreditCard, 
  Banknote, 
  Send 
} from 'lucide-react';

interface BookingModalProps {
  facility: Facility | null;
  initialCourt: Court | null;
  currentUser: User;
  activePromotions: Promotion[];
  onClose: () => void;
  onBookingConfirmed: (newBooking: Booking, pointsDelta: number) => void;
  onRequestPhoneVerify: () => void;
  onViewMyBookings?: () => void;
}

const AVAILABLE_SLOTS = [
  { time: '08:30', isPeak: false },
  { time: '10:00', isPeak: false },
  { time: '11:30', isPeak: false },
  { time: '14:00', isPeak: false },
  { time: '15:30', isPeak: false },
  { time: '17:00', isPeak: true },
  { time: '18:30', isPeak: true },
  { time: '20:00', isPeak: true },
  { time: '21:30', isPeak: true },
  { time: '23:00', isPeak: true },
];

export const BookingModal: React.FC<BookingModalProps> = ({
  facility,
  initialCourt,
  currentUser,
  activePromotions,
  onClose,
  onBookingConfirmed,
  onRequestPhoneVerify,
}) => {
  if (!facility) return null;

  const pointsInputId = useId();
  const [selectedCourt, setSelectedCourt] = useState<Court>(
    initialCourt || facility.courts[0]
  );
  const [bookingDate, setBookingDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedSlot, setSelectedSlot] = useState<string>('18:30');
  const [durationMinutes, setDurationMinutes] = useState<number>(90);
  const [promoCodeInput, setPromoCodeInput] = useState<string>('');
  const [appliedPromo, setAppliedPromo] = useState<Promotion | null>(null);
  const [promoError, setPromoError] = useState<string>('');
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash_at_venue' | 'cliq_jordan' | 'credit_card'>('cliq_jordan');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Calculate pricing breakdown
  const pricing = calculateBookingPrice({
    court: selectedCourt,
    startTime: selectedSlot,
    durationMinutes,
    promo: appliedPromo,
    pointsToRedeem,
    completedBookingsCount: currentUser.completedBookingsCount,
  });

  const maxPointsCanRedeem = Math.min(
    currentUser.loyaltyPoints,
    Math.floor((pricing.basePrice - pricing.promoDiscount) * 0.5) * 100
  );

  const handleApplyPromo = () => {
    setPromoError('');
    if (!promoCodeInput.trim()) return;

    const code = promoCodeInput.trim().toUpperCase();
    const found = activePromotions.find(
      (p) => p.code.toUpperCase() === code && (!p.facilityId || p.facilityId === facility.id)
    );

    if (!found) {
      setPromoError('Invalid coupon code or not applicable to this facility.');
      setAppliedPromo(null);
      return;
    }

    if (found.minSpendJOD && pricing.basePrice < found.minSpendJOD) {
      setPromoError(`Minimum spend of ${found.minSpendJOD} JOD required for this offer.`);
      setAppliedPromo(null);
      return;
    }

    setAppliedPromo(found);
  };

  const handleConfirmReservation = () => {
    if (!currentUser.phoneVerified) {
      onRequestPhoneVerify();
      return;
    }

    setIsSubmitting(true);

    // Calculate end time
    const [startHour, startMin] = selectedSlot.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMin + durationMinutes;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinutes = totalMinutes % 60;
    const endTimeStr = `${String(endHour).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newBooking: Booking = {
      id: `book-${Date.now()}`,
      bookingRef: `PJ-2026-${randomSuffix}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userPhone: currentUser.phone,
      facilityId: facility.id,
      facilityName: facility.name,
      facilityArea: `${facility.area}, ${facility.city}`,
      courtId: selectedCourt.id,
      courtName: selectedCourt.name,
      sport: selectedCourt.sport,
      date: bookingDate,
      startTime: selectedSlot,
      endTime: endTimeStr,
      durationMinutes,
      basePriceJOD: pricing.basePrice,
      discountAmountJOD: pricing.promoDiscount + pricing.pointsDiscount,
      loyaltyPointsRedeemed: pointsToRedeem,
      finalPriceJOD: pricing.finalPrice,
      loyaltyPointsEarned: pricing.loyaltyPointsEarned,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      paymentMethod,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setConfirmedBooking(newBooking);
      // Net points delta = earned - redeemed
      const netPoints = pricing.loyaltyPointsEarned - pointsToRedeem;
      onBookingConfirmed(newBooking, netPoints);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8">
        {/* If reservation is confirmed, show the digital match pass */}
        {confirmedBooking ? (
          <div className="p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <span className="text-xs font-bold text-emerald-700 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Booking Confirmed
            </span>

            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 mt-2">
              You're Ready to Play!
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Instant SMS confirmation sent to <span className="font-bold text-slate-800">{currentUser.phone}</span>.
            </p>

            {/* Match Pass Ticket Card */}
            <div className="bg-slate-50 rounded-2xl p-5 border-2 border-dashed border-slate-300 text-left mb-6 relative">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Facility & Court</span>
                  <h4 className="text-lg font-bold text-slate-900">{confirmedBooking.facilityName}</h4>
                  <p className="text-xs text-emerald-700 font-semibold">{confirmedBooking.courtName}</p>
                  <p className="text-xs text-slate-500">{confirmedBooking.facilityArea}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Booking Ref</span>
                  <div className="font-mono text-base font-black text-slate-900">{confirmedBooking.bookingRef}</div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Confirmed</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
                <div>
                  <span className="text-slate-400 block text-[10px]">Date</span>
                  <span className="font-bold text-slate-800">{confirmedBooking.date}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Time Slot</span>
                  <span className="font-bold text-slate-800">{confirmedBooking.startTime} - {confirmedBooking.endTime}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Payment</span>
                  <span className="font-bold text-slate-800 uppercase">{confirmedBooking.paymentMethod.replace(/_/g, ' ')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Total Paid/Due</span>
                  <span className="font-black text-emerald-700 text-sm">{confirmedBooking.finalPriceJOD} JOD</span>
                </div>
              </div>

              {/* QR Code and Check-in info */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center">
                    <QrCode className="w-10 h-10 text-slate-800" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Show QR Code at Reception</span>
                    <span className="text-[11px] text-slate-500">Fast check-in & ball pickup</span>
                  </div>
                </div>

                <div className="text-right bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl">
                  <span className="text-[10px] text-amber-700 font-bold block">+ {confirmedBooking.loyaltyPointsEarned} PlayPoints</span>
                  <span className="text-[9px] text-amber-600">Streak Bonus Included</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                if (onViewMyBookings) {
                  onViewMyBookings();
                } else {
                  onClose();
                }
              }}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/30 cursor-pointer"
            >
              Done & View My Bookings
            </button>
          </div>
        ) : (
          <div>
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Court Reservation</span>
                <h3 className="text-xl font-bold font-heading text-slate-900">{facility.name}</h3>
                <span className="text-xs text-slate-500">{facility.area}, {facility.city}</span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer"
                aria-label="Close booking modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Phone Verification Notice if not verified */}
              {!currentUser.phoneVerified && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                  <div className="text-xs text-amber-900">
                    <span className="font-bold block">Phone Number Verification Required</span>
                    <span>To prevent court hold spam, Jordanian phone verification via SMS OTP is required before booking.</span>
                  </div>
                  <button
                    onClick={onRequestPhoneVerify}
                    className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition"
                  >
                    Verify Phone
                  </button>
                </div>
              )}

              {/* Court Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  1. Select Court or Pitch
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {facility.courts.map((court) => (
                    <button
                      key={court.id}
                      type="button"
                      onClick={() => setSelectedCourt(court)}
                      className={`p-3 rounded-xl text-left border transition cursor-pointer ${
                        selectedCourt.id === court.id
                          ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900">{court.name}</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                          {court.sport}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        Off-peak: {court.hourlyRateOffPeak} JOD • Peak: {court.hourlyRatePeak} JOD
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    2. Booking Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={bookingDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:border-emerald-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    3. Match Duration
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDurationMinutes(60)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        durationMinutes === 60
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      60 Minutes (1 hr)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDurationMinutes(90)}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                        durationMinutes === 90
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      90 Minutes (1.5 hrs)
                    </button>
                  </div>
                </div>
              </div>

              {/* Time Slots Grid */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    4. Choose Time Slot
                  </label>
                  <span className="text-[11px] text-slate-400">
                    * Evening 17:00+ is Jordan Peak Lighting Rate
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {AVAILABLE_SLOTS.map((slot) => {
                    const isSelected = selectedSlot === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        onClick={() => setSelectedSlot(slot.time)}
                        className={`p-2.5 rounded-xl text-center border transition cursor-pointer ${
                          isSelected
                            ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-slate-50/60'
                        }`}
                      >
                        <div className="font-bold text-xs">{slot.time}</div>
                        <div
                          className={`text-[9px] font-semibold mt-0.5 ${
                            isSelected
                              ? 'text-emerald-100'
                              : slot.isPeak
                              ? 'text-amber-600 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          {slot.isPeak ? 'Peak' : 'Off-peak'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Promo Code & PlayPoints Redeem */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Promotions & PlayPoints
                </span>

                {/* Promo Code Row */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCodeInput}
                    onChange={(e) => setPromoCodeInput(e.target.value)}
                    placeholder="Enter promo code (e.g. EARLYPADEL25, PLAYJO20)"
                    className="flex-1 p-2 rounded-xl border border-slate-200 text-xs font-semibold uppercase placeholder:normal-case focus:outline-none focus:border-emerald-600 bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                {promoError && <p className="text-[11px] text-rose-600 font-semibold">{promoError}</p>}
                {appliedPromo && (
                  <div className="text-xs text-emerald-700 font-bold flex items-center justify-between bg-emerald-100/60 px-3 py-1.5 rounded-lg border border-emerald-200">
                    <span>Applied: {appliedPromo.title} (-{pricing.promoDiscount} JOD)</span>
                    <button
                      type="button"
                      onClick={() => setAppliedPromo(null)}
                      className="text-emerald-900 underline text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                )}

                {/* Points Slider */}
                {currentUser.loyaltyPoints > 0 && maxPointsCanRedeem > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Redeem PlayPoints Balance ({currentUser.loyaltyPoints} pts available):
                      </span>
                      <span className="font-bold text-emerald-700">
                        -{pricing.pointsDiscount} JOD ({pointsToRedeem} pts)
                      </span>
                    </div>
                    <label htmlFor={pointsInputId} className="sr-only">Redeem PlayPoints</label>
                    <input
                      id={pointsInputId}
                      type="range"
                      min={0}
                      max={maxPointsCanRedeem}
                      step={100}
                      value={pointsToRedeem}
                      onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                      className="w-full accent-emerald-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>0 pts</span>
                      <span>Max {maxPointsCanRedeem} pts ({pointsToJOD(maxPointsCanRedeem)} JOD max 50% discount)</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  5. Payment Option
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cliq_jordan')}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      paymentMethod === 'cliq_jordan'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 text-xs'
                    }`}
                  >
                    <Send className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    <span className="text-xs block">CliQ Jordan</span>
                    <span className="text-[9px] text-emerald-700 font-semibold">Instant 0% fee</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_at_venue')}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      paymentMethod === 'cash_at_venue'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 text-xs'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                    <span className="text-xs block">Cash at Venue</span>
                    <span className="text-[9px] text-slate-400 font-semibold">Pay on arrival</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border text-center transition cursor-pointer ${
                      paymentMethod === 'credit_card'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50 text-xs'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mx-auto mb-1 text-slate-600" />
                    <span className="text-xs block">Visa / Master</span>
                    <span className="text-[9px] text-slate-400 font-semibold">Jordan cards</span>
                  </button>
                </div>
              </div>

              {/* Price Breakdown Card */}
              <div className="p-4 rounded-2xl bg-emerald-950 text-white space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Base Rate ({pricing.durationHours} hrs @ {pricing.hourlyRate} JOD/hr {pricing.isPeak ? 'Peak' : 'Off-peak'})</span>
                  <span className="font-bold text-white">{pricing.basePrice} JOD</span>
                </div>
                {pricing.promoDiscount > 0 && (
                  <div className="flex justify-between text-emerald-300">
                    <span>Promotional Discount</span>
                    <span className="font-bold">-{pricing.promoDiscount} JOD</span>
                  </div>
                )}
                {pricing.pointsDiscount > 0 && (
                  <div className="flex justify-between text-amber-300">
                    <span>PlayPoints Redeemed ({pointsToRedeem} pts)</span>
                    <span className="font-bold">-{pricing.pointsDiscount} JOD</span>
                  </div>
                )}
                <div className="pt-2 border-t border-emerald-800 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs text-slate-400 block">Total Due</span>
                    <span className="text-2xl font-black text-emerald-400">{pricing.finalPrice} JOD</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-amber-300 block">
                      ★ Earns {pricing.loyaltyPointsEarned} PlayPoints
                    </span>
                    <span className="text-[9px] text-slate-400">
                      Streak Multiplier: {pricing.multiplier}x
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmReservation}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <span>{isSubmitting ? 'Confirming...' : 'Confirm Reservation & Hold Court'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
