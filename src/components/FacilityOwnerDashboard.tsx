import React, { useState } from 'react';
import { Facility, Court, Booking, Promotion, SportCategory } from '../types';
import { 
  Building2, 
  DollarSign, 
  Calendar, 
  Plus, 
  CheckCircle, 
  Clock, 
  Users, 
  TrendingUp, 
  Tag, 
  Settings, 
  Check, 
  AlertCircle,
  Eye,
  Camera
} from 'lucide-react';

interface FacilityOwnerDashboardProps {
  ownerFacilities: Facility[];
  allBookings: Booking[];
  promotions: Promotion[];
  onUpdateCourt: (facilityId: string, updatedCourts: Court[]) => void;
  onAddPromotion: (newPromo: Promotion) => void;
  onCheckInBooking: (bookingId: string) => void;
}

export const FacilityOwnerDashboard: React.FC<FacilityOwnerDashboardProps> = ({
  ownerFacilities,
  allBookings,
  promotions,
  onUpdateCourt,
  onAddPromotion,
  onCheckInBooking,
}) => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    ownerFacilities[0]?.id || ''
  );
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'courts' | 'promotions'>('overview');

  // New Court Form state
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtSport, setNewCourtSport] = useState<SportCategory>('Padel');
  const [newCourtSurface, setNewCourtSurface] = useState('Mondo Supercourt XN');
  const [newCourtOffPeak, setNewCourtOffPeak] = useState('20');
  const [newCourtPeak, setNewCourtPeak] = useState('30');
  const [newCourtIndoor, setNewCourtIndoor] = useState(true);
  const [showAddCourtModal, setShowAddCourtModal] = useState(false);

  // New Promotion Form state
  const [showAddPromoModal, setShowAddPromoModal] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('20');
  const [newPromoType, setNewPromoType] = useState<'percentage' | 'fixed_amount'>('percentage');
  const [newPromoMinSpend, setNewPromoMinSpend] = useState('25');

  const currentFacility = ownerFacilities.find((f) => f.id === selectedFacilityId) || ownerFacilities[0];

  if (!currentFacility) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-slate-500">
        No facilities found under your owner account.
      </div>
    );
  }

  // Filter bookings for this facility
  const facilityBookings = allBookings.filter((b) => b.facilityId === currentFacility.id);
  const upcomingFacilityBookings = facilityBookings.filter((b) => b.status === 'confirmed');

  // Revenue metrics
  const totalRevenueJOD = facilityBookings.reduce((sum, b) => sum + b.finalPriceJOD, 0);
  const totalHoursBooked = facilityBookings.reduce((sum, b) => sum + b.durationMinutes / 60, 0);

  // Facility-specific promotions
  const facilityPromos = promotions.filter((p) => p.facilityId === currentFacility.id);

  const handleCreateCourt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourtName.trim()) return;

    const newCourt: Court = {
      id: `court-${Date.now()}`,
      name: newCourtName.trim(),
      sport: newCourtSport,
      surface: newCourtSurface,
      hourlyRateOffPeak: Number(newCourtOffPeak) || 20,
      hourlyRatePeak: Number(newCourtPeak) || 30,
      isIndoor: newCourtIndoor,
      status: 'active',
    };

    const updatedCourts = [...currentFacility.courts, newCourt];
    onUpdateCourt(currentFacility.id, updatedCourts);
    setShowAddCourtModal(false);
    setNewCourtName('');
  };

  const handleToggleCourtStatus = (courtId: string) => {
    const updated = currentFacility.courts.map((c) => {
      if (c.id === courtId) {
        return {
          ...c,
          status: c.status === 'active' ? ('maintenance' as const) : ('active' as const),
        };
      }
      return c;
    });
    onUpdateCourt(currentFacility.id, updated);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim() || !newPromoTitle.trim()) return;

    const promo: Promotion = {
      id: `promo-${Date.now()}`,
      facilityId: currentFacility.id,
      facilityName: currentFacility.name,
      title: newPromoTitle.trim(),
      code: newPromoCode.trim().toUpperCase(),
      discountType: newPromoType,
      discountValue: Number(newPromoDiscount) || 15,
      minSpendJOD: Number(newPromoMinSpend) || 0,
      validUntil: '2026-12-31',
      applicableSports: ['ALL'],
      description: `Exclusive offer for ${currentFacility.name}`,
      usageCount: 0,
    };

    onAddPromotion(promo);
    setShowAddPromoModal(false);
    setNewPromoCode('');
    setNewPromoTitle('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Bar: Venue Switcher & Owner Identity */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              Field Admin Portal
            </span>
            <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              Jordan Host Club
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
            {currentFacility.name}
          </h1>
          <p className="text-xs text-slate-500">
            {currentFacility.address} • Contact: {currentFacility.phone}
          </p>
        </div>

        {/* Switch Managed Club if Owner has multiple */}
        {ownerFacilities.length > 1 && (
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 pl-2">Switch Club:</span>
            <select
              value={selectedFacilityId}
              onChange={(e) => setSelectedFacilityId(e.target.value)}
              className="bg-white font-bold text-xs text-slate-800 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none"
            >
              {ownerFacilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.name} ({fac.area})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Nav Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Club Analytics & KPIs
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Live Court Bookings ({facilityBookings.length})
        </button>
        <button
          onClick={() => setActiveTab('courts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            activeTab === 'courts'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Courts Inventory & Rates ({currentFacility.courts.length})
        </button>
        <button
          onClick={() => setActiveTab('promotions')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            activeTab === 'promotions'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Facility Promotions ({facilityPromos.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & KPIS */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Total Revenue
              </span>
              <div className="text-3xl font-black text-slate-900 font-heading">
                {totalRevenueJOD.toFixed(1)} <span className="text-base font-semibold text-slate-500">JOD</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-2 block">
                ↑ +18.4% vs last month
              </span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Reservations
              </span>
              <div className="text-3xl font-black text-slate-900 font-heading">
                {facilityBookings.length}
              </div>
              <span className="text-[11px] text-blue-600 font-semibold mt-2 block">
                {upcomingFacilityBookings.length} upcoming matches
              </span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Court Occupancy
              </span>
              <div className="text-3xl font-black text-slate-900 font-heading">
                78.5%
              </div>
              <span className="text-[11px] text-amber-600 font-semibold mt-2 block">
                Peak hours (18:00 - 22:00) 94% full
              </span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Active Courts
              </span>
              <div className="text-3xl font-black text-slate-900 font-heading">
                {currentFacility.courts.filter((c) => c.status === 'active').length} / {currentFacility.courts.length}
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">
                All operating under Jordanian safety codes
              </span>
            </div>
          </div>

          {/* Quick Schedule Preview */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200">
            <h3 className="text-lg font-bold font-heading text-slate-900 mb-4">
              Today's Match Roster & Check-ins
            </h3>
            {upcomingFacilityBookings.length === 0 ? (
              <p className="text-xs text-slate-500">No upcoming bookings scheduled for today.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingFacilityBookings.map((b) => (
                  <div key={b.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{b.userName}</span>
                        <span className="font-mono text-[10px] text-slate-400">({b.bookingRef})</span>
                      </div>
                      <span className="text-slate-500">{b.courtName} • {b.startTime} - {b.endTime}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-900">{b.finalPriceJOD} JOD</span>
                      <button
                        onClick={() => onCheckInBooking(b.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
                      >
                        Check In Player
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE BOOKINGS */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              All Reservations for {currentFacility.name}
            </h3>
            <span className="text-xs text-slate-500">
              Total {facilityBookings.length} records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Ref ID</th>
                  <th className="p-3">Athlete Name & Phone</th>
                  <th className="p-3">Court / Pitch</th>
                  <th className="p-3">Date & Time</th>
                  <th className="p-3">Payment</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {facilityBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-900">{b.bookingRef}</td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{b.userName}</div>
                      <div className="text-[11px] text-slate-500">{b.userPhone}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{b.courtName}</div>
                      <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                        {b.sport}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{b.date}</div>
                      <div className="text-[11px] text-slate-400">{b.startTime} - {b.endTime}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{b.finalPriceJOD} JOD</div>
                      <div className="text-[10px] text-slate-400 uppercase">{b.paymentMethod.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          b.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : b.status === 'checked_in'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="p-3">
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => onCheckInBooking(b.id)}
                          className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition cursor-pointer"
                        >
                          Check In
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: COURTS INVENTORY */}
      {activeTab === 'courts' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Courts & Fields Inventory
              </h3>
              <p className="text-xs text-slate-500">
                Manage court surfaces, peak/off-peak pricing in JOD, and maintenance status.
              </p>
            </div>
            <button
              onClick={() => setShowAddCourtModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Court</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentFacility.courts.map((court) => (
              <div
                key={court.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{court.name}</h4>
                      <p className="text-xs text-slate-500">{court.surface}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        court.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {court.status === 'active' ? 'Active' : 'Maintenance'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs p-3 bg-slate-50 rounded-xl my-3">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Off-peak Rate</span>
                      <span className="font-bold text-slate-800">{court.hourlyRateOffPeak} JOD / hr</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Peak Evening Rate</span>
                      <span className="font-bold text-slate-800">{court.hourlyRatePeak} JOD / hr</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    {court.isIndoor ? 'Indoor Air-Conditioned' : 'Outdoor Floodlit'}
                  </span>
                  <button
                    onClick={() => handleToggleCourtStatus(court.id)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                  >
                    {court.status === 'active' ? 'Set to Maintenance' : 'Set to Active'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Court Modal */}
          {showAddCourtModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
                <h4 className="text-lg font-bold font-heading text-slate-900 mb-4">
                  Add Court to {currentFacility.name}
                </h4>

                <form onSubmit={handleCreateCourt} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Court Name</label>
                    <input
                      type="text"
                      required
                      value={newCourtName}
                      onChange={(e) => setNewCourtName(e.target.value)}
                      placeholder="e.g. Court 3 - Panoramic Indoor"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Sport</label>
                      <select
                        value={newCourtSport}
                        onChange={(e) => setNewCourtSport(e.target.value as SportCategory)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                      >
                        <option value="Padel">Padel</option>
                        <option value="Football">Football</option>
                        <option value="Tennis">Tennis</option>
                        <option value="Basketball">Basketball</option>
                        <option value="Golf">Golf</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Type</label>
                      <select
                        value={newCourtIndoor ? 'indoor' : 'outdoor'}
                        onChange={(e) => setNewCourtIndoor(e.target.value === 'indoor')}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                      >
                        <option value="indoor">Indoor (AC)</option>
                        <option value="outdoor">Outdoor</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Surface</label>
                    <input
                      type="text"
                      value={newCourtSurface}
                      onChange={(e) => setNewCourtSurface(e.target.value)}
                      placeholder="e.g. Mondo Supercourt XN"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Off-Peak (JOD/hr)</label>
                      <input
                        type="number"
                        value={newCourtOffPeak}
                        onChange={(e) => setNewCourtOffPeak(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Peak (JOD/hr)</label>
                      <input
                        type="number"
                        value={newCourtPeak}
                        onChange={(e) => setNewCourtPeak(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddCourtModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                    >
                      Save Court
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FACILITY PROMOTIONS */}
      {activeTab === 'promotions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold font-heading text-slate-900">
                Facility Promotional Deals
              </h3>
              <p className="text-xs text-slate-500">
                Create coupon codes exclusively valid at {currentFacility.name}.
              </p>
            </div>
            <button
              onClick={() => setShowAddPromoModal(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Promo Code</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilityPromos.map((promo) => (
              <div
                key={promo.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-black text-sm bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                      {promo.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-700">
                      {promo.discountType === 'percentage'
                        ? `${promo.discountValue}% OFF`
                        : `${promo.discountValue} JOD OFF`}
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{promo.title}</h4>
                  <p className="text-xs text-slate-500 mb-3">{promo.description}</p>
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                  <span>Usage: {promo.usageCount} times</span>
                  <span>Valid until {promo.validUntil}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Promo Modal */}
          {showAddPromoModal && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
                <h4 className="text-lg font-bold font-heading text-slate-900 mb-4">
                  Create Facility Promo Code
                </h4>

                <form onSubmit={handleCreatePromo} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Promo Code</label>
                    <input
                      type="text"
                      required
                      value={newPromoCode}
                      onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                      placeholder="e.g. TRAXSUMMER"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-mono uppercase focus:outline-none focus:border-blue-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Campaign Title</label>
                    <input
                      type="text"
                      required
                      value={newPromoTitle}
                      onChange={(e) => setNewPromoTitle(e.target.value)}
                      placeholder="e.g. Trax Summer Weekend Discount"
                      className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Discount Type</label>
                      <select
                        value={newPromoType}
                        onChange={(e) => setNewPromoType(e.target.value as any)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed_amount">Fixed Amount (JOD)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Discount Value</label>
                      <input
                        type="number"
                        value={newPromoDiscount}
                        onChange={(e) => setNewPromoDiscount(e.target.value)}
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPromoModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold cursor-pointer"
                    >
                      Launch Promo
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
