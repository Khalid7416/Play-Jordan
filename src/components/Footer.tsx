import React from 'react';
import { ShieldCheck, Heart, MapPin, Phone, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 text-xs border-t border-slate-900 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm">
                PJ
              </div>
              <span className="text-xl font-black font-heading text-white">
                Play<span className="text-emerald-500">Jo</span>
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.5 rounded font-bold">
                Jordan 🇯🇴
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              The Kingdom of Jordan’s premier sports facility directory and court booking platform. Empowering Jordanian athletes, clubs, and youth academies.
            </p>
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Certified Jordanian Sports Platform</span>
            </div>
          </div>

          {/* Col 2: Popular Sports */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-3">Popular Sports in Jordan</h4>
            <ul className="space-y-2">
              <li><span className="hover:text-emerald-400 transition">Indoor & Panoramic Padel (بادل)</span></li>
              <li><span className="hover:text-emerald-400 transition">FIFA 5G AstroTurf Football (كرة قدم)</span></li>
              <li><span className="hover:text-emerald-400 transition">Championship Tennis & Clay (تنس)</span></li>
              <li><span className="hover:text-emerald-400 transition">Ayla Championship Golf (جولف)</span></li>
              <li><span className="hover:text-emerald-400 transition">Basketball & Squash (كرة سلة وسكواش)</span></li>
            </ul>
          </div>

          {/* Col 3: Areas in Jordan */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-3">Locations Across the Kingdom</h4>
            <ul className="space-y-2">
              <li>Amman - Airport Road & 7th Circle</li>
              <li>Amman - Dabouq & Khalda</li>
              <li>Amman - Abdoun & Jabal Amman</li>
              <li>Amman - King Hussein Sports City</li>
              <li>Aqaba - Ayla Oasis Marina</li>
              <li>Irbid & Northern Governorates</li>
            </ul>
          </div>

          {/* Col 4: Payments & Contact */}
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-3">Payments & Support</h4>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>King Abdullah II St, Amman, Jordan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>+962 6 571 0000</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@playjo.com</span>
              </div>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">Supported Payments:</span>
              <div className="flex items-center gap-2 font-bold text-slate-200">
                <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded text-[10px] border border-emerald-800">CliQ Jordan</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px]">Cash at Venue</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded text-[10px]">Visa / MC</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <div>
            © 2026 PlayJo Jordan Inc. All rights reserved. Built with love in Amman, Jordan.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-white transition">Privacy Policy</span>
            <span className="hover:text-white transition">Terms of Service</span>
            <span className="hover:text-white transition">Facility Owner Partner Agreement</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
