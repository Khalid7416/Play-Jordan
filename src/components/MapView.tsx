import React, { useState } from 'react';
import { Facility, SportCategory, JordanianCity } from '../types';
import { MapPin, Navigation, Star, ShieldCheck, ChevronRight, Compass } from 'lucide-react';

interface MapViewProps {
  facilities: Facility[];
  selectedSport: SportCategory | 'ALL';
  selectedCity: JordanianCity | 'ALL';
  onSelectFacility: (fac: Facility) => void;
  onBookCourt: (fac: Facility) => void;
}

export const MapView: React.FC<MapViewProps> = ({
  facilities,
  selectedSport,
  selectedCity,
  onSelectFacility,
  onBookCourt,
}) => {
  const [activePinFacility, setActivePinFacility] = useState<Facility | null>(
    facilities[0] || null
  );

  const filtered = facilities.filter((fac) => {
    const matchesSport =
      selectedSport === 'ALL' || fac.sports.includes(selectedSport as SportCategory);
    const matchesCity = selectedCity === 'ALL' || fac.city === selectedCity;
    return matchesSport && matchesCity;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
              Interactive Sports Map of Jordan
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              {filtered.length} Clubs
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Explore venues across Amman, Aqaba, and Jordan governorates. Click any marker to view court details.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Padel / Multi-Sport
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Football / Tennis
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Championship Golf
          </span>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[580px]">
        {/* Left Side: Facility Cards List on Map */}
        <div className="p-4 overflow-y-auto max-h-[620px] space-y-3 border-r border-slate-200 bg-slate-50/50">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
            Venues in Current View
          </span>

          {filtered.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No facilities found matching these filters. Try resetting the sport or city filter.
            </div>
          ) : (
            filtered.map((fac) => {
              const isSelected = activePinFacility?.id === fac.id;
              return (
                <div
                  key={fac.id}
                  onClick={() => setActivePinFacility(fac)}
                  className={`p-4 rounded-2xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-white border-emerald-600 shadow-md ring-2 ring-emerald-500/10'
                      : 'bg-white hover:bg-slate-100/80 border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{fac.name}</h4>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        {fac.area}, {fac.city}
                      </p>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>{fac.rating}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 my-2">
                    {fac.sports.map((s) => (
                      <span key={s} className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">From</span>
                      <span className="font-extrabold text-slate-900">{fac.startingPriceJOD} JOD <span className="font-normal text-[10px] text-slate-400">/hr</span></span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onBookCourt(fac);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                    >
                      Book Court
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: Interactive Jordanian Stylized Canvas / Vector Map */}
        <div className="lg:col-span-2 relative bg-slate-900 p-6 flex flex-col justify-between overflow-hidden">
          {/* Subtle Grid & Jordan Outline Graphics */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:20px_20px]" />
          
          {/* Top Info overlay */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="bg-slate-800/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700 text-xs text-slate-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Hashemite Kingdom of Jordan (GPS Live Network)</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              31.9539° N, 35.9106° E
            </div>
          </div>

          {/* Interactive Map Visual Stage */}
          <div className="relative z-10 my-auto py-10 w-full max-w-lg mx-auto">
            {/* Jordan Map Representation with Regional Hubs */}
            <div className="relative h-80 rounded-3xl bg-gradient-to-b from-slate-800/60 to-slate-900/90 border border-slate-700/60 p-6 flex flex-col justify-between shadow-2xl">
              
              {/* Region 1: Northern Hub (Irbid) */}
              <div className="absolute top-6 left-1/3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Irbid / North
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse border-2 border-slate-900"></div>
              </div>

              {/* Region 2: Greater Amman Metropolitan Area (Major Sports Core) */}
              <div className="absolute top-24 left-1/2 -translate-x-1/2 w-64 bg-slate-800/90 rounded-2xl p-3 border border-emerald-500/40 shadow-xl backdrop-blur-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    Amman Capital Region
                  </span>
                  <span className="text-[9px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
                    5 Featured Hubs
                  </span>
                </div>

                {/* Hotspots in Amman */}
                <div className="space-y-1.5">
                  {facilities
                    .filter((f) => f.city === 'Amman')
                    .map((fac) => {
                      const isPinActive = activePinFacility?.id === fac.id;
                      return (
                        <button
                          key={fac.id}
                          type="button"
                          onClick={() => setActivePinFacility(fac)}
                          className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                            isPinActive
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-700/70 hover:bg-slate-700 text-slate-300'
                          }`}
                        >
                          <span className="truncate">{fac.name}</span>
                          <span className="text-[10px] text-emerald-200 shrink-0 ml-2">
                            {fac.area}
                          </span>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Region 3: Dead Sea / Jordan Valley */}
              <div className="absolute bottom-28 left-16">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Dead Sea (-430m)
                </div>
                <div className="w-3 h-3 rounded-full bg-teal-400 border-2 border-slate-900"></div>
              </div>

              {/* Region 4: Southern Red Sea Hub (Aqaba - Ayla Golf) */}
              <div className="absolute bottom-6 right-12 bg-slate-800/90 rounded-2xl p-3 border border-amber-500/40 shadow-xl backdrop-blur-md w-56">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    Aqaba & Red Sea
                  </span>
                  <span className="text-[9px] text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded">
                    Ayla Oasis
                  </span>
                </div>
                {facilities
                  .filter((f) => f.city === 'Aqaba')
                  .map((fac) => {
                    const isPinActive = activePinFacility?.id === fac.id;
                    return (
                      <button
                        key={fac.id}
                        type="button"
                        onClick={() => setActivePinFacility(fac)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                          isPinActive
                            ? 'bg-amber-600 text-white shadow-sm'
                            : 'bg-slate-700/70 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        <span className="truncate">{fac.name}</span>
                        <span className="text-[10px] text-amber-200 shrink-0 ml-2">18-Hole</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* Active Pin Preview Card Drawer at Bottom */}
          {activePinFacility && (
            <div className="relative z-10 bg-slate-800/95 backdrop-blur-md rounded-2xl p-4 border border-slate-700 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <img
                  src={activePinFacility.images[0]}
                  alt={activePinFacility.name}
                  className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-600"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-white">{activePinFacility.name}</h4>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                      Verified
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{activePinFacility.address}</p>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">
                    Starting from {activePinFacility.startingPriceJOD} JOD / hour
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onSelectFacility(activePinFacility)}
                  className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-slate-200 transition cursor-pointer"
                >
                  Club Details
                </button>
                <button
                  onClick={() => onBookCourt(activePinFacility)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition shadow-sm shadow-emerald-600/30 flex items-center gap-1 cursor-pointer"
                >
                  <span>Book Court</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
