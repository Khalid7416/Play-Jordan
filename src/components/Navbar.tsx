import React from 'react';
import { User, UserRole } from '../types';
import { 
  Trophy, 
  MapPin, 
  Tag, 
  Calendar, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  Code2, 
  Sparkles,
  PhoneCall,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeTab: 'directory' | 'map' | 'deals' | 'loyalty' | 'owner_dashboard' | 'admin_dashboard' | 'architecture';
  setActiveTab: (tab: 'directory' | 'map' | 'deals' | 'loyalty' | 'owner_dashboard' | 'admin_dashboard' | 'architecture') => void;
  onOpenAuth: () => void;
  onOpenBookingRef?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeRole,
  onRoleChange,
  activeTab,
  setActiveTab,
  onOpenAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Top Jordan RBAC Role Simulation Banner */}
      <div className="bg-slate-900 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-slate-200">PlayJo Jordan RBAC Simulator:</span>
          <span className="text-slate-400 hidden sm:inline">Switch user role to experience different portals:</span>
        </div>

        {/* Role Switcher Pill Group */}
        <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => {
              onRoleChange('customer');
              setActiveTab('directory');
            }}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              activeRole === 'customer'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Customer (Tariq)</span>
          </button>

          <button
            onClick={() => {
              onRoleChange('facility_owner');
              setActiveTab('owner_dashboard');
            }}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              activeRole === 'facility_owner'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Facility Owner (Trax)</span>
          </button>

          <button
            onClick={() => {
              onRoleChange('super_admin');
              setActiveTab('admin_dashboard');
            }}
            className={`px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition ${
              activeRole === 'super_admin'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Super Admin (Platform)</span>
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('directory')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-500 flex items-center justify-center text-white font-extrabold text-xl shadow-md shadow-emerald-500/20">
            PJ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black font-heading tracking-tight text-slate-900">
                Play<span className="text-emerald-600">Jo</span>
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Jordan 🇯🇴
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium">Jordan Sports Clubs & Courts</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
              activeTab === 'directory'
                ? 'bg-slate-100 text-emerald-700'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Clubs & Courts
          </button>

          <button
            onClick={() => setActiveTab('map')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'map'
                ? 'bg-slate-100 text-emerald-700'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Jordan Map</span>
          </button>

          <button
            onClick={() => setActiveTab('deals')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'deals'
                ? 'bg-slate-100 text-emerald-700'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Tag className="w-4 h-4 text-amber-500" />
            <span>Deals & Offers</span>
          </button>

          <button
            onClick={() => setActiveTab('loyalty')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'loyalty'
                ? 'bg-slate-100 text-emerald-700'
                : 'hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>PlayPoints & Bookings</span>
          </button>

          {/* Role specific quick tabs */}
          {activeRole === 'facility_owner' && (
            <button
              onClick={() => setActiveTab('owner_dashboard')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'owner_dashboard'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'hover:bg-blue-50 text-blue-600'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Owner Portal</span>
            </button>
          )}

          {activeRole === 'super_admin' && (
            <button
              onClick={() => setActiveTab('admin_dashboard')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'admin_dashboard'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'hover:bg-purple-50 text-purple-600'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Super Admin Portal</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 transition ${
              activeTab === 'architecture'
                ? 'bg-slate-900 text-white'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Code2 className="w-4 h-4 text-emerald-400" />
            <span>Tech Architecture & Schema</span>
          </button>
        </nav>

        {/* Right Action: PlayPoints balance & User profile */}
        <div className="flex items-center gap-3">
          {/* Points Pill (For customer) */}
          {activeRole === 'customer' && (
            <div 
              onClick={() => setActiveTab('loyalty')}
              className="cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 hover:bg-amber-100 transition shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <div className="text-xs">
                <span className="font-extrabold text-amber-900">{currentUser.loyaltyPoints}</span>
                <span className="text-amber-700 ml-1 font-medium">PlayPoints</span>
              </div>
            </div>
          )}

          {/* User Button */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 transition shadow-xs"
          >
            <div className="text-right hidden sm:block">
              <span className="block text-xs font-bold text-slate-800 leading-tight">
                {currentUser.name}
              </span>
              <span className="block text-[10px] text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                {currentUser.phoneVerified ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Verified Phone
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                    Verify Phone
                  </>
                )}
              </span>
            </div>
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                {currentUser.name.charAt(0)}
              </div>
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
          <button
            onClick={() => {
              setActiveTab('directory');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-slate-800 hover:bg-slate-100"
          >
            Clubs & Courts
          </button>
          <button
            onClick={() => {
              setActiveTab('map');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-slate-800 hover:bg-slate-100 flex items-center gap-2"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Jordan Map</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('deals');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-slate-800 hover:bg-slate-100 flex items-center gap-2"
          >
            <Tag className="w-4 h-4 text-amber-500" />
            <span>Deals & Promotions</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('loyalty');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-slate-800 hover:bg-slate-100 flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>PlayPoints ({currentUser.loyaltyPoints} pts) & Bookings</span>
          </button>
          {activeRole === 'facility_owner' && (
            <button
              onClick={() => {
                setActiveTab('owner_dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg font-semibold text-blue-700 bg-blue-50 flex items-center gap-2"
            >
              <Building2 className="w-4 h-4" />
              <span>Facility Owner Portal</span>
            </button>
          )}
          {activeRole === 'super_admin' && (
            <button
              onClick={() => {
                setActiveTab('admin_dashboard');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg font-semibold text-purple-700 bg-purple-50 flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Super Admin Master Control</span>
            </button>
          )}
          <button
            onClick={() => {
              setActiveTab('architecture');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 rounded-lg font-semibold text-slate-900 bg-slate-100 flex items-center gap-2"
          >
            <Code2 className="w-4 h-4 text-emerald-600" />
            <span>Tech Architecture & Schema DDL</span>
          </button>
        </div>
      )}
    </header>
  );
};
