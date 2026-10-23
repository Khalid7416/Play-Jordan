import React from 'react';
import { SportCategory } from '../types';

interface CategoryFilterProps {
  selectedSport: SportCategory | 'ALL';
  onSelectSport: (sport: SportCategory | 'ALL') => void;
  sportCounts: Record<string, number>;
}

const CATEGORIES: { id: SportCategory | 'ALL'; label: string; icon: string; arabic: string }[] = [
  { id: 'ALL', label: 'All Sports', icon: '⚡', arabic: 'جميع الرياضات' },
  { id: 'Padel', label: 'Padel', icon: '🎾', arabic: 'بادل' },
  { id: 'Football', label: 'Football', icon: '⚽', arabic: 'كرة قدم' },
  { id: 'Basketball', label: 'Basketball', icon: '🏀', arabic: 'كرة سلة' },
  { id: 'Golf', label: 'Golf', icon: '⛳', arabic: 'جولف' },
  { id: 'Tennis', label: 'Tennis', icon: '🎾', arabic: 'تنس' },
  { id: 'Swimming', label: 'Swimming', icon: '🏊‍♂️', arabic: 'سباحة' },
  { id: 'Squash', label: 'Squash', icon: '💥', arabic: 'سكواش' },
  { id: 'Badminton', label: 'Badminton', icon: '🏸', arabic: 'ريشة' },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedSport,
  onSelectSport,
  sportCounts,
}) => {
  return (
    <div className="py-6 border-b border-slate-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Filter by Sport Category:
          </span>
          <span className="text-xs text-slate-500 font-medium">
            Showing {selectedSport === 'ALL' ? 'all activities' : selectedSport}
          </span>
        </div>

        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedSport === cat.id;
            const count = cat.id === 'ALL' 
              ? Object.values(sportCounts).reduce((a, b) => a + b, 0)
              : sportCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectSport(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
                {count > 0 && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      isSelected
                        ? 'bg-emerald-700 text-emerald-100'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
