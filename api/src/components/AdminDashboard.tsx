import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Users, 
  Calendar, 
  CheckSquare, 
  UserCheck, 
  AlertTriangle,
  ClipboardList, 
  Activity, 
  Trash2, 
  ShieldAlert,
  Search,
  Check,
  X,
  Stethoscope,
  Lock,
  Phone
} from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const { 
    doctors, 
    allAdminDoctors,
    appointments, 
    approveDoctor, 
    rejectDoctor, 
    setError 
  } = useApp();

  const formatDoctorName = (name?: string) => {
    if (!name) return "Vetted Doc";
    return name.toLowerCase().startsWith("dr.") || name.toLowerCase().startsWith("dr ") ? name : `Dr. ${name}`;
  };

  // Active Admin tabs: 'analytics' | 'doctors' | 'appointments' | 'users'
  const [activeTab, setActiveTab] = useState<"analytics" | "doctors" | "appointments">("analytics");

  // Filtering search logs
  const [doctorSearch, setDoctorSearch] = useState("");
  const [aptSearch, setAptSearch] = useState("");

  const handleApprove = async (docId: string) => {
    const ok = await approveDoctor(docId);
    if (!ok) {
      setError("Failed to approve the selected doctor registry key.");
    }
  };

  const handleReject = async (docId: string) => {
    const ok = await rejectDoctor(docId);
    if (!ok) {
      setError("Failed to delete/reject the selected registration record.");
    }
  };

  // Compute calculated metrics
  const totalDoctorsCount = allAdminDoctors.length;
  const approvedDoctorsCount = allAdminDoctors.filter(d => d.isApproved).length;
  const pendingDoctorsCount = allAdminDoctors.filter(d => !d.isApproved).length;
  const totalScheduledApts = appointments.length;
  const completedAptsCount = appointments.filter(a => a.status === "completed").length;
  const pendingAptsCount = appointments.filter(a => a.status === "pending").length;

  return (
    <div id="admin_dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Admin header panel */}
      <div className="bg-slate-900 border border-slate-850 text-white rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_100%_100%,rgba(13,148,136,0.2),rgba(0,0,0,0))]"></div>
        <div className="relative z-10 text-left">
          <span className="text-[10px] uppercase bg-teal-500/10 text-teal-350 border border-teal-500/20 px-3 py-1 rounded-full font-bold tracking-wider font-mono">
            System Administration Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display mt-2 leading-none">
            Corporate Admin Control Desk
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium leading-relaxed max-w-xl">
            Vet applied doctor practices, audit platform usage analytics, and maintain smooth clinical calendar bookings.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible bg-white border border-slate-150 p-2 rounded-2xl gap-1 mb-6 lg:mb-0 shrink-0">
          {[
            { id: "analytics", label: "Analytics & KPI metrics", icon: Activity },
            { id: "doctors", label: "Doctor Registry & approvals", icon: Stethoscope },
            { id: "appointments", label: "Appointment Auditing", icon: Calendar },
          ].map(it => {
            const Icon = it.icon;
            return (
              <button
                key={it.id}
                onClick={() => setActiveTab(it.id as any)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-left cursor-pointer transition whitespace-nowrap ${
                  activeTab === it.id
                    ? "bg-teal-650 text-white shadow-md shadow-teal-500/10"
                    : "text-slate-650 hover:bg-slate-50 hover:text-slate-950"
                }`}
                id={`admin_sidebar_${it.id}`}
              >
                <Icon className="w-4 h-4" />
                <span>{it.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Display Panel */}
        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 min-h-[500px]">
          
          {/* --- 1. ANALYTICS & METRIC TILES --- */}
          {activeTab === "analytics" && (
            <div id="admin_analytics_tab" className="text-left space-y-8">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 font-display">
                Analytics & Case Registry KPIs
              </h2>

              {/* KPI cards layout */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl">
                  <span className="text-[10px] uppercase text-slate-450 font-bold block mb-1">Doctors Registered</span>
                  <span className="text-xl font-extrabold text-slate-800">{totalDoctorsCount}</span>
                </div>
                
                <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl">
                  <span className="text-[10px] uppercase text-slate-450 font-bold block mb-1">Awaiting Approvals</span>
                  <span className={`text-xl font-extrabold ${pendingDoctorsCount > 0 ? "text-amber-600 font-black animate-pulse" : "text-slate-800"}`}>
                    {pendingDoctorsCount}
                  </span>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl">
                  <span className="text-[10px] uppercase text-slate-450 font-bold block mb-1">Consults Filed</span>
                  <span className="text-xl font-extrabold text-slate-800">{totalScheduledApts}</span>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl">
                  <span className="text-[10px] uppercase text-slate-450 font-bold block mb-1 font-display">Completed treatments</span>
                  <span className="text-xl font-extrabold text-slate-800">{completedAptsCount}</span>
                </div>
              </div>

              {/* Visual mini bar charts styled natively with CSS classes (No external image loads) */}
              <div id="treatment_volume_breakdown" className="bg-slate-50 border border-slate-150 p-6 rounded-3xl">
                <h3 className="text-xs font-bold text-teal-650 uppercase tracking-widest mb-4">Treatment Case Breakdown</h3>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Confirmed Active Slots</span>
                      <span>{appointments.filter(a => a.status === "confirmed").length} Cases</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-full transition-all" 
                        style={{ width: `${(appointments.filter(a => a.status === "confirmed").length / (totalScheduledApts || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Completed / Concluded Cases</span>
                      <span>{completedAptsCount} Cases</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-full transition-all" 
                        style={{ width: `${(completedAptsCount / (totalScheduledApts || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Declined / Cancelled Cases</span>
                      <span>{appointments.filter(a => a.status === "rejected").length} Cases</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-rose-500 h-full transition-all" 
                        style={{ width: `${(appointments.filter(a => a.status === "rejected").length / (totalScheduledApts || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- 2. DOCTOR REGISTRY & VETTING LIST --- */}
          {activeTab === "doctors" && (
            <div id="admin_doctors_tab" className="text-left space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Corporate Doctor Registry & approvals
                </h2>
                {/* Search bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search applied doctors..."
                    value={doctorSearch}
                    onChange={(e) => setDoctorSearch(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Pending Approvals Section */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-amber-600 uppercase tracking-widest block mb-4">Awaiting Clinical Vetting ({pendingDoctorsCount})</h3>
                
                {allAdminDoctors.filter(d => !d.isApproved).length === 0 ? (
                  <div className="border border-dashed border-slate-200 p-8 text-center text-slate-450 text-xs font-semibold rounded-2xl bg-slate-50">
                    No doctor applications currently in reviewing queue.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allAdminDoctors
                      .filter(d => !d.isApproved)
                      .filter(d => d.name.toLowerCase().includes(doctorSearch.toLowerCase()))
                      .map((doc) => (
                        <div 
                          key={doc.id} 
                          className="bg-amber-50/45 border border-amber-200 rounded-2xl p-5"
                        >
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-amber-100/60 text-xs">
                            <div>
                              <span className="font-extrabold text-slate-900 text-sm font-display block">{doc.name}</span>
                              <span className="text-slate-500 font-medium">Applied: {doc.email} &bull; {doc.phone}</span>
                            </div>
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2.5 py-1 rounded-lg uppercase">Awaiting admin review</span>
                          </div>

                          <div className="py-3 text-xs leading-relaxed space-y-1.5 text-slate-700">
                            <p><strong>Qualification:</strong> {doc.profile?.qualification || "N/A"}</p>
                            <p><strong>Specialization:</strong> {doc.profile?.specialization || "N/A"}</p>
                            <p><strong>Clinical Practice Address:</strong> {doc.profile?.clinicAddress || "N/A"}</p>
                            <p><strong>Experience:</strong> {doc.profile?.experience || "0"} Years of Practice</p>
                          </div>

                          <div className="flex gap-2 justify-end pt-3 border-t border-amber-200/50">
                            <button
                              onClick={() => handleReject(doc.id)}
                              className="bg-white hover:bg-rose-50 border border-slate-250 text-rose-650 font-bold text-[11px] px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                            >
                              Reject & Remove
                            </button>
                            <button
                              onClick={() => handleApprove(doc.id)}
                              className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-[11px] px-4 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Confirm & Approve Credentials</span>
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Active list section */}
              <div className="space-y-3 pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-4">Approved Listed Physicians ({approvedDoctorsCount})</h3>
                
                {allAdminDoctors.filter(d => d.isApproved).length === 0 ? (
                  <div className="text-slate-400 text-xs">No doctors approved yet.</div>
                ) : (
                  <div className="overflow-hidden border border-slate-150 rounded-2xl divide-y divide-slate-100">
                    {allAdminDoctors
                      .filter(d => d.isApproved)
                      .filter(d => d.name.toLowerCase().includes(doctorSearch.toLowerCase()))
                      .map(doc => (
                        <div key={doc.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs">
                          <div>
                            <strong className="font-bold text-slate-900 text-sm font-display block">{doc.name}</strong>
                            <span className="text-slate-550 block mt-0.5">{doc.profile?.qualification || "N/A"} &bull; {doc.profile?.specialization || "N/A"}</span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReject(doc.id)}
                              className="border border-slate-205 hover:bg-rose-50 text-rose-600 hover:text-rose-700 font-bold px-3 py-1.5 rounded-lg text-[11px] transition"
                            >
                              Revoke License
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- 3. APPOINTMENT AUDITING --- */}
          {activeTab === "appointments" && (
            <div id="admin_appointments_tab" className="text-left space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-3">
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Corporate Appointment Logs Audit
                </h2>
                {/* Search bar */}
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by patient name..."
                    value={aptSearch}
                    onChange={(e) => setAptSearch(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-teal-500 bg-slate-50 focus:bg-white"
                  />
                </div>
              </div>

              {appointments.length === 0 ? (
                <div className="text-center p-16 text-slate-500 bg-slate-50 rounded-2xl text-xs">
                  No appointments booked on corporate scheduling servers.
                </div>
              ) : (
                <div className="overflow-hidden border border-slate-150 rounded-2xl divide-y divide-slate-100">
                  {appointments
                    .filter(a => a.patientName.toLowerCase().includes(aptSearch.toLowerCase()))
                    .map((apt) => (
                      <div key={apt.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs hover:bg-slate-50 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className="font-bold text-slate-900 text-sm font-display block">{apt.patientName}</strong>
                            <span className="text-[9px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-500 uppercase">{apt.status}</span>
                          </div>
                          <span className="text-slate-500 block mt-0.5">Physician: {formatDoctorName(allAdminDoctors.find(d => d.id === apt.doctorId)?.name || doctors.find(d => d.id === apt.doctorId)?.name)} &bull; Day: {apt.preferredDate}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-1 rounded">
                            {apt.consultationMode.toUpperCase()} Mode
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
