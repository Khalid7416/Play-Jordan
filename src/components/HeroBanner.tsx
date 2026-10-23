import React from 'react';
import { Search, MapPin, Sparkles, CheckCircle2 } from 'lucide-react';
import { JordanianCity, SportCategory } from '../types';

interface HeroBannerProps {
  selectedSport: SportCategory | 'ALL';
  onSelectSport: (sport: SportCategory | 'ALL') => void;
  selectedCity: JordanianCity | 'ALL';
  onSelectCity: (city: JordanianCity | 'ALL') => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onOpenDeals: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  selectedSport,
  onSelectSport,
  selectedCity,
  onSelectCity,
  searchQuery,
  onSearchQueryChange,
  onOpenDeals,
}) => {
  return (
    <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
      {/* Decorative ambient gradients */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center">
        {/* Jordan Flag & Mission Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
          <span>🇯🇴 Jordan's Leading Sports Facilities & Court Booking Network</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight mb-5 leading-tight">
          Reserve Courts & Pitches Across <span className="text-emerald-400">Amman & Jordan</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          From WPT indoor padel arenas in Dabouq to FIFA pitches on Airport Road and Greg Norman’s championship golf in Aqaba. Instant court hold, SMS confirmation, and PlayPoints rewards.
        </p>

        {/* Unified Search Bar */}
        <div className="bg-white p-2.5 sm:p-3 rounded-2xl shadow-2xl max-w-4xl mx-auto text-slate-800 flex flex-col md:flex-row gap-2 sm:gap-3 items-center border border-white/20">
          {/* Keyword Search */}
          <div className="flex-1 w-full text-left px-3 py-1 flex items-center gap-2">
            <Search className="w-5 h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Search club, court or area (e.g. Trax, Dabouq)..."
              className="w-full text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
            />
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200"></div>

          {/* Sport Selector */}
          <div className="w-full md:w-48 text-left px-3 py-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sport</label>
            <select
              value={selectedSport}
              onChange={(e) => onSelectSport(e.target.value as SportCategory | 'ALL')}
              className="w-full text-sm font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Sports (All Courts)</option>
              <option value="Padel">Padel (Indoor & Outdoor)</option>
              <option value="Football">Football (5-a-side & 7-a-side)</option>
              <option value="Tennis">Tennis (Clay & Hard)</option>
              <option value="Golf">Golf (Championship & Range)</option>
              <option value="Basketball">Basketball (FIBA Arenas)</option>
              <option value="Swimming">Swimming (Olympic Pools)</option>
              <option value="Squash">Squash (Glass-back)</option>
              <option value="Badminton">Badminton</option>
            </select>
          </div>

          <div className="hidden md:block w-px h-8 bg-slate-200"></div>

          {/* City / Governorate Selector */}
          <div className="w-full md:w-48 text-left px-3 py-1">
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Governorate / City</label>
            <select
              value={selectedCity}
              onChange={(e) => onSelectCity(e.target.value as JordanianCity | 'ALL')}
              className="w-full text-sm font-semibold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Jordan 🇯🇴</option>
              <option value="Amman">Amman (Airport Rd, Dabouq, Abdoun)</option>
              <option value="Aqaba">Aqaba (Ayla Oasis)</option>
              <option value="Irbid">Irbid (North)</option>
              <option value="Dead Sea">Dead Sea</option>
            </select>
          </div>

          {/* Action Button */}
          <button
            onClick={onOpenDeals}
            className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>Discover Deals</span>
          </button>
        </div>

        {/* Trust Points */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>45+ Verified Sports Clubs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Mandatory SMS OTP Security</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>CliQ Jordan & Cash Accepted</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Repeat Streak Multipliers</span>
          </div>
        </div>
      </div>
    </div>
  );
};
