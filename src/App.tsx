/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  User, 
  UserRole, 
  Facility, 
  Court, 
  Booking, 
  Promotion, 
  LoyaltyLedgerEntry, 
  SportCategory, 
  JordanianCity 
} from './types';
import { 
  SEED_USERS, 
  SEED_FACILITIES, 
  SEED_PROMOTIONS, 
  SEED_BOOKINGS, 
  SEED_LOYALTY_LEDGER 
} from './data/seedData';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { FacilityCard } from './components/FacilityCard';
import { FacilityDetailModal } from './components/FacilityDetailModal';
import { BookingModal } from './components/BookingModal';
import { MapView } from './components/MapView';
import { DealsPage } from './components/DealsPage';
import { LoyaltyDashboard } from './components/LoyaltyDashboard';
import { FacilityOwnerDashboard } from './components/FacilityOwnerDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { AuthModal } from './components/AuthModal';
import { ArchitectureModal } from './components/ArchitectureModal';
import { Footer } from './components/Footer';
import { 
  Trophy, 
  MapPin, 
  Tag, 
  Calendar, 
  Sparkles, 
  ShieldCheck, 
  Building2, 
  CheckCircle2, 
  QrCode, 
  X 
} from 'lucide-react';

export default function App() {
  // RBAC State
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [activeRole, setActiveRole] = useState<UserRole>('customer');
  const [currentUser, setCurrentUser] = useState<User>(SEED_USERS[0]); // Default: Tariq (Customer)

  // Navigation State
  const [activeTab, setActiveTab] = useState<
    'directory' | 'map' | 'deals' | 'loyalty' | 'owner_dashboard' | 'admin_dashboard' | 'architecture'
  >('directory');

  // Directory Data
  const [facilities, setFacilities] = useState<Facility[]>(SEED_FACILITIES);
  const [promotions, setPromotions] = useState<Promotion[]>(SEED_PROMOTIONS);
  const [bookings, setBookings] = useState<Booking[]>(SEED_BOOKINGS);
  const [ledger, setLedger] = useState<LoyaltyLedgerEntry[]>(SEED_LOYALTY_LEDGER);

  // Filters
  const [selectedSport, setSelectedSport] = useState<SportCategory | 'ALL'>('ALL');
  const [selectedCity, setSelectedCity] = useState<JordanianCity | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [detailFacility, setDetailFacility] = useState<Facility | null>(null);
  const [bookingFacility, setBookingFacility] = useState<Facility | null>(null);
  const [initialBookingCourt, setInitialBookingCourt] = useState<Court | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [phoneToVerifyInAuth, setPhoneToVerifyInAuth] = useState<string | undefined>(undefined);
  const [activePassBooking, setActivePassBooking] = useState<Booking | null>(null);

  // Quick toast banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Switch role helper
  const handleRoleChange = (newRole: UserRole) => {
    setActiveRole(newRole);
    if (newRole === 'customer') {
      const cust = users.find((u) => u.role === 'customer') || users[0];
      setCurrentUser(cust);
    } else if (newRole === 'facility_owner') {
      const owner = users.find((u) => u.role === 'facility_owner') || users[1];
      setCurrentUser(owner);
    } else if (newRole === 'super_admin') {
      const admin = users.find((u) => u.role === 'super_admin') || users[2];
      setCurrentUser(admin);
    }
  };

  // Filter facilities
  const filteredFacilities = facilities.filter((fac) => {
    const matchesSport =
      selectedSport === 'ALL' || fac.sports.includes(selectedSport as SportCategory);
    const matchesCity = selectedCity === 'ALL' || fac.city === selectedCity;
    const matchesSearch =
      !searchQuery.trim() ||
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.sports.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesSport && matchesCity && matchesSearch;
  });

  // Calculate sport counts
  const sportCounts: Record<string, number> = {};
  facilities.forEach((f) => {
    f.sports.forEach((s) => {
      sportCounts[s] = (sportCounts[s] || 0) + 1;
    });
  });

  // Handle Booking Confirmation
  const handleBookingConfirmed = (newBooking: Booking, pointsDelta: number) => {
    setBookings((prev) => [newBooking, ...prev]);

    // Update currentUser points & completed count
    const updatedUser: User = {
      ...currentUser,
      loyaltyPoints: Math.max(0, currentUser.loyaltyPoints + pointsDelta),
      completedBookingsCount: currentUser.completedBookingsCount + 1,
    };
    setCurrentUser(updatedUser);
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));

    // Add ledger entry
    const newLedgerEntry: LoyaltyLedgerEntry = {
      id: `ledger-${Date.now()}`,
      userId: currentUser.id,
      bookingId: newBooking.id,
      description: `Reservation at ${newBooking.facilityName} (${newBooking.courtName})`,
      pointsDelta,
      balanceAfter: updatedUser.loyaltyPoints,
      createdAt: new Date().toISOString(),
    };
    setLedger((prev) => [newLedgerEntry, ...prev]);

    showToast(`✓ Booking ${newBooking.bookingRef} confirmed! SMS notification sent.`);
  };

  // Cancel Booking
  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
    showToast('Reservation was cancelled.');
  };

  // Check In Player (Facility Owner)
  const handleCheckInBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'checked_in' } : b))
    );
    showToast('Athlete checked in! Welcome to the court.');
  };

  // Owner updates court inventory
  const handleUpdateCourt = (facilityId: string, updatedCourts: Court[]) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === facilityId ? { ...f, courts: updatedCourts } : f))
    );
    showToast('Court inventory updated.');
  };

  // Owner adds promotion
  const handleAddPromotion = (newPromo: Promotion) => {
    setPromotions((prev) => [newPromo, ...prev]);
    showToast(`Promotion code ${newPromo.code} is now live!`);
  };

  // Super Admin: Toggle user role
  const handleToggleUserRole = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    );
    showToast(`User role updated to ${newRole}`);
  };

  // Super Admin: Toggle phone verification
  const handleToggleUserVerification = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, phoneVerified: !u.phoneVerified } : u
      )
    );
    showToast('Phone verification state updated.');
  };

  // Super Admin: Approve Facility
  const handleApproveFacility = (facilityId: string) => {
    setFacilities((prev) =>
      prev.map((f) => (f.id === facilityId ? { ...f, isVerified: true } : f))
    );
    showToast('Facility verified and approved for Jordan platform directory.');
  };

  // Super Admin: Remove Facility
  const handleRemoveFacility = (facilityId: string) => {
    setFacilities((prev) => prev.filter((f) => f.id !== facilityId));
    showToast('Facility removed from directory.');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header with RBAC Simulator */}
      <Navbar
        currentUser={currentUser}
        activeRole={activeRole}
        onRoleChange={handleRoleChange}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => {
          setPhoneToVerifyInAuth(undefined);
          setIsAuthModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* TAB: DIRECTORY (MAIN CUSTOMER VIEW) */}
        {activeTab === 'directory' && (
          <div>
            <HeroBanner
              selectedSport={selectedSport}
              onSelectSport={setSelectedSport}
              selectedCity={selectedCity}
              onSelectCity={setSelectedCity}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              onOpenDeals={() => setActiveTab('deals')}
            />

            <CategoryFilter
              selectedSport={selectedSport}
              onSelectSport={setSelectedSport}
              sportCounts={sportCounts}
            />

            {/* Facilities Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900">
                    {selectedCity === 'ALL'
                      ? 'Verified Sports Facilities Across Jordan'
                      : `Clubs & Courts in ${selectedCity}`}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Showing {filteredFacilities.length} available clubs with online court reservation & floodlights.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('map')}
                    className="px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Switch to Map View</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('deals')}
                    className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold text-emerald-800 flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                  >
                    <Tag className="w-3.5 h-3.5 text-amber-500" />
                    <span>View Deals ({promotions.length})</span>
                  </button>
                </div>
              </div>

              {filteredFacilities.length === 0 ? (
                <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-lg mx-auto">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                    🔍
                  </div>
                  <h3 className="text-base font-bold text-slate-800">No Facilities Match Your Criteria</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Try changing your sport category filter or search query.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedSport('ALL');
                      setSelectedCity('ALL');
                      setSearchQuery('');
                    }}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredFacilities.map((facility) => (
                    <FacilityCard
                      key={facility.id}
                      facility={facility}
                      onSelect={(fac) => setDetailFacility(fac)}
                      onBookDirect={(fac) => {
                        setBookingFacility(fac);
                        setInitialBookingCourt(fac.courts[0] || null);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: INTERACTIVE JORDAN MAP */}
        {activeTab === 'map' && (
          <MapView
            facilities={facilities}
            selectedSport={selectedSport}
            selectedCity={selectedCity}
            onSelectFacility={(fac) => setDetailFacility(fac)}
            onBookCourt={(fac) => {
              setBookingFacility(fac);
              setInitialBookingCourt(fac.courts[0] || null);
            }}
          />
        )}

        {/* TAB: DEALS & DISCOUNTS */}
        {activeTab === 'deals' && (
          <DealsPage
            promotions={promotions}
            facilities={facilities}
            onBookWithDeal={(facility, promo) => {
              setBookingFacility(facility);
              setInitialBookingCourt(facility.courts[0] || null);
            }}
          />
        )}

        {/* TAB: LOYALTY & CUSTOMER DASHBOARD */}
        {activeTab === 'loyalty' && (
          <LoyaltyDashboard
            currentUser={currentUser}
            bookings={bookings}
            ledger={ledger}
            onCancelBooking={handleCancelBooking}
            onViewBookingPass={(b) => setActivePassBooking(b)}
          />
        )}

        {/* TAB: FACILITY OWNER PORTAL */}
        {activeTab === 'owner_dashboard' && (
          <FacilityOwnerDashboard
            ownerFacilities={facilities.filter(
              (f) => currentUser.facilityIds?.includes(f.id) || f.ownerId === currentUser.id
            ).length > 0
              ? facilities.filter(
                  (f) => currentUser.facilityIds?.includes(f.id) || f.ownerId === currentUser.id
                )
              : [facilities[0]]}
            allBookings={bookings}
            promotions={promotions}
            onUpdateCourt={handleUpdateCourt}
            onAddPromotion={handleAddPromotion}
            onCheckInBooking={handleCheckInBooking}
          />
        )}

        {/* TAB: SUPER ADMIN CONTROL PANEL */}
        {activeTab === 'admin_dashboard' && (
          <SuperAdminDashboard
            users={users}
            facilities={facilities}
            bookings={bookings}
            onToggleUserRole={handleToggleUserRole}
            onToggleUserVerification={handleToggleUserVerification}
            onApproveFacility={handleApproveFacility}
            onRemoveFacility={handleRemoveFacility}
          />
        )}

        {/* TAB: ARCHITECTURE & SQL SCHEMA DOCUMENTATION */}
        {activeTab === 'architecture' && <ArchitectureModal />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Detail Modal */}
      {detailFacility && (
        <FacilityDetailModal
          facility={detailFacility}
          onClose={() => setDetailFacility(null)}
          onBookCourt={(fac, court) => {
            setBookingFacility(fac);
            setInitialBookingCourt(court);
          }}
        />
      )}

      {/* Court Reservation Booking Modal */}
      {bookingFacility && (
        <BookingModal
          facility={bookingFacility}
          initialCourt={initialBookingCourt}
          currentUser={currentUser}
          activePromotions={promotions}
          onClose={() => {
            setBookingFacility(null);
            setInitialBookingCourt(null);
          }}
          onBookingConfirmed={handleBookingConfirmed}
          onViewMyBookings={() => {
            setBookingFacility(null);
            setInitialBookingCourt(null);
            setActiveTab('loyalty');
          }}
          onRequestPhoneVerify={() => {
            setBookingFacility(null);
            setPhoneToVerifyInAuth(currentUser.phone);
            setIsAuthModalOpen(true);
          }}
        />
      )}

      {/* Auth & SMS OTP Verification Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        initialPhoneToVerify={phoneToVerifyInAuth}
        onLoginSuccess={(updatedUser) => {
          setCurrentUser(updatedUser);
          setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
          showToast(`Welcome back, ${updatedUser.name}! Phone verified.`);
        }}
      />

      {/* Digital Match Pass Quick Modal */}
      {activePassBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setActivePassBooking(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-200">
              Jordan Match Pass
            </span>

            <h3 className="text-xl font-bold font-heading text-slate-900 mt-2 mb-1">
              {activePassBooking.facilityName}
            </h3>
            <p className="text-xs text-emerald-700 font-semibold mb-4">
              {activePassBooking.courtName}
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border-2 border-dashed border-slate-300 mb-4">
              <div className="w-36 h-36 bg-white p-2 rounded-2xl border border-slate-200 mx-auto mb-3 flex items-center justify-center shadow-xs">
                <QrCode className="w-28 h-28 text-slate-800" />
              </div>
              <div className="font-mono text-sm font-black text-slate-900">
                {activePassBooking.bookingRef}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {activePassBooking.date} • {activePassBooking.startTime} - {activePassBooking.endTime}
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Present this QR code at the facility reception for match entry.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
