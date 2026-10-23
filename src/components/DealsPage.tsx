import React, { useState } from 'react';
import { Promotion, Facility } from '../types';
import { Tag, Sparkles, Copy, Check, Clock, Calendar, ArrowRight } from 'lucide-react';

interface DealsPageProps {
  promotions: Promotion[];
  facilities: Facility[];
  onBookWithDeal: (facility: Facility, promo: Promotion) => void;
}

export const DealsPage: React.FC<DealsPageProps> = ({
  promotions,
  facilities,
  onBookWithDeal,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-12 text-white mb-10 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            <span>Jordan Sports Promotions & Exclusive Vouchers</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-heading tracking-tight mb-4">
            Exclusive Deals & Court Discounts
          </h1>
          <p className="text-sm sm:text-base text-white/90 leading-relaxed">
            Discover limited-time court hold discounts, morning padel passes, and weekend tournament specials across Amman, Aqaba, and Jordan.
          </p>
        </div>

        {/* Floating background graphic */}
        <div className="absolute right-4 -bottom-10 opacity-15 text-[180px] font-black select-none pointer-events-none">
          %
        </div>
      </div>

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {promotions.map((promo) => {
          const matchedFacility = promo.facilityId
            ? facilities.find((f) => f.id === promo.facilityId)
            : null;

          return (
            <div
              key={promo.id}
              className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Tag className="w-3 h-3 text-amber-600" />
                    {promo.discountType === 'percentage'
                      ? `${promo.discountValue}% OFF`
                      : `${promo.discountValue} JOD DISCOUNT`}
                  </span>

                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Expires {promo.validUntil}
                  </span>
                </div>

                {/* Promo Title */}
                <h3 className="text-xl font-bold font-heading text-slate-900 group-hover:text-emerald-700 transition mb-2">
                  {promo.title}
                </h3>

                {/* Venue name if specific */}
                <div className="text-xs font-semibold text-emerald-700 mb-3">
                  📍 {promo.facilityName || 'All Verified Jordanian Clubs'}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {promo.description}
                </p>

                {/* Applicable sports */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {promo.applicableSports.map((sport) => (
                    <span
                      key={sport}
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                    >
                      {sport}
                    </span>
                  ))}
                  {promo.minSpendJOD && (
                    <span className="text-[10px] font-medium text-slate-400 self-center">
                      Min spend {promo.minSpendJOD} JOD
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom: Copy Code & Apply */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-dashed border-slate-300">
                  <div className="font-mono text-sm font-black text-slate-800 tracking-wider">
                    {promo.code}
                  </div>
                  <button
                    onClick={() => handleCopy(promo.code)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-slate-200 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    title="Copy code"
                  >
                    {copiedCode === promo.code ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[11px] text-emerald-600 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {matchedFacility ? (
                  <button
                    onClick={() => onBookWithDeal(matchedFacility, promo)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Book at {matchedFacility.name} with Deal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (facilities[0]) onBookWithDeal(facilities[0], promo);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Use Code on Any Court</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
