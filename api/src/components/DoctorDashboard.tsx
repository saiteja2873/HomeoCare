import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Inbox, 
  Video, 
  ClipboardList, 
  Settings, 
  Plus, 
  Trash2, 
  Sparkles,
  Award,
  BookOpen,
  Check,
  AlertCircle,
  Edit,
  Heart,
  X,
  Save
} from "lucide-react";
import { ConsultationRoom } from "./ConsultationRoom";
import { PrescriptionViewer } from "./PrescriptionViewer";

export const DoctorDashboard: React.FC = () => {
  const { 
    currentUser, 
    appointments, 
    prescriptions, 
    updateAppointmentStatus, 
    addPrescription,
    saveAvailability,
    getAvailability,
    setError 
  } = useApp();

  // Sidebar tab context: 'index' | 'appointments' | 'availability' | 'patients' | 'profile'
  const [activeTab, setActiveTab] = useState<"index" | "appointments" | "availability" | "patients" | "profile">("index");

  // Call room & Rx popup states
  const [activeCallApt, setActiveCallApt] = useState<any | null>(null);
  const [activeRxRecord, setActiveRxRecord] = useState<any | null>(null);

  // Decline/Reject Overlay State
  const [rejectingAptId, setRejectingAptId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Reschedule Overlay State
  const [reschedulingAptId, setReschedulingAptId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("11:00 AM");

  // Availability setup
  const [availDays, setAvailDays] = useState<string[]>(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const [availSlots, setAvailSlots] = useState<string[]>(["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"]);
  const [isSlotSaving, setIsSlotSaving] = useState(false);
  const [slotSaveOk, setSlotSaveOk] = useState(false);

  // --- Prescription Form states ---
  const [composingApt, setComposingApt] = useState<any | null>(null);
  const [medicineLines, setMedicineLines] = useState<any[]>([
    { name: "Lyco 30C", dosage: "4 pills", duration: "7 days", instructions: "Empty stomach morning" }
  ]);
  const [generalInstructions, setGeneralInstructions] = useState("Avoid raw onions, strong coffee, or mint paste 30 mins before remedies.");

  // --- Intake Editing states ---
  const [editingIntakeApt, setEditingIntakeApt] = useState<any | null>(null);
  // Demographic fields
  const [editAge, setEditAge] = useState("");
  const [editGender, setEditGender] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editMaritalStatus, setEditMaritalStatus] = useState("");
  const [editOccupation, setEditOccupation] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editState, setEditState] = useState("");
  const [editCountry, setEditCountry] = useState("");
  // Medical fields
  const [editMainComplaint, setEditMainComplaint] = useState("");
  const [editSymptoms, setEditSymptoms] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const [editMedications, setEditMedications] = useState("");
  const [editPrevTreatments, setEditPrevTreatments] = useState("");
  const [editAllergies, setEditAllergies] = useState("");
  const [editChronicDiseases, setEditChronicDiseases] = useState("");
  const [editFamilyHistory, setEditFamilyHistory] = useState("");
  const [editAppetite, setEditAppetite] = useState("");
  const [editSleep, setEditSleep] = useState("");
  const [editThirst, setEditThirst] = useState("");
  const [editEmotionalState, setEditEmotionalState] = useState("");
  const [editWeatherSensitivity, setEditWeatherSensitivity] = useState("");
  const [isSavingIntake, setIsSavingIntake] = useState(false);

  // Actions
  const handleApprove = async (id: string) => {
    await updateAppointmentStatus(id, "confirmed");
  };

  const handleDeclineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingAptId || !rejectReason) return;
    const ok = await updateAppointmentStatus(rejectingAptId, "rejected", { rescheduleReason: rejectReason });
    if (ok) {
      setRejectingAptId(null);
      setRejectReason("");
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAptId || !rescheduleDate) return;
    const ok = await updateAppointmentStatus(reschedulingAptId, "pending", {
      preferredDate: rescheduleDate,
      preferredTimeSlot: rescheduleTime,
      rescheduleReason: "Clinician proposed appointment adjustment reschedule."
    });
    if (ok) {
      setReschedulingAptId(null);
      setRescheduleDate("");
    }
  };

  const handleSaveAvailability = async () => {
    if (!currentUser) return;
    setIsSlotSaving(true);
    const ok = await saveAvailability(currentUser.id, availDays, availSlots, []);
    if (ok) {
      setSlotSaveOk(true);
      setTimeout(() => setSlotSaveOk(false), 3000);
    }
    setIsSlotSaving(false);
  };

  // Custom medicine entries
  const addMedicineLine = () => {
    setMedicineLines([...medicineLines, { name: "", dosage: "4 pills", duration: "7 days", instructions: "Twice daily" }]);
  };

  const removeMedicineLine = (idx: number) => {
    setMedicineLines(medicineLines.filter((_, i) => i !== idx));
  };

  const updateMedicineLine = (idx: number, field: string, val: string) => {
    const updated = [...medicineLines];
    updated[idx][field] = val;
    setMedicineLines(updated);
  };

  const handlePrescriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!composingApt) return;
    
    // Check if empty lines
    const empty = medicineLines.some(l => !l.name);
    if (empty) {
      setError("Please fill all medicine titles.");
      return;
    }

    const payload = {
      medicines: medicineLines,
      generalInstructions
    };

    const ok = await addPrescription(composingApt.id, payload);
    if (ok) {
      setComposingApt(null);
      setMedicineLines([{ name: "Lyco 30C", dosage: "4 pills", duration: "7 days", instructions: "Empty stomach morning" }]);
      setActiveTab("index"); // Navigate home
    }
  };

  const quickLaunchCall = (apt: any) => {
    setActiveCallApt(apt);
  };

  // --- Intake Editing Handlers ---
  const openIntakeEditor = (apt: any) => {
    setEditingIntakeApt(apt);
    // Populate demographic fields
    setEditAge(apt.age?.toString() || "");
    setEditGender(apt.gender || "");
    setEditHeight(apt.height || "");
    setEditWeight(apt.weight || "");
    setEditMaritalStatus(apt.maritalStatus || "");
    setEditOccupation(apt.occupation || "");
    setEditAddress(apt.address || "");
    setEditCity(apt.city || "");
    setEditState(apt.state || "");
    setEditCountry(apt.country || "");
    // Populate medical fields
    setEditMainComplaint(apt.medicalInfo?.mainComplaint || "");
    setEditSymptoms(apt.medicalInfo?.symptoms || "");
    setEditDuration(apt.medicalInfo?.durationOfProblem || "");
    setEditMedications(apt.medicalInfo?.currentMedications || "");
    setEditPrevTreatments(apt.medicalInfo?.previousTreatments || "");
    setEditAllergies(apt.medicalInfo?.allergies || "");
    setEditChronicDiseases(apt.medicalInfo?.chronicDiseases || "");
    setEditFamilyHistory(apt.medicalInfo?.familyMedicalHistory || "");
    setEditAppetite(apt.homeopathyQuestions?.appetite || "Normal");
    setEditSleep(apt.homeopathyQuestions?.sleepPattern || "Refreshing sound sleep");
    setEditThirst(apt.homeopathyQuestions?.thirstLevel || "Thirstless (rarely drinks)");
    setEditEmotionalState(apt.homeopathyQuestions?.emotionalState || "");
    setEditWeatherSensitivity(apt.homeopathyQuestions?.sensitivityToWeather || "");
  };

  const handleSaveIntakeEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIntakeApt) return;

    if (!editMainComplaint.trim()) {
      setError("Main complaint is required.");
      return;
    }

    setIsSavingIntake(true);

    try {
      const response = await fetch(`/api/appointments/${editingIntakeApt.id}/intake`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          demographics: {
            age: Number(editAge) || 0,
            gender: editGender,
            height: editHeight,
            weight: editWeight,
            maritalStatus: editMaritalStatus,
            occupation: editOccupation,
            address: editAddress,
            city: editCity,
            state: editState,
            country: editCountry
          },
          medicalInfo: {
            mainComplaint: editMainComplaint,
            symptoms: editSymptoms,
            durationOfProblem: editDuration,
            currentMedications: editMedications,
            previousTreatments: editPrevTreatments,
            allergies: editAllergies,
            chronicDiseases: editChronicDiseases,
            familyMedicalHistory: editFamilyHistory
          },
          homeopathyQuestions: {
            appetite: editAppetite,
            sleepPattern: editSleep,
            thirstLevel: editThirst,
            emotionalState: editEmotionalState,
            sensitivityToWeather: editWeatherSensitivity
          }
        })
      });

      if (response.ok) {
        // Refresh the page to get updated data
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.error || "Failed to update intake details");
      }
    } catch (err) {
      setError("Network error while saving intake details");
    } finally {
      setIsSavingIntake(false);
    }
  };

  // Availability checkbox handlers
  const toggleDay = (day: string) => {
    setAvailDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  const toggleSlot = (slot: string) => {
    setAvailSlots(prev => prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]);
  };

  // Common slots templates
  const allWeekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const allTimeSlots = ["09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"];

  return (
    <div id="doctor_dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Clinician Overview panel */}
      <div className="bg-slate-900 border border-slate-850 text-white rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 relative overflow-hidden">
        <div className="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(ellipse_60%_60%_at_0%_0%,rgba(13,148,136,0.22),rgba(0,0,0,0))]"></div>
        <div className="relative z-10 text-left">
          <span className="text-[10px] uppercase bg-teal-500/10 text-teal-350 border border-teal-500/20 px-3 py-1 rounded-full font-bold tracking-wider font-mono">
            Clinical Practitioner Board
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display mt-2">
            Welcome, {currentUser?.name}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium leading-relaxed max-w-xl">
            Authorize patient intakes, perform secure video consultations, and formulate customized constitutional prescriptions.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible bg-white border border-slate-150 p-2 rounded-2xl gap-1 mb-6 lg:mb-0 shrink-0">
          {[
            { id: "index", label: "Overview Board", icon: ClipboardList },
            { id: "appointments", label: "Consultation Log", icon: Calendar },
            { id: "availability", label: "Manage Hours", icon: Settings },
            { id: "patients", label: "My Patient Index", icon: User },
          ].map(it => {
            const Icon = it.icon;
            return (
              <button
                key={it.id}
                onClick={() => { setActiveTab(it.id as any); setComposingApt(null); }}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold text-left cursor-pointer transition whitespace-nowrap ${
                  activeTab === it.id && !composingApt
                    ? "bg-teal-600 text-white shadow-md shadow-teal-500/10"
                    : "text-slate-650 hover:bg-slate-50 hover:text-slate-950"
                }`}
                id={`doctor_sidebar_${it.id}`}
              >
                <Icon className="w-4 h-4" />
                <span>{it.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Display Panel */}
        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 min-h-[500px]">
          
          {/* --- RX PRESCRIPTION COMPOSER (Injected display) --- */}
          {composingApt && (
            <div id="prescription_composer_panel" className="text-left space-y-6">
              <div className="flex justify-between items-center border-b border-slate-150 pb-3">
                <h2 className="text-lg font-bold text-slate-900 font-display">
                  Compose Homeopathic Prescription - {composingApt.patientName}
                </h2>
                <button
                  onClick={() => setComposingApt(null)}
                  className="text-xs hover:underline font-bold text-slate-500"
                >
                  Cancel
                </button>
              </div>

              <div className="bg-slate-50 p-4 border border-slate-150 rounded-2xl text-xs flex gap-6">
                <div>
                  <span className="text-slate-450 block">Patient Code</span>
                  <strong className="text-slate-700">{composingApt.patientId}</strong>
                </div>
                <div>
                  <span className="text-slate-450 block">Case complaint</span>
                  <strong className="text-slate-700">{composingApt.medicalInfo.mainComplaint}</strong>
                </div>
              </div>

              <form onSubmit={handlePrescriptionSubmit} className="space-y-6 pt-4">
                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Medicines (dilutions/globules)</span>
                    <button
                      type="button"
                      onClick={addMedicineLine}
                      className="border border-slate-200 hover:bg-slate-50 font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1 transition"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Remedy Row</span>
                    </button>
                  </div>

                  {medicineLines.map((line, idx) => (
                    <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 border border-slate-150 p-3 rounded-2xl relative bg-slate-50/50">
                      <div className="md:col-span-4">
                        <label className="text-[10px] uppercase font-bold text-slate-450 block mb-0.5">Medicine Name & Potency</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Belladonna 30C"
                          value={line.name}
                          onChange={(e) => updateMedicineLine(idx, "name", e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-slate-450 block mb-0.5">Dosage</label>
                        <input
                          type="text"
                          required
                          placeholder="4 pills"
                          value={line.dosage}
                          onChange={(e) => updateMedicineLine(idx, "dosage", e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-[10px] uppercase font-bold text-slate-450 block mb-0.5">Duration</label>
                        <input
                          type="text"
                          required
                          placeholder="7 days"
                          value={line.duration}
                          onChange={(e) => updateMedicineLine(idx, "duration", e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <label className="text-[10px] uppercase font-bold text-slate-450 block mb-0.5">Instructions</label>
                        <input
                          type="text"
                          required
                          placeholder="Twice daily empty stomach"
                          value={line.instructions}
                          onChange={(e) => updateMedicineLine(idx, "instructions", e.target.value)}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 bg-white rounded-lg"
                        />
                      </div>
                      <div className="md:col-span-1 flex items-end justify-center pb-1">
                        <button
                          type="button"
                          disabled={medicineLines.length === 1}
                          onClick={() => removeMedicineLine(idx)}
                          className="text-rose-500 hover:text-rose-700 disabled:opacity-30 p-1 mb-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-2">Dietary Restrictions & lifestyle Guidelines</label>
                  <textarea
                    rows={3}
                    value={generalInstructions}
                    onChange={(e) => setGeneralInstructions(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-xl outline-none"
                  ></textarea>
                </div>

                <div className="flex gap-3 justify-end pt-3">
                  <button
                    type="button"
                    onClick={() => setComposingApt(null)}
                    className="px-4 py-2 border border-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-50 transition"
                  >
                    Go Back
                  </button>
                  <button
                    type="submit"
                    className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer"
                  >
                    Authorize & Upload Rx Prescription
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* --- 1. OVERVIEW INDEX BOARD --- */}
          {activeTab === "index" && !composingApt && (
            <div id="doctor_overview_tab" className="text-left space-y-8">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 font-display">
                Practitioner Overview
              </h2>

              {/* Stats badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-450 uppercase font-bold">Today's Slots</span>
                    <span className="text-lg font-extrabold text-slate-800">
                      {appointments.filter(a => a.preferredDate === new Date().toISOString().split("T")[0]).length}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 animate-pulse text-amber-500" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-450 uppercase font-bold">Pending requests</span>
                    <span className="text-lg font-extrabold text-slate-800">
                      {appointments.filter(a => a.status === "pending").length}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-450 uppercase font-bold">Finished Cases</span>
                    <span className="text-lg font-extrabold text-slate-800">
                      {appointments.filter(a => a.status === "completed").length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pending Approvals */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Pending Consultation Requests
                </h3>

                {appointments.filter(a => a.status === "pending").length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500 bg-slate-50 text-xs">
                    No active pending patients registered. All clear!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.filter(a => a.status === "pending").map((apt) => (
                      <div 
                        key={apt.id} 
                        className="bg-white border border-slate-250 p-5 rounded-2xl relative hover:border-teal-200 transition"
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-100">
                          <div>
                            <span className="text-sm font-bold text-slate-900 block font-display">{apt.patientName}</span>
                            <span className="text-xs text-slate-500">
                              Age {apt.age} &bull; {apt.gender} &bull; Weight: {apt.weight}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400">Request: {apt.id}</span>
                        </div>

                        {/* Intake info */}
                        <div className="py-3 text-xs leading-relaxed text-slate-700">
                          <strong>Intake Complaint:</strong> "{apt.medicalInfo.mainComplaint}"
                          {apt.medicalInfo.symptoms && <p className="mt-1"><strong>Symptoms:</strong> {apt.medicalInfo.symptoms}</p>}
                          <p className="mt-1 text-slate-500">Preferred: {apt.preferredDate} at {apt.preferredTimeSlot} ({apt.consultationMode})</p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                          <button
                            onClick={() => { setReschedulingAptId(apt.id); setRescheduleDate(apt.preferredDate); }}
                            className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => setRejectingAptId(apt.id)}
                            className="text-[11px] font-bold text-rose-650 hover:text-rose-700 border border-rose-100 hover:bg-rose-50 px-3.5 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => handleApprove(apt.id)}
                            className="text-[11px] font-extrabold text-white bg-teal-650 hover:bg-teal-700 px-4 py-1.5 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Confirm consult</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- 2. APPOINTMENTS LOG TAB --- */}
          {activeTab === "appointments" && !composingApt && (
            <div id="doctor_appointments_tab" className="text-left space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 font-display">
                Clinical Consultations Log
              </h2>

              {appointments.length === 0 ? (
                <div className="text-center p-16 text-slate-500 bg-slate-50 rounded-2xl text-xs">
                  No appointments registered in your account logs.
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div 
                      key={apt.id} 
                      className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-xs transition"
                    >
                      <div className="flex justify-between items-start flex-wrap gap-2 border-b border-slate-100 pb-3 mb-3">
                        <div>
                          <span className="text-base font-bold text-slate-900 font-display">{apt.patientName}</span>
                          <p className="text-xs text-slate-500">Slot: <strong className="font-semibold text-slate-700">{apt.preferredDate} at {apt.preferredTimeSlot}</strong> &bull; Mode: {apt.consultationMode}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase ${
                          apt.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-250" :
                          apt.status === "confirmed" ? "bg-teal-50 text-teal-700 border-teal-250" :
                          apt.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-250" :
                          "bg-amber-50 text-amber-705 border-amber-250"
                        }`}>
                          {apt.status}
                        </span>
                      </div>

                      <div className="text-xs leading-relaxed space-y-1 bg-slate-50/50 p-3.5 rounded-xl border border-slate-150">
                        <p><strong>Chief Complaint:</strong> {apt.medicalInfo.mainComplaint}</p>
                        {apt.medicalInfo.symptoms && <p><strong>Associated Symptoms:</strong> {apt.medicalInfo.symptoms}</p>}
                        <p><strong>Temps:</strong> Appetite {apt.homeopathyQuestions.appetite} | Thirst: {apt.homeopathyQuestions.thirstLevel} | Sleep: {apt.homeopathyQuestions.sleepPattern}</p>
                      </div>

                      {/* Document list */}
                      {apt.documents && apt.documents.length > 0 && (
                        <div className="pt-3 text-xs">
                          <span className="text-[10px] font-bold text-slate-450 uppercase block mb-1">Attached Patient logs:</span>
                          <div className="flex gap-2 flex-wrap">
                            {apt.documents.map((doc: any, i: number) => (
                              <div key={i} className="bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg font-medium text-slate-700 flex items-center gap-1 font-mono">
                                <FileText className="w-3 h-3 text-teal-600" />
                                <span>{doc.fileName}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Doctor notes filed */}
                      {apt.status === "completed" && apt.doctorNotes && (
                        <div className="bg-slate-50 border border-slate-150 p-3 rounded-xl text-xs text-slate-700 mt-3 leading-relaxed">
                          <strong>My consult Notes:</strong> "{apt.doctorNotes}"
                        </div>
                      )}

                      {/* Active actions */}
                      <div className="pt-3 border-t border-slate-100 flex gap-2 justify-end mt-3 flex-wrap">
                        <button
                          onClick={() => openIntakeEditor(apt)}
                          className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span>Edit Intake Details</span>
                        </button>
                        
                        {apt.status === "confirmed" && (
                          <button
                            id={`doctor_join_call_${apt.id}`}
                            onClick={() => quickLaunchCall(apt)}
                            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Active Call PORT</span>
                          </button>
                        )}

                        {apt.status === "confirmed" && (
                          <button
                            id={`doctor_prescribe_btn_${apt.id}`}
                            onClick={() => setComposingApt(apt)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Add Prescription</span>
                          </button>
                        )}
                        
                        {apt.status === "completed" && prescriptions.some(p => p.appointmentId === apt.id) && (
                          <button
                            id={`view_submitted_prescription_${apt.id}`}
                            onClick={() => setActiveRxRecord(prescriptions.find(p => p.appointmentId === apt.id))}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-755 border border-slate-200 font-semibold text-xs px-4 py-2 rounded-xl cursor-pointer"
                          >
                            View Filed Prescription
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- 3. MANAGE HOURS & AVAILABILITY --- */}
          {activeTab === "availability" && !composingApt && (
            <div id="doctor_availability_tab" className="text-left space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 font-display">
                Weekly Available Hours Setup
              </h2>

              <p className="text-xs text-slate-500">
                Configure days and specific hour slots that patients can select in their booking dashboard inputs. Double booking is prevented automatically by our calendar controllers.
              </p>

              {slotSaveOk && (
                <div id="availability_success_banner" className="bg-emerald-50 border border-emerald-250 text-emerald-800 text-xs font-bold p-3.5 rounded-xl flex gap-2 items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                  <span>Your clinical day availability calendars have been updated successfully!</span>
                </div>
              )}

              <div className="space-y-6">
                {/* Active weekdays */}
                <div>
                  <h3 className="text-xs font-bold text-teal-650 uppercase tracking-widest mb-3">1. Active consultation Days</h3>
                  <div className="flex flex-wrap gap-2">
                    {allWeekdays.map(day => {
                      const active = availDays.includes(day);
                      return (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-4 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
                            active 
                              ? "bg-teal-50 border-teal-500 text-teal-700" 
                              : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50"
                          }`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hour slots */}
                <div>
                  <h3 className="text-xs font-bold text-teal-650 uppercase tracking-widest mb-3 font-display">2. Daily Consultation Slots</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5">
                    {allTimeSlots.map(slot => {
                      const active = availSlots.includes(slot);
                      return (
                        <button
                          key={slot}
                          onClick={() => toggleSlot(slot)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition border text-center ${
                            active 
                              ? "bg-teal-50 border-teal-500 text-teal-700" 
                              : "bg-white border-slate-200 text-slate-655 hover:bg-slate-50"
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    id="save_availability_btn"
                    onClick={handleSaveAvailability}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold px-6 py-3 rounded-xl transition shadow-md cursor-pointer"
                  >
                    {isSlotSaving ? "Saving..." : "Save Availability schedule"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- 4. MY PATIENTS INDEX --- */}
          {activeTab === "patients" && !composingApt && (
            <div id="doctor_patients_tab" className="text-left space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 font-display">
                Registered Patients Index
              </h2>

              {appointments.length === 0 ? (
                <div className="text-center p-16 text-slate-500 bg-slate-50 rounded-2xl text-xs">
                  No patients assigned previously.
                </div>
              ) : (
                <div className="overflow-hidden border border-slate-150 rounded-2xl divide-y divide-slate-100">
                  {Array.from(new Set(appointments.map(a => a.patientId))).map((patId) => {
                    const latestApt = appointments.find(a => a.patientId === patId);
                    if (!latestApt) return null;
                    return (
                      <div key={patId} className="p-4 flex justify-between items-center hover:bg-slate-50 transition text-xs">
                        <div>
                          <span className="font-bold text-slate-900 text-sm font-display block">{latestApt.patientName}</span>
                          <span className="text-slate-500 block mt-0.5">Occupation: {latestApt.occupation || "Developer"} &bull; Phone: {latestApt.patientPhone}</span>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setActiveTab("appointments");
                              // Quick filter context
                            }}
                            className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold px-3 py-1.5 rounded-lg transition cursor-pointer"
                          >
                            Explore Case files
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      {/* SECURE CALL MODAL */}
      {activeCallApt && (
        <ConsultationRoom
          appointment={activeCallApt}
          userRole="doctor"
          onClose={() => setActiveCallApt(null)}
          onComplete={async (notes) => {
            const ok = await updateAppointmentStatus(activeCallApt.id, "completed", { doctorNotes: notes });
            if (ok) {
              setActiveCallApt(null);
              // Direct doctor to prescribe immediately
              setComposingApt(activeCallApt);
            }
          }}
        />
      )}

      {/* DECLINE APPOINTMENT COMPONENT OVERLAY */}
      {rejectingAptId && (
        <div id="decline_appointment_modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-left">
            <div className="bg-slate-950 p-5 text-white">
              <h3 className="text-sm font-bold font-display">Decline Consultation Slot</h3>
            </div>
            
            <form onSubmit={handleDeclineSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Decline Reason for client feedback *</label>
                <textarea
                  required
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Schedule conflicts, please select upcoming Tuesday slots instead..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-250 bg-slate-50 rounded-xl focus:bg-white outline-none transition"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingAptId(null)}
                  className="px-4 py-2 border border-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-rose-650 hover:bg-rose-600 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Confirm Decline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESCHEDULE APPOINTMENT MODAL OVERLAY */}
      {reschedulingAptId && (
        <div id="reschedule_appointment_modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-left">
            <div className="bg-slate-950 p-5 text-white">
              <h3 className="text-sm font-bold font-display">Reschedule Consultation</h3>
            </div>
            
            <form onSubmit={handleRescheduleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Proposed Date *</label>
                  <input
                    type="date"
                    required
                    value={rescheduleDate}
                    onChange={(e) => setRescheduleDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Proposed Slot</label>
                  <select
                    value={rescheduleTime}
                    onChange={(e) => setRescheduleTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl outline-none"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="04:00 PM">04:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReschedulingAptId(null)}
                  className="px-4 py-2 border border-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  Send Proposal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTAKE EDITING MODAL */}
      {editingIntakeApt && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl my-8">
            <form onSubmit={handleSaveIntakeEdit}>
              {/* Header */}
              <div className="border-b border-slate-200 p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-extrabold text-slate-900 font-display">
                    Edit Patient Intake Details
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Patient: <strong>{editingIntakeApt.patientName}</strong> &bull; {editingIntakeApt.preferredDate}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingIntakeApt(null)}
                  className="text-slate-400 hover:text-slate-600 p-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content - Scrollable */}
              <div className="p-6 space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto">
                {/* PATIENT DEMOGRAPHICS SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <User className="w-5 h-5 text-blue-600" />
                    <h4 className="text-sm font-extrabold uppercase tracking-wider text-blue-600">
                      Patient Demographics
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Age *
                      </label>
                      <input
                        type="number"
                        required
                        value={editAge}
                        onChange={(e) => setEditAge(e.target.value)}
                        placeholder="25"
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Gender *
                      </label>
                      <select
                        required
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value)}
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition font-semibold"
                      >
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Height
                      </label>
                      <input
                        type="text"
                        value={editHeight}
                        onChange={(e) => setEditHeight(e.target.value)}
                        placeholder="5'8&quot;"
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Weight
                      </label>
                      <input
                        type="text"
                        value={editWeight}
                        onChange={(e) => setEditWeight(e.target.value)}
                        placeholder="68 kg"
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Marital Status
                      </label>
                      <select
                        value={editMaritalStatus}
                        onChange={(e) => setEditMaritalStatus(e.target.value)}
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition font-semibold"
                      >
                        <option value="">Select...</option>
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Occupation
                      </label>
                      <input
                        type="text"
                        value={editOccupation}
                        onChange={(e) => setEditOccupation(e.target.value)}
                        placeholder="Software Engineer"
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Address
                      </label>
                      <input
                        type="text"
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        placeholder="123 Main Street"
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        placeholder="Boston"
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={editState}
                        onChange={(e) => setEditState(e.target.value)}
                        placeholder="MA"
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Country
                      </label>
                      <input
                        type="text"
                        value={editCountry}
                        onChange={(e) => setEditCountry(e.target.value)}
                        placeholder="USA"
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-blue-500 transition font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* CLINICAL HISTORY SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <FileText className="w-5 h-5 text-teal-600" />
                    <h4 className="text-sm font-extrabold uppercase tracking-wider text-teal-600">
                      Clinical History Intake
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Main Complaint *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={editMainComplaint}
                        onChange={(e) => setEditMainComplaint(e.target.value)}
                        placeholder="Please describe the core reason of consultation..."
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Associated Symptoms
                      </label>
                      <textarea
                        rows={3}
                        value={editSymptoms}
                        onChange={(e) => setEditSymptoms(e.target.value)}
                        placeholder="Throbbing pain, nausea, cold feet..."
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Problem Duration
                      </label>
                      <input
                        type="text"
                        value={editDuration}
                        onChange={(e) => setEditDuration(e.target.value)}
                        placeholder="2 Yrs"
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Current Medications
                      </label>
                      <input
                        type="text"
                        value={editMedications}
                        onChange={(e) => setEditMedications(e.target.value)}
                        placeholder="Sumatriptan 50mg"
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Previous Treatments
                      </label>
                      <input
                        type="text"
                        value={editPrevTreatments}
                        onChange={(e) => setEditPrevTreatments(e.target.value)}
                        placeholder="Allopathy pain control"
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Allergies
                      </label>
                      <input
                        type="text"
                        value={editAllergies}
                        onChange={(e) => setEditAllergies(e.target.value)}
                        placeholder="None"
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Chronic Diseases
                      </label>
                      <input
                        type="text"
                        value={editChronicDiseases}
                        onChange={(e) => setEditChronicDiseases(e.target.value)}
                        placeholder="None"
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Family Medical History
                      </label>
                      <input
                        type="text"
                        value={editFamilyHistory}
                        onChange={(e) => setEditFamilyHistory(e.target.value)}
                        placeholder="Mother has migraine history"
                        className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* TEMPERAMENT SECTION */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Heart className="w-5 h-5 text-teal-600" />
                    <h4 className="text-sm font-extrabold uppercase tracking-wider text-teal-600">
                      Homeopathic Temperament Triaging
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Appetite
                      </label>
                      <select
                        value={editAppetite}
                        onChange={(e) => setEditAppetite(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                      >
                        <option value="Normal">Normal</option>
                        <option value="Excessive hunger">Excessive hunger</option>
                        <option value="Loss of appetite">Loss of appetite</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Sleep Pattern
                      </label>
                      <select
                        value={editSleep}
                        onChange={(e) => setEditSleep(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                      >
                        <option value="Refreshing sound sleep">Refreshing sound sleep</option>
                        <option value="Restless sleep, wakes up around 3 AM">Restless sleep, wakes up around 3 AM</option>
                        <option value="Insomnia, highly hyperactive brain">Insomnia, highly hyperactive brain</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Thirst Level
                      </label>
                      <select
                        value={editThirst}
                        onChange={(e) => setEditThirst(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                      >
                        <option value="Thirstless (rarely drinks)">Thirstless (rarely drinks)</option>
                        <option value="Thirsty (frequent heavy cups)">Thirsty (frequent heavy cups)</option>
                        <option value="Prefers cold/iced beverages">Prefers cold/iced beverages</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Emotional Temperament & Stress
                      </label>
                      <textarea
                        rows={3}
                        value={editEmotionalState}
                        onChange={(e) => setEditEmotionalState(e.target.value)}
                        placeholder="e.g. Easily irritable, gets anxious with loud noises..."
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">
                        Weather Sensitivities
                      </label>
                      <textarea
                        rows={3}
                        value={editWeatherSensitivity}
                        onChange={(e) => setEditWeatherSensitivity(e.target.value)}
                        placeholder="e.g. Catarrh triggered by dry air, highly chilled by wind..."
                        className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-slate-200 p-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingIntakeApt(null)}
                  className="px-6 py-2.5 border border-slate-200 font-semibold text-sm rounded-xl hover:bg-slate-50 transition"
                  disabled={isSavingIntake}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingIntake}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm px-6 py-2.5 rounded-xl transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSavingIntake ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP WRAP RETRIEVED RX */}
      {activeRxRecord && (
        <PrescriptionViewer
          prescription={activeRxRecord}
          onClose={() => setActiveRxRecord(null)}
        />
      )}

    </div>
  );
};
