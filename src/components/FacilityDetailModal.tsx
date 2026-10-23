import React from 'react';
import { Facility, Court } from '../types';
import { 
  X, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Star, 
  ShieldCheck, 
  Calendar, 
  Check, 
  ExternalLink 
} from 'lucide-react';

interface FacilityDetailModalProps {
  facility: Facility | null;
  onClose: () => void;
  onBookCourt: (facility: Facility, court: Court) => void;
}

export const FacilityDetailModal: React.FC<FacilityDetailModalProps> = ({
  facility,
  onClose,
  onBookCourt,
}) => {
  if (!facility) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 my-8 max-h-[90vh] flex flex-col">
        {/* Modal Header with Gallery */}
        <div className="relative h-64 sm:h-72 shrink-0">
          <img
            src={facility.images[0]}
            alt={facility.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-black/30" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 text-white hover:bg-black/80 flex items-center justify-center transition backdrop-blur-xs cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge & Title */}
          <div className="absolute bottom-4 left-6 right-6 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="bg-emerald-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Facility in Jordan
              </span>
              <div className="flex items-center gap-1 bg-amber-500/90 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                <Star className="w-3.5 h-3.5 fill-white" />
                <span>{facility.rating} ({facility.reviewCount} Reviews)</span>
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading">
              {facility.name}
            </h2>
            {facility.nameArabic && (
              <span className="text-emerald-300 text-sm font-medium">
                {facility.nameArabic} • {facility.tagline}
              </span>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {/* Quick Info Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block text-slate-900">{facility.area}, {facility.city}</span>
                <span className="text-slate-500 text-[11px]">{facility.address}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block text-slate-900">Opening Hours</span>
                <span className="text-slate-500 text-[11px]">Daily: {facility.openingHours.open} - {facility.openingHours.close}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold block text-slate-900">Direct Club Contact</span>
                <span className="text-slate-500 text-[11px]">{facility.phone}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">About the Club</h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              {facility.description}
            </p>
          </div>

          {/* Amenities */}
          <div>
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Facility Amenities</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {facility.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-700">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Court Inventory & Rates */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Available Courts & Fields</h4>
              <span className="text-xs text-slate-500">Pick a court to reserve date & time slot</span>
            </div>

            <div className="space-y-3">
              {facility.courts.map((court) => (
                <div
                  key={court.id}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">{court.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        {court.sport}
                      </span>
                      {court.isIndoor ? (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          Indoor (Air Conditioned)
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                          Outdoor Stadium
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      Surface: <span className="font-medium text-slate-700">{court.surface}</span>
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">
                        Off-peak: <span className="font-bold text-slate-700">{court.hourlyRateOffPeak} JOD</span>
                      </div>
                      <div className="text-sm font-extrabold text-slate-900">
                        Peak: <span className="text-emerald-700">{court.hourlyRatePeak} JOD</span> <span className="text-[10px] font-normal text-slate-500">/hr</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onBookCourt(facility, court);
                      }}
                      className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-sm shadow-emerald-600/20 cursor-pointer"
                    >
                      Book Court
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Bookings earn <span className="font-bold text-emerald-700">10 PlayPoints per 1 JOD</span> spent.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
