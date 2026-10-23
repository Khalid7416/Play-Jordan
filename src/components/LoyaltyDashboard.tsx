import React, { useState } from 'react';
import { User, Booking, LoyaltyLedgerEntry } from '../types';
import { getLoyaltyTier, getStreakMultiplier, pointsToJOD } from '../utils/pricingAndLoyalty';
import { 
  Trophy, 
  Sparkles, 
  Flame, 
  History, 
  Calendar, 
  Clock, 
  MapPin, 
  QrCode, 
  CheckCircle2, 
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  ShieldCheck
} from 'lucide-react';

interface LoyaltyDashboardProps {
  currentUser: User;
  bookings: Booking[];
  ledger: LoyaltyLedgerEntry[];
  onCancelBooking: (bookingId: string) => void;
  onViewBookingPass: (booking: Booking) => void;
}

export const LoyaltyDashboard: React.FC<LoyaltyDashboardProps> = ({
  currentUser,
  bookings,
  ledger,
  onCancelBooking,
  onViewBookingPass,
}) => {
  const [selectedSubTab, setSelectedSubTab] = useState<'bookings' | 'ledger' | 'tiers'>('bookings');
  const tierInfo = getLoyaltyTier(currentUser.loyaltyPoints);
  const currentStreakMultiplier = getStreakMultiplier(currentUser.completedBookingsCount);
  const cashEquivalentJOD = pointsToJOD(currentUser.loyaltyPoints);

  // User bookings
  const userBookings = bookings.filter((b) => b.userId === currentUser.id);
  const upcomingBookings = userBookings.filter((b) => b.status === 'confirmed');
  const pastBookings = userBookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Greeting & User Overview */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-sm"
            />
            {currentUser.phoneVerified && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shadow" title="Phone Verified">
                ✓
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                {currentUser.name}
              </h1>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${tierInfo.badgeBg}`}>
                {tierInfo.tierName}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Phone: <span className="font-semibold text-slate-700">{currentUser.phone}</span> • Athlete ID: <span className="font-mono text-slate-600">{currentUser.id}</span>
            </p>
          </div>
        </div>

        {/* Quick Streak Pill */}
        <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4 rounded-2xl">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Flame className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-900 flex items-center gap-1">
              <span>Repeat Booking Streak:</span>
              <span className="text-amber-700 font-extrabold">{currentUser.completedBookingsCount} Matches</span>
            </div>
            <p className="text-[11px] text-amber-700">
              Current Multiplier: <strong className="text-amber-900 font-black">{currentStreakMultiplier}x PlayPoints</strong> per booking
            </p>
          </div>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {/* Card 1: Balance */}
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-slate-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
          <div className="relative z-10">
            <span className="text-xs text-emerald-300 font-semibold uppercase tracking-wider block mb-1">
              Active PlayPoints Balance
            </span>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl sm:text-5xl font-black font-heading">
                {currentUser.loyaltyPoints}
              </span>
              <span className="text-sm font-semibold text-emerald-200">pts</span>
            </div>
            <p className="text-xs text-emerald-100 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Redeemable value: <strong>{cashEquivalentJOD} JOD</strong> at checkout</span>
            </p>
          </div>
          <div className="absolute right-2 -bottom-6 opacity-10 text-9xl font-black select-none pointer-events-none">
            PJ
          </div>
        </div>

        {/* Card 2: Streak Level */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Looping Streak Multiplier
              </span>
              <span className="text-xs font-black bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                {currentStreakMultiplier}x Active
              </span>
            </div>
            <div className="text-2xl font-black text-slate-900 font-heading mb-1">
              {currentUser.completedBookingsCount} Completed Bookings
            </div>
            <p className="text-xs text-slate-500">
              Every completed match boosts your PlayPoints earning rate. Next tier unlock: 5 matches for 2.0x Platinum Multiplier!
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (currentUser.completedBookingsCount / 5) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>1.0x (1)</span>
              <span>1.25x (2)</span>
              <span>1.5x (3-4)</span>
              <span>2.0x (5+)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Membership Tier */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                Jordan Athlete Status
              </span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-slate-900 font-heading mb-1">
              {tierInfo.tierName}
            </div>
            <ul className="text-xs text-slate-500 space-y-1 mt-2">
              {tierInfo.perks.slice(0, 2).map((perk, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
          </div>

          {tierInfo.nextTierPoints && (
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
              {tierInfo.nextTierPoints - currentUser.loyaltyPoints} points until Platinum Jo-Athlete tier.
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200 mb-6">
        <button
          onClick={() => setSelectedSubTab('bookings')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition cursor-pointer ${
            selectedSubTab === 'bookings'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          My Court Bookings ({userBookings.length})
        </button>

        <button
          onClick={() => setSelectedSubTab('ledger')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition cursor-pointer ${
            selectedSubTab === 'ledger'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Points History & Ledger ({ledger.length})
        </button>

        <button
          onClick={() => setSelectedSubTab('tiers')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition cursor-pointer ${
            selectedSubTab === 'tiers'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
        >
          Tier Perks & Streak Rules
        </button>
      </div>

      {/* Subtab 1: Bookings List */}
      {selectedSubTab === 'bookings' && (
        <div className="space-y-6">
          {/* Upcoming Reservations */}
          <div>
            <h3 className="text-base font-extrabold font-heading text-slate-900 mb-3 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              Upcoming Confirmed Bookings ({upcomingBookings.length})
            </h3>

            {upcomingBookings.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                You have no upcoming bookings. Explore our Jordanian clubs directory to reserve a court!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingBookings.map((b) => (
                  <div
                    key={b.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-500 transition flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase">
                            REF: {b.bookingRef}
                          </span>
                          <h4 className="text-base font-bold text-slate-900">{b.facilityName}</h4>
                          <p className="text-xs text-emerald-700 font-semibold">{b.courtName}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Confirmed
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 my-3 p-3 bg-slate-50 rounded-xl">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.date}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.startTime} - {b.endTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{b.facilityArea}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-bold text-slate-900">
                          <span>Paid: {b.finalPriceJOD} JOD</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => onViewBookingPass(b)}
                        className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Digital Match Pass</span>
                      </button>

                      <button
                        onClick={() => onCancelBooking(b.id)}
                        className="text-xs font-semibold text-rose-600 hover:text-rose-800 transition cursor-pointer"
                      >
                        Cancel Reservation
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past Bookings */}
          <div>
            <h3 className="text-base font-extrabold font-heading text-slate-900 mb-3 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              Past Match History ({pastBookings.length})
            </h3>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="p-3">Ref</th>
                      <th className="p-3">Club & Court</th>
                      <th className="p-3">Date & Time</th>
                      <th className="p-3">Total JOD</th>
                      <th className="p-3">Points Earned</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pastBookings.map((b) => (
                      <tr key={b.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{b.bookingRef}</td>
                        <td className="p-3">
                          <span className="font-semibold block text-slate-900">{b.facilityName}</span>
                          <span className="text-[11px] text-slate-500">{b.courtName}</span>
                        </td>
                        <td className="p-3">
                          <div>{b.date}</div>
                          <div className="text-[11px] text-slate-400">{b.startTime} - {b.endTime}</div>
                        </td>
                        <td className="p-3 font-bold text-slate-900">{b.finalPriceJOD} JOD</td>
                        <td className="p-3 font-bold text-emerald-700">+{b.loyaltyPointsEarned} pts</td>
                        <td className="p-3">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              b.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 2: Points Ledger */}
      {selectedSubTab === 'ledger' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Points Audit Ledger
            </span>
            <span className="text-xs text-slate-500">
              Current balance: <strong className="text-emerald-700">{currentUser.loyaltyPoints} PlayPoints</strong>
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {ledger.map((entry) => (
              <div key={entry.id} className="p-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      entry.pointsDelta > 0
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {entry.pointsDelta > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">{entry.description}</h5>
                    <span className="text-[11px] text-slate-400">{entry.createdAt.replace('T', ' ').slice(0, 16)}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    className={`font-black text-sm ${
                      entry.pointsDelta > 0 ? 'text-emerald-700' : 'text-rose-600'
                    }`}
                  >
                    {entry.pointsDelta > 0 ? `+${entry.pointsDelta}` : entry.pointsDelta} pts
                  </div>
                  <span className="text-[10px] text-slate-400">Balance: {entry.balanceAfter} pts</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subtab 3: Tiers & Rules */}
      {selectedSubTab === 'tiers' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-200">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tier 1</span>
            <h4 className="text-xl font-bold font-heading text-slate-900 mt-1 mb-2">Silver Jo-Athlete</h4>
            <div className="text-sm font-semibold text-emerald-700 mb-4">0 - 499 PlayPoints</div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2">✓ Earn 10 PlayPoints per 1 JOD spent</li>
              <li className="flex items-center gap-2">✓ 100 points = 1.000 JOD discount</li>
              <li className="flex items-center gap-2">✓ Instant SMS OTP notifications</li>
            </ul>
          </div>

          <div className="bg-white rounded-3xl p-6 border-2 border-yellow-400 shadow-md">
            <span className="text-xs font-bold text-yellow-600 uppercase tracking-wider">Tier 2 (Current)</span>
            <h4 className="text-xl font-bold font-heading text-slate-900 mt-1 mb-2">Gold Jo-Athlete</h4>
            <div className="text-sm font-semibold text-yellow-700 mb-4">500 - 1,999 PlayPoints</div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2">✓ All Silver perks</li>
              <li className="flex items-center gap-2 font-bold text-slate-900">✓ 1.25x - 1.5x Multiplier on streaks</li>
              <li className="flex items-center gap-2">✓ 10% discount at venue pro-shops</li>
              <li className="flex items-center gap-2">✓ Free electrolyte water at Trax & Padel Arena</li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-amber-950 text-white rounded-3xl p-6 shadow-lg">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Tier 3 (Elite)</span>
            <h4 className="text-xl font-bold font-heading text-white mt-1 mb-2">Platinum Jo-Athlete</h4>
            <div className="text-sm font-semibold text-amber-300 mb-4">2,000+ PlayPoints</div>
            <ul className="text-xs text-slate-300 space-y-2">
              <li className="flex items-center gap-2">✓ All Gold perks</li>
              <li className="flex items-center gap-2 font-bold text-amber-200">✓ 2.0x Streak Multiplier on 5+ bookings</li>
              <li className="flex items-center gap-2">✓ Free racquet rental at all partner venues</li>
              <li className="flex items-center gap-2">✓ 14-day advance priority reservation window</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
