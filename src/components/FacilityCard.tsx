import React from 'react';
import { Facility } from '../types';
import { MapPin, Star, ShieldCheck, ChevronRight, Zap } from 'lucide-react';

interface FacilityCardProps {
  facility: Facility;
  onSelect: (facility: Facility) => void;
  onBookDirect: (facility: Facility) => void;
}

export const FacilityCard: React.FC<FacilityCardProps> = ({
  facility,
  onSelect,
  onBookDirect,
}) => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group">
      {/* Image & Header Badges */}
      <div className="relative h-52 sm:h-56 overflow-hidden cursor-pointer" onClick={() => onSelect(facility)}>
        <img
          src={facility.images[0] || 'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=800&q=80'}
          alt={facility.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {facility.isVerified && (
            <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Club</span>
            </span>
          )}
          {facility.isFeatured && (
            <span className="bg-amber-500/90 backdrop-blur-md text-white text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>Jordan Top Rated</span>
            </span>
          )}
        </div>

        {/* City / Area Tag on Image */}
        <div className="absolute bottom-3 left-3 text-white">
          <div className="flex items-center gap-1 text-xs font-semibold drop-shadow-md">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span>{facility.area}, {facility.city}</span>
          </div>
        </div>

        {/* Court Count Pill */}
        <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
          {facility.courts.length} {facility.courts.length === 1 ? 'Court/Pitch' : 'Courts/Pitches'}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Sports categories tags */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
            {facility.sports.map((sport) => (
              <span
                key={sport}
                className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100"
              >
                {sport}
              </span>
            ))}
          </div>

          {/* Title & Arabic name */}
          <div className="flex items-start justify-between gap-2 mb-1.5 cursor-pointer" onClick={() => onSelect(facility)}>
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900 group-hover:text-emerald-700 transition">
                {facility.name}
              </h3>
              {facility.nameArabic && (
                <span className="text-xs text-slate-400 block font-normal">
                  {facility.nameArabic}
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-amber-800">{facility.rating}</span>
              <span className="text-[10px] text-amber-600">({facility.reviewCount})</span>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
            {facility.description}
          </p>

          {/* Key Amenities */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {facility.amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className="text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                • {amenity}
              </span>
            ))}
            {facility.amenities.length > 3 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{facility.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Pricing and Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] text-slate-400 font-semibold block uppercase tracking-wider">Starting Rate</span>
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-slate-900">{facility.startingPriceJOD} JOD</span>
              <span className="text-[11px] text-slate-500">/ hr</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelect(facility)}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
            >
              Details
            </button>
            <button
              onClick={() => onBookDirect(facility)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm shadow-emerald-600/20 flex items-center gap-1 cursor-pointer"
            >
              <span>Book Court</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
