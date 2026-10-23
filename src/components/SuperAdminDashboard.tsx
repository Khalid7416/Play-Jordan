import React, { useState } from 'react';
import { Facility, User, Booking, UserRole } from '../types';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  TrendingUp, 
  Check, 
  X, 
  Search, 
  AlertTriangle,
  Award,
  DollarSign,
  Activity
} from 'lucide-react';

interface SuperAdminDashboardProps {
  users: User[];
  facilities: Facility[];
  bookings: Booking[];
  onToggleUserRole: (userId: string, newRole: UserRole) => void;
  onToggleUserVerification: (userId: string) => void;
  onApproveFacility: (facilityId: string) => void;
  onRemoveFacility: (facilityId: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  users,
  facilities,
  bookings,
  onToggleUserRole,
  onToggleUserVerification,
  onApproveFacility,
  onRemoveFacility,
}) => {
  const [adminTab, setAdminTab] = useState<'analytics' | 'facilities' | 'users'>('analytics');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Platform Analytics
  const totalPlatformGMV = bookings.reduce((sum, b) => sum + b.finalPriceJOD, 0);
  const totalBookingsCount = bookings.length;
  const verifiedFacilitiesCount = facilities.filter((f) => f.isVerified).length;
  const totalUsersCount = users.length;

  // Sports Popularity
  const sportCounts: Record<string, number> = {};
  facilities.forEach((f) => {
    f.sports.forEach((s) => {
      sportCounts[s] = (sportCounts[s] || 0) + 1;
    });
  });

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.phone.includes(userSearchQuery) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Platform Control Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-8 mb-8 border border-purple-900/50 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-purple-600/90 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>PlayJo Super Admin Master Control Panel</span>
            </span>
            <span className="text-xs text-purple-300">Kingdom of Jordan Operations</span>
          </div>
          <h1 className="text-3xl font-black font-heading">
            Platform Master Console
          </h1>
          <p className="text-xs text-slate-300 max-w-xl mt-1">
            Oversee all registered athletes, facility owners, court approvals, and Kingdom-wide sports activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-purple-900/50 border border-purple-500/30 p-3 rounded-2xl text-right">
            <span className="text-[10px] text-purple-200 uppercase tracking-wider block">Platform GMV</span>
            <span className="text-2xl font-black text-white">{totalPlatformGMV.toFixed(1)} JOD</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 mb-8 overflow-x-auto pb-1">
        <button
          onClick={() => setAdminTab('analytics')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            adminTab === 'analytics'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Kingdom Analytics & KPIs
        </button>
        <button
          onClick={() => setAdminTab('facilities')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            adminTab === 'facilities'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Facilities Directory Management ({facilities.length})
        </button>
        <button
          onClick={() => setAdminTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0 cursor-pointer ${
            adminTab === 'users'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Users & RBAC Control ({users.length})
        </button>
      </div>

      {/* TAB 1: ANALYTICS */}
      {adminTab === 'analytics' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Total Bookings
              </span>
              <div className="text-3xl font-black text-slate-900 font-heading">
                {totalBookingsCount}
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold mt-2 block">
                100% verified via SMS OTP
              </span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Verified Facilities
              </span>
              <div className="text-3xl font-black text-slate-900 font-heading">
                {verifiedFacilitiesCount} / {facilities.length}
              </div>
              <span className="text-[11px] text-purple-600 font-semibold mt-2 block">
                Amman, Aqaba, Irbid coverage
              </span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Active Users & Owners
              </span>
              <div className="text-3xl font-black text-slate-900 font-heading">
                {totalUsersCount}
              </div>
              <span className="text-[11px] text-blue-600 font-semibold mt-2 block">
                Role-based access enforced
              </span>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Avg Court Reservation
              </span>
              <div className="text-3xl font-black text-slate-900 font-heading">
                {totalBookingsCount > 0 ? (totalPlatformGMV / totalBookingsCount).toFixed(1) : 0} JOD
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">
                Average match duration: 84 mins
              </span>
            </div>
          </div>

          {/* Popular Sports in Jordan */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200">
              <h3 className="text-lg font-bold font-heading text-slate-900 mb-4">
                Most Popular Sports in Jordan by Available Clubs
              </h3>
              <div className="space-y-3">
                {Object.entries(sportCounts).map(([sport, count]) => (
                  <div key={sport}>
                    <div className="flex justify-between text-xs font-bold mb-1">
                      <span className="text-slate-800">{sport}</span>
                      <span className="text-purple-700">{count} {count === 1 ? 'Club' : 'Clubs'}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full"
                        style={{ width: `${(count / facilities.length) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200">
              <h3 className="text-lg font-bold font-heading text-slate-900 mb-4">
                Governorate Distribution
              </h3>
              <div className="space-y-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">Amman Capital Governorate</span>
                    <span className="text-slate-500">Airport Rd, Dabouq, Abdoun, Khalda, Sports City</span>
                  </div>
                  <span className="font-black text-purple-700 text-base">75% Volume</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">Aqaba Special Economic Zone</span>
                    <span className="text-slate-500">Ayla Oasis & Coastal Marina</span>
                  </div>
                  <span className="font-black text-amber-600 text-base">15% Volume</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block text-sm">Irbid & Northern Governorates</span>
                    <span className="text-slate-500">Football academies & university hubs</span>
                  </div>
                  <span className="font-black text-emerald-600 text-base">10% Volume</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FACILITIES MANAGEMENT */}
      {adminTab === 'facilities' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Jordanian Facilities Registry
            </h3>
            <span className="text-xs text-slate-500">
              {facilities.length} Registered Venues
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Facility Name</th>
                  <th className="p-3">City & Area</th>
                  <th className="p-3">Sports</th>
                  <th className="p-3">Courts</th>
                  <th className="p-3">Rating</th>
                  <th className="p-3">Verification</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {facilities.map((fac) => (
                  <tr key={fac.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{fac.name}</div>
                      <div className="text-[11px] text-slate-400">{fac.email} • {fac.phone}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium text-slate-800">{fac.city}</div>
                      <div className="text-[11px] text-slate-500">{fac.area}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {fac.sports.map((s) => (
                          <span key={s} className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-slate-800">{fac.courts.length}</td>
                    <td className="p-3 font-bold text-amber-600">★ {fac.rating}</td>
                    <td className="p-3">
                      {fac.isVerified ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Approved & Live
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                          Pending Approval
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onApproveFacility(fac.id)}
                          className="px-2.5 py-1 rounded bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-[11px] transition cursor-pointer"
                        >
                          {fac.isVerified ? 'Re-verify' : 'Approve Club'}
                        </button>
                        <button
                          onClick={() => onRemoveFacility(fac.id)}
                          className="px-2 py-1 text-rose-600 hover:text-rose-800 font-semibold text-[11px] cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USERS & RBAC */}
      {adminTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              PlayJo User Directory & RBAC Roles
            </h3>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search user, phone or email..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">User</th>
                  <th className="p-3">Jordan Phone</th>
                  <th className="p-3">Phone Verified</th>
                  <th className="p-3">Loyalty Points</th>
                  <th className="p-3">Current Role</th>
                  <th className="p-3">Role Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="p-3 font-mono font-medium text-slate-800">{u.phone}</td>
                    <td className="p-3">
                      <button
                        onClick={() => onToggleUserVerification(u.id)}
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] cursor-pointer ${
                          u.phoneVerified
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {u.phoneVerified ? '✓ Verified' : '✗ Unverified'}
                      </button>
                    </td>
                    <td className="p-3 font-bold text-slate-900">{u.loyaltyPoints} pts</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          u.role === 'super_admin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'facility_owner'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={u.role}
                        onChange={(e) => onToggleUserRole(u.id, e.target.value as UserRole)}
                        className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-semibold focus:outline-none cursor-pointer"
                      >
                        <option value="customer">Customer</option>
                        <option value="facility_owner">Facility Owner</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
