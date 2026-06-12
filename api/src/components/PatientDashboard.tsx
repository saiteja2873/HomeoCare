import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Upload, 
  PlusCircle, 
  Activity, 
  ChevronLeft,
  ChevronRight, 
  Video, 
  Inbox, 
  CheckCircle, 
  AlertTriangle,
  ClipboardList,
  MapPin,
  Heart,
  Droplet,
  Moon,
  Trash2,
  FileSpreadsheet
} from "lucide-react";
import { ConsultationRoom } from "./ConsultationRoom";
import { PrescriptionViewer } from "./PrescriptionViewer";

export const PatientDashboard: React.FC = () => {
  const { 
    currentUser, 
    doctors, 
    appointments, 
    prescriptions, 
    bookAppointment, 
    uploadDocument,
    updateAppointmentStatus,
    setError 
  } = useApp();

  const formatDoctorName = (name?: string) => {
    if (!name) return "Homeopathic Specialist";
    return name.toLowerCase().startsWith("dr.") || name.toLowerCase().startsWith("dr ") ? name : `Dr. ${name}`;
  };

  // Selected Sidebar Selection
  // 'index' (dashboard Overview) | 'book' | 'history' | 'records' | 'profile'
  const [activeTab, setActiveTab] = useState<"index" | "book" | "history" | "records" | "profile">("index");

  // Call states
  const [activeCallAppointment, setActiveCallAppointment] = useState<any | null>(null);
  const [activePrescription, setActivePrescription] = useState<any | null>(null);

  // --- Booking Form States ---
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  // Personal & Contacts
  const [patName, setPatName] = useState(currentUser?.name || "");
  const [patAge, setPatAge] = useState("");
  const [patGender, setPatGender] = useState("Female");
  const [patHeight, setPatHeight] = useState("");
  const [patWeight, setPatWeight] = useState("");
  const [patMarital, setPatMarital] = useState("Single");
  const [patOccupation, setPatOccupation] = useState("");
  const [patPhone, setPatPhone] = useState(currentUser?.phone || "");
  const [patEmail, setPatEmail] = useState(currentUser?.email || "");
  const [patAddress, setPatAddress] = useState("");
  const [patCity, setPatCity] = useState("");
  const [patState, setPatState] = useState("");
  const [patCountry, setPatCountry] = useState("USA");

  // Consult Config
  const [prefDate, setPrefDate] = useState("");
  const [prefTime, setPrefTime] = useState("10:00 AM");
  const [consultMode, setConsultMode] = useState<"video" | "audio" | "in-person">("video");

  // Medical Section
  const [mainComplaint, setMainComplaint] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");
  const [medications, setMedications] = useState("");
  const [prevTreatments, setPrevTreatments] = useState("");
  const [allergies, setAllergies] = useState("");
  const [chronicDiseases, setChronicDiseases] = useState("");
  const [familyHistory, setFamilyHistory] = useState("");

  // Homeopathy Specific
  const [appetite, setAppetite] = useState("Normal");
  const [sleep, setSleep] = useState("Interrupted");
  const [thirst, setThirst] = useState("Thirsty");
  const [stress, setStress] = useState("Moderate");
  const [emotionalState, setEmotionalState] = useState("Anxious");
  const [foodPref, setFoodPref] = useState("");
  const [weatherSensitivity, setWeatherSensitivity] = useState("Very sensitive to cold and winds");

  // Attached files list
  const [uploadedFilesList, setUploadedFilesList] = useState<any[]>([]);
  const [dragActive, setDragActive] = useState(false);

  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [formStep, setFormStep] = useState(1);

  // Handle Drag-and-Drop Document upload
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    // virtual uploading
    const uploaded = await uploadDocument(file.name, `${sizeMB} MB`, file.type);
    if (uploaded) {
      setUploadedFilesList(prev => [...prev, uploaded]);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const steps = [
    { number: 1, title: "Specialist", label: "Consultant Physician" },
    { number: 2, title: "Profile", label: "Intake Details" },
    { number: 3, title: "Schedule", label: "Date & Time Slot" },
    { number: 4, title: "Clinical", label: "Medical History" },
    { number: 5, title: "Temperament", label: "Homeopathic Triaging" },
    { number: 6, title: "Attachments", label: "Medical Reports" }
  ];

  const isStepValid = (stepNum: number) => {
    if (stepNum === 1) {
      return selectedDoctorId !== "";
    }
    if (stepNum === 2) {
      return (
        patName.trim() !== "" &&
        patAge.trim() !== "" &&
        patPhone.trim() !== "" &&
        patEmail.trim() !== "" &&
        patAddress.trim() !== "" &&
        patCity.trim() !== "" &&
        patState.trim() !== "" &&
        patCountry.trim() !== ""
      );
    }
    if (stepNum === 3) {
      return prefDate !== "";
    }
    if (stepNum === 4) {
      return mainComplaint.trim() !== "";
    }
    return true;
  };

  // Submit Booking
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctorId || !prefDate) {
      setError("Please select a physician and choose an appointment day.");
      return;
    }

    const bookingPayload = {
      doctorId: selectedDoctorId,
      patientName: patName,
      patientPhone: patPhone,
      patientEmail: patEmail,
      age: Number(patAge) || 30,
      gender: patGender,
      height: patHeight,
      weight: patWeight,
      maritalStatus: patMarital,
      occupation: patOccupation,
      address: patAddress,
      city: patCity,
      state: patState,
      country: patCountry,
      preferredDate: prefDate,
      preferredTimeSlot: prefTime,
      consultationMode: consultMode,
      medicalInfo: {
        mainComplaint,
        symptoms,
        durationOfProblem: duration,
        currentMedications: medications,
        previousTreatments: prevTreatments,
        allergies,
        chronicDiseases,
        familyMedicalHistory: familyHistory
      },
      homeopathyQuestions: {
        appetite,
        sleepPattern: sleep,
        thirstLevel: thirst,
        stressLevel: stress,
        emotionalState,
        foodPreferences: foodPref,
        sensitivityToWeather: weatherSensitivity
      },
      documents: uploadedFilesList
    };

    const success = await bookAppointment(bookingPayload);
    if (success) {
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setActiveTab("history"); // Navigate to history log list
        // Reset form
        setSelectedDoctorId("");
        setMainComplaint("");
        setSymptoms("");
        setDuration("");
        setUploadedFilesList([]);
        setFormStep(1);
      }, 3500);
    }
  };

  const quickLaunchConsultation = (apt: any) => {
    setActiveCallAppointment(apt);
  };

  const loadPrescriptionForAppointment = (aptId: string) => {
    const rx = prescriptions.find(p => p.appointmentId === aptId);
    if (rx) {
      setActivePrescription(rx);
    } else {
      setError("This prescription is currently being parsed or was not filed correctly.");
    }
  };

  const sidebarItems = [
    { id: "index", label: "Dashboard Overview", icon: Activity },
    { id: "book", label: "Book Consultation", icon: PlusCircle },
    { id: "history", label: "Appointments History", icon: Calendar },
    { id: "records", label: "Medical Files Cabin", icon: FileText },
    { id: "profile", label: "My Case Profile", icon: ClipboardList }
  ];

  return (
    <div id="patient_dashboard" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Mini top profile alert */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-850 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_100%_0%,rgba(13,148,136,0.25),rgba(0,0,0,0))]"></div>
        <div className="relative z-10">
          <span className="text-[10px] uppercase bg-teal-500/10 text-teal-350 border border-teal-500/20 px-3 py-1 rounded-full font-bold tracking-wider font-mono">
            Secure Case Profile (Patient Portal)
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white mt-2 leading-none">
            Welcome Back, {currentUser?.name}
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1.5 font-medium leading-normal">
            Analyze your homeopathic dilutes, upcoming consultations, and direct secure records.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side Tab Navigation */}
        <div className="lg:col-span-3 flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible bg-white border border-slate-150 p-2 rounded-2xl gap-1 shrink-0 mb-6 lg:mb-0">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-left text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                  activeTab === item.id
                    ? "bg-teal-650 text-white shadow-md shadow-teal-700/10"
                    : "text-slate-650 hover:bg-slate-50 hover:text-slate-950"
                }`}
                id={`patient_sidebar_${item.id}`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tab Contents container */}
        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 min-h-[500px]">
          
          {/* --- A. OVERVIEW DASHBOARD INDEX --- */}
          {activeTab === "index" && (
            <div id="patient_overview_tab" className="space-y-8 text-left">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 font-display">
                Dashboard Overview
              </h2>

              {/* Counts panels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-450 uppercase font-bold">Total Consultations</span>
                    <span className="text-lg font-extrabold text-slate-800">{appointments.length}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-450 uppercase font-bold">Prescriptions filed</span>
                    <span className="text-lg font-extrabold text-slate-800">{prescriptions.length}</span>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl flex items-center gap-4">
                  <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-[10px] text-slate-450 uppercase font-bold">Health Documents</span>
                    <span className="text-lg font-extrabold text-slate-800">
                      {appointments.reduce((acc, a) => acc + (a.documents?.length || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Upcoming Consultations listing */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
                  Upcoming Consultations
                </h3>

                {appointments.filter(a => a.status === "confirmed" || a.status === "pending").length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-500 bg-slate-50">
                    <Inbox className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold">No pending or upcoming consultations.</p>
                    <button 
                      onClick={() => setActiveTab("book")} 
                      className="text-teal-600 font-bold text-xs mt-1 px-3 py-1 hover:underline"
                    >
                      Book Your First Slot
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {appointments.filter(a => a.status === "confirmed" || a.status === "pending").map((apt) => (
                      <div 
                        key={apt.id} 
                        className="bg-white border border-slate-200 hover:border-teal-200 rounded-2xl p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900 font-display">
                              Consultation with {formatDoctorName(doctors.find(d => d.id === apt.doctorId)?.name)}
                            </span>
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider border ${
                              apt.status === "confirmed"
                                ? "bg-teal-50 text-teal-700 border-teal-200"
                                : "bg-amber-50 text-amber-700 border-amber-250"
                            }`}>
                              {apt.status}
                            </span>
                          </div>
                          
                          <div className="flex gap-4 items-center text-xs text-slate-500 mt-2">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {apt.preferredDate}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              {apt.preferredTimeSlot}
                            </span>
                            <span className="text-[10px] capitalize bg-slate-100 text-slate-600 font-bold tracking-wide px-2 py-0.5 rounded-md">
                              {apt.consultationMode}
                            </span>
                          </div>
                        </div>

                        <div className="w-full sm:w-auto flex gap-2">
                          {apt.status === "confirmed" && (
                            <button
                              id={`join_call_btn_${apt.id}`}
                              onClick={() => quickLaunchConsultation(apt)}
                              className="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-700 hover:to-teal-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-teal-700/15 flex items-center justify-center gap-1 cursor-pointer"
                            >
                              <Video className="w-3.5 h-3.5" />
                              <span>Join Call</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- B. BOOK APPOINTMENT FORM CABINET --- */}
          {activeTab === "book" && (
            <div id="patient_booking_cabinet" className="text-left space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 font-display">
                Homeopathy Consultation & Case intake Profile Form
              </h2>

              {bookingSuccess ? (
                <div id="booking_success_box" className="p-8 bg-teal-50 border border-teal-200 rounded-3xl text-center space-y-4">
                  <CheckCircle className="w-12 h-12 text-teal-600 mx-auto" />
                  <h3 className="text-lg font-bold font-display text-teal-800">Consultation Booked Successfully!</h3>
                  <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
                    Your diagnostic intake form has been submitted to your doctor's desk. An automated email confirmation (Resend simulated) has been dispatched.
                  </p>
                </div>
              ) : (
                <form id="appointment_booking_form" onSubmit={handleBookingSubmit} className="space-y-6">
                  
                  {/* Interactive Modern Stepper Progress Tracker */}
                  <div className="mb-8 bg-slate-50/70 p-4 md:p-6 rounded-3xl border border-slate-150">
                    {/* Progress Bar Label */}
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-600 font-display flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-teal-500" />
                        Intake Progress
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        Step {formStep} of {steps.length} — {Math.round(((formStep - 1) / (steps.length - 1)) * 100)}% Complete
                      </span>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-6">
                      <div 
                        className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${((formStep - 1) / (steps.length - 1)) * 100}%` }}
                      />
                    </div>

                    {/* Stepper Dots & Labels */}
                    <div className="grid grid-cols-6 gap-2 md:gap-4">
                      {steps.map((st) => {
                        const isCurrent = formStep === st.number;
                        const isCompleted = formStep > st.number;
                        return (
                          <button
                            key={st.number}
                            type="button"
                            onClick={() => {
                              // Allow jumping back to any completed step or the next possible step if valid
                              if (st.number < formStep) {
                                setFormStep(st.number);
                              } else if (st.number > formStep) {
                                // Check if we can proceed to st.number
                                let canProceed = true;
                                for (let i = formStep; i < st.number; i++) {
                                  if (!isStepValid(i)) {
                                    canProceed = false;
                                    setError(`Please complete all required fields on Step ${i} ("${steps[i-1].title}") first.`);
                                    break;
                                  }
                                }
                                if (canProceed) {
                                  setFormStep(st.number);
                                }
                              }
                            }}
                            className="flex flex-col items-center group focus:outline-none cursor-pointer"
                          >
                            <div 
                              className={`w-7 h-7 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200 ${
                                isCompleted 
                                  ? "bg-teal-600 text-white shadow-xs" 
                                  : isCurrent 
                                    ? "bg-teal-50 text-teal-600 border-2 border-teal-500 shadow-md ring-4 ring-teal-50/70" 
                                    : "bg-white text-slate-400 border border-slate-250"
                              }`}
                            >
                              {isCompleted ? "✓" : st.number}
                            </div>
                            <span 
                              className={`mt-2 hidden md:block text-[9px] font-bold uppercase tracking-wider text-center transition-all ${
                                st.number === formStep
                                  ? "text-teal-600 font-extrabold"
                                  : "text-slate-450 group-hover:text-slate-650"
                              }`}
                            >
                              {st.title}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* STEP 1: PHYSICIAN SELECTION */}
                  {formStep === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                        <User className="w-5 h-5 text-teal-600" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-teal-600">
                          Step 1: Physician Assignment
                        </h3>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Choose Approved Homeopathic Specialist *</label>
                        <select
                          id="form_doctor_select"
                          required
                          value={selectedDoctorId}
                          onChange={(e) => setSelectedDoctorId(e.target.value)}
                          className="w-full text-xs px-3.5 py-3 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white outline-none focus:border-teal-500 transition-all font-semibold"
                        >
                          <option value="">-- Choose Your Specialist --</option>
                          {doctors.map(d => (
                            <option key={d.id} value={d.id}>
                              {formatDoctorName(d.name)} ({d.profile?.specialization || "Homeopathy Specialist"})
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: MICRO-PERSONAL DETAILS */}
                  {formStep === 2 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                        <ClipboardList className="w-5 h-5 text-teal-600" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-teal-600">
                          Step 2: Case Demographic Details
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Full Name *</label>
                          <input
                            type="text"
                            required
                            value={patName}
                            onChange={(e) => setPatName(e.target.value)}
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Age *</label>
                          <input
                            type="number"
                            required
                            value={patAge}
                            onChange={(e) => setPatAge(e.target.value)}
                            placeholder="e.g. 32"
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Gender *</label>
                          <select
                            value={patGender}
                            onChange={(e) => setPatGender(e.target.value)}
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          >
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Height (e.g. 5'6") *</label>
                          <input
                            type="text"
                            required
                            value={patHeight}
                            onChange={(e) => setPatHeight(e.target.value)}
                            placeholder="5ft 6in"
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Weight (lbs/kg) *</label>
                          <input
                            type="text"
                            required
                            value={patWeight}
                            onChange={(e) => setPatWeight(e.target.value)}
                            placeholder="130 lbs"
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Marital Status *</label>
                          <select
                            value={patMarital}
                            onChange={(e) => setPatMarital(e.target.value)}
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          >
                            <option value="Single">Single</option>
                            <option value="Married">Married</option>
                            <option value="Divorced">Divorced</option>
                            <option value="Widowed">Widowed</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Occupation</label>
                          <input
                            type="text"
                            value={patOccupation}
                            onChange={(e) => setPatOccupation(e.target.value)}
                            placeholder="Software Engineer"
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Mobile Number *</label>
                          <input
                            type="text"
                            required
                            value={patPhone}
                            onChange={(e) => setPatPhone(e.target.value)}
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Email *</label>
                          <input
                            type="email"
                            required
                            value={patEmail}
                            onChange={(e) => setPatEmail(e.target.value)}
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Street Address *</label>
                          <input
                            type="text"
                            required
                            value={patAddress}
                            onChange={(e) => setPatAddress(e.target.value)}
                            placeholder="42 High St"
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4 pb-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">City *</label>
                          <input
                            type="text"
                            required
                            value={patCity}
                            onChange={(e) => setPatCity(e.target.value)}
                            placeholder="Boston"
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">State *</label>
                          <input
                            type="text"
                            required
                            value={patState}
                            onChange={(e) => setPatState(e.target.value)}
                            placeholder="MA"
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Country *</label>
                          <input
                            type="text"
                            required
                            value={patCountry}
                            onChange={(e) => setPatCountry(e.target.value)}
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: CONSULTATION SETTINGS */}
                  {formStep === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                        <Calendar className="w-5 h-5 text-teal-600" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-teal-600">
                          Step 3: Consultation Slots Setup
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Preferred Consultation Mode</label>
                          <select
                            value={consultMode}
                            onChange={(e) => setConsultMode(e.target.value as any)}
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          >
                            <option value="video">🎥 Video Call</option>
                            <option value="audio">📞 Audio Call</option>
                            <option value="in-person">🏥 In-Person Clinic</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Preferred Date *</label>
                          <input
                            type="date"
                            required
                            value={prefDate}
                            onChange={(e) => setPrefDate(e.target.value)}
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Preferred Time Slot</label>
                          <select
                            value={prefTime}
                            onChange={(e) => setPrefTime(e.target.value)}
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          >
                            <option value="09:00 AM">09:00 AM</option>
                            <option value="10:00 AM">10:00 AM</option>
                            <option value="11:00 AM">11:00 AM</option>
                            <option value="12:00 PM">12:00 PM</option>
                            <option value="02:00 PM">02:00 PM</option>
                            <option value="03:00 PM">03:00 PM</option>
                            <option value="04:00 PM">04:00 PM</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: CLINICAL HISTORY INTAKE */}
                  {formStep === 4 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                        <FileText className="w-5 h-5 text-teal-600" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-teal-600">
                          Step 4: Clinical History Intake
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Main Complaint *</label>
                          <textarea
                            required
                            rows={3}
                            value={mainComplaint}
                            onChange={(e) => setMainComplaint(e.target.value)}
                            placeholder="Please describe the core reason of consultation..."
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-sans focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          ></textarea>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Associated Symptoms</label>
                          <textarea
                            rows={3}
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder="Throbbing pain, nausea, cold feet..."
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 font-sans focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          ></textarea>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Problem Duration (e.g., 2 years)</label>
                          <input
                            type="text"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="2 Yrs"
                            className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Current Medications</label>
                          <input
                            type="text"
                            value={medications}
                            onChange={(e) => setMedications(e.target.value)}
                            placeholder="Sumatriptan 50mg"
                            className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Previous Treatments</label>
                          <input
                            type="text"
                            value={prevTreatments}
                            onChange={(e) => setPrevTreatments(e.target.value)}
                            placeholder="Allopathy pain control"
                            className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 pb-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Allergies (e.g. food/dust)</label>
                          <input
                            type="text"
                            value={allergies}
                            onChange={(e) => setAllergies(e.target.value)}
                            placeholder="None"
                            className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Chronic Diseases</label>
                          <input
                            type="text"
                            value={chronicDiseases}
                            onChange={(e) => setChronicDiseases(e.target.value)}
                            placeholder="None"
                            className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Family Medical History</label>
                          <input
                            type="text"
                            value={familyHistory}
                            onChange={(e) => setFamilyHistory(e.target.value)}
                            placeholder="Mother has migraine history"
                            className="w-full text-xs px-4 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: HOMEOPATHIC TEMPERAMENTS PROFILING */}
                  {formStep === 5 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                        <Heart className="w-5 h-5 text-teal-600" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-teal-600">
                          Step 5: Homeopathic Temperament Triaging
                        </h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Appetite</label>
                          <select
                            value={appetite}
                            onChange={(e) => setAppetite(e.target.value)}
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          >
                            <option value="Normal">Normal</option>
                            <option value="Excessive hunger">Excessive hunger</option>
                            <option value="Loss of appetite">Loss of appetite</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Sleep Pattern</label>
                          <select
                            value={sleep}
                            onChange={(e) => setSleep(e.target.value)}
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          >
                            <option value="Refreshing sound sleep">Refreshing sound sleep</option>
                            <option value="Restless sleep, wakes up around 3 AM">Restless sleep, wakes up around 3 AM</option>
                            <option value="Insomnia, highly hyperactive brain">Insomnia, highly hyperactive brain</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Thirst Level</label>
                          <select
                            value={thirst}
                            onChange={(e) => setThirst(e.target.value)}
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 bg-slate-50 rounded-xl focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          >
                            <option value="Thirstless (rarely drinks)">Thirstless (rarely drinks)</option>
                            <option value="Thirsty (frequent heavy cups)">Thirsty (frequent heavy cups)</option>
                            <option value="Prefers cold/iced beverages">Prefers cold/iced beverages</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Emotional Temperament & Stress</label>
                          <textarea
                            rows={3}
                            value={emotionalState}
                            onChange={(e) => setEmotionalState(e.target.value)}
                            placeholder="e.g. Easily irritable, gets anxious with loud noises, needs company..."
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          ></textarea>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Weather Sensitivities</label>
                          <textarea
                            rows={3}
                            value={weatherSensitivity}
                            onChange={(e) => setWeatherSensitivity(e.target.value)}
                            placeholder="e.g. Catarrh triggered immediately by dry air, highly chilled by wind..."
                            className="w-full text-xs px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:bg-white outline-none focus:border-teal-500 transition font-semibold"
                          ></textarea>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: FILE UPLOADS */}
                  {formStep === 6 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
                      <div className="flex items-center gap-2 mb-2 border-b border-slate-100 pb-2">
                        <Upload className="w-5 h-5 text-teal-600" />
                        <h3 className="text-sm font-extrabold uppercase tracking-wider text-teal-600">
                          Step 6: Diagnostic report upload
                        </h3>
                      </div>

                      {/* Drag & Drop Zone */}
                      <div 
                        id="drag_drop_zone"
                        className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
                          dragActive ? "border-teal-500 bg-teal-50/50" : "border-slate-200 bg-slate-50/50 hover:border-slate-300"
                        }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                      >
                        <Upload className="w-10 h-10 text-slate-450 mx-auto mb-3" />
                        <p className="text-xs font-semibold text-slate-700">
                          Drag and drop your diagnostic files here, or{" "}
                          <label className="text-teal-600 hover:underline cursor-pointer">
                            <span>browse standard files</span>
                            <input
                              type="file"
                              accept=".pdf, .jpg, .png, image/jpeg, image/png, application/pdf"
                              className="hidden"
                              onChange={handleFileSelect}
                            />
                          </label>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">Supports MRI, Blood reports and visual dermatitis logs (up to 10MB).</p>

                        {/* Display Uploaded files under intake */}
                        {uploadedFilesList.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-150 text-left space-y-1.5">
                            <p className="text-[10px] font-bold uppercase text-slate-450 tracking-wider">Prepared Attachments:</p>
                            {uploadedFilesList.map((file, i) => (
                              <div key={i} className="flex justify-between items-center bg-white p-2 rounded-xl border border-slate-200 text-xs shadow-2xs font-sans">
                                <span className="font-semibold text-slate-750 font-mono">{file.fileName} ({file.fileSize})</span>
                                <span className="text-[10px] bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full font-bold">READY</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* STEPPER NAVIGATION ACTION FOOTER FOOTPRINT */}
                  <div className="flex justify-between items-center pt-6 border-t border-slate-150 mt-8">
                    {formStep > 1 ? (
                      <button
                        type="button"
                        id="stepper_prev_btn"
                        onClick={() => setFormStep(prev => Math.max(1, prev - 1))}
                        className="flex items-center gap-1.5 px-5 py-3 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:border-slate-300 font-bold rounded-xl text-xs transition cursor-pointer active:scale-95"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>
                    ) : (
                      <div /> // Spacer to hold flex balance
                    )}

                    {formStep < steps.length ? (
                      <button
                        type="button"
                        id="stepper_next_btn"
                        onClick={() => {
                          if (!isStepValid(formStep)) {
                            if (formStep === 1) {
                              setError("Please select a valid Homeopathic Specialist to proceed.");
                            } else if (formStep === 2) {
                              setError("Please complete all required demographic and contact details.");
                            } else if (formStep === 3) {
                              setError("Please select a preferred date for your consultation.");
                            } else if (formStep === 4) {
                              setError("Please detail your core clinical symptom / main complaint.");
                            } else {
                              setError("Please fill out this step's required inputs before proceeding.");
                            }
                            return;
                          }
                          setFormStep(prev => Math.min(steps.length, prev + 1));
                        }}
                        className="flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-6 py-3.5 rounded-xl text-xs font-bold transition shadow-md shadow-teal-700/10 cursor-pointer active:scale-95"
                      >
                        <span>Next Step</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        id="booking_submit_btn"
                        type="submit"
                        className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-xs px-6 py-3.5 rounded-xl transition shadow-lg shadow-teal-700/15 cursor-pointer active:scale-95"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Request Consult Slot</span>
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          )}

          {/* --- C. MY APPOINTMENTS HISTORY --- */}
          {activeTab === "history" && (
            <div id="patient_history_tab" className="text-left space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 font-display">
                My Consultation History
              </h2>

              {appointments.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-3xl p-16 text-center text-slate-500 bg-slate-50">
                  <Inbox className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-xs font-semibold leading-normal">You do not have any requested appointments registered.</p>
                  <button onClick={() => setActiveTab("book")} className="text-teal-600 font-bold hover:underline text-xs mt-1 cursor-pointer">Book consult now</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((apt) => (
                    <div 
                      key={apt.id} 
                      className="bg-white border border-slate-200 rounded-3xl p-6 hover:shadow-xs transition"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-slate-100">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-base font-bold text-slate-850 font-display">Specialist: {formatDoctorName(doctors.find(d => d.id === apt.doctorId)?.name)}</span>
                            <span className={`text-[10px] font-bold px-2.5 py-1 border rounded-lg uppercase ${
                              apt.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-250" :
                              apt.status === "confirmed" ? "bg-teal-50 text-teal-700 border-teal-250" :
                              apt.status === "rejected" ? "bg-rose-50 text-rose-700 border-rose-250" :
                              "bg-amber-50 text-amber-700 border-amber-250"
                            }`}>
                              {apt.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">Preferred Time: <strong className="font-semibold text-slate-700">{apt.preferredDate} at {apt.preferredTimeSlot}</strong> ({apt.consultationMode})</p>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">Case ID: {apt.id}</span>
                      </div>

                      {/* Diagnostic intake logs */}
                      <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
                        <div>
                          <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Intake Complaint:</span>
                          <p className="text-slate-700 pt-0.5">{apt.medicalInfo.mainComplaint}</p>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-450 uppercase font-bold tracking-wider block">Temperaments profile:</span>
                          <p className="text-slate-750 pt-0.5">Appetite: {apt.homeopathyQuestions.appetite} | Thirst: {apt.homeopathyQuestions.thirstLevel} | Sleep: {apt.homeopathyQuestions.sleepPattern}</p>
                        </div>
                      </div>

                      {/* Doctor notes during complete status */}
                      {apt.status === "completed" && apt.doctorNotes && (
                        <div className="bg-slate-50 border border-slate-150 p-4 rounded-2xl text-xs text-slate-700 mb-4 leading-relaxed">
                          <span className="font-bold text-slate-800 uppercase block mb-1">Clinician Case Notes:</span>
                          "{apt.doctorNotes}"
                        </div>
                      )}

                      {/* Action buttons */}
                      <div className="pt-4 border-t border-slate-100 flex gap-2 flex-wrap justify-end">
                        {apt.status === "confirmed" && (
                          <button
                            id={`history_join_call_${apt.id}`}
                            onClick={() => quickLaunchConsultation(apt)}
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                          >
                            <Video className="w-3.5 h-3.5" />
                            <span>Join Active Consult</span>
                          </button>
                        )}
                        
                        {apt.status === "completed" && prescriptions.some(p => p.appointmentId === apt.id) && (
                          <button
                            id={`btn_view_prescription_${apt.id}`}
                            onClick={() => loadPrescriptionForAppointment(apt.id)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Download dilution Rx</span>
                          </button>
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* --- D. MEDICAL RECORDS CABIN --- */}
          {activeTab === "records" && (
            <div id="patient_records_tab" className="text-left space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 font-display">
                Health Records Locker
              </h2>

              <p className="text-slate-600 text-xs">
                Review blood reports, clinical MRI logs, visual skin rash dermatitis images, and health files uploaded directly during your consultation filings.
              </p>

              {/* Upload thing wrapper */}
              <div 
                className={`border-2 border-dashed rounded-3xl p-8 text-center bg-slate-50 relative ${dragActive ? "border-teal-500" : "border-slate-250"}`}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
              >
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs text-slate-700">Add standalone laboratory result or clinical records:</p>
                
                <label className="text-xs text-teal-600 font-bold hover:underline cursor-pointer block mt-1">
                  <span>Browse PDF or images</span>
                  <input type="file" onChange={handleFileSelect} className="hidden" />
                </label>
              </div>

              {/* Listing all user records in table */}
              <div className="space-y-3 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-450 block">My uploaded files</h3>
                
                {appointments.reduce<any[]>((acc, apt) => [...acc, ...(apt.documents || [])], []).length === 0 ? (
                  <div className="text-center p-8 bg-slate-50 border border-slate-150 rounded-2xl text-slate-500 text-xs font-semibold">
                    No files filed in this locker yet.
                  </div>
                ) : (
                  <div className="overflow-hidden border border-slate-150 rounded-2xl divide-y divide-slate-100 bg-white">
                    {appointments.reduce<any[]>((acc, apt) => [...acc, ...(apt.documents || [])], []).map((file, i) => (
                      <div key={i} className="p-3.5 flex justify-between items-center hover:bg-slate-50 transition text-xs">
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-teal-600" />
                          <div>
                            <span className="font-bold text-slate-800 font-mono block">{file.fileName}</span>
                            <span className="text-[10px] text-slate-500 block">Uploaded on {new Date(file.createdAt).toLocaleDateString()} &bull; Size: {file.fileSize}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full font-mono uppercase">
                            Secure Encrypted
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- E. MY CASE PROFILE --- */}
          {activeTab === "profile" && (
            <div id="patient_profile_tab" className="text-left space-y-6">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 font-display">
                My Homeopathy Case History Profile
              </h2>

              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3 font-display">Intake registration details</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-slate-450 font-semibold block">Full Name:</span>
                      <span className="font-bold text-slate-800">{currentUser?.name}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 font-semibold block">Reg Email Address:</span>
                      <span className="font-mono font-medium text-slate-800">{currentUser?.email}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 font-semibold block">Registered Phone:</span>
                      <span className="font-mono text-slate-800">{currentUser?.phone}</span>
                    </div>
                    <div>
                      <span className="text-slate-450 font-semibold block">Client ID:</span>
                      <span className="font-mono text-slate-800 font-bold">{currentUser?.id}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-xs font-bold text-teal-600 uppercase tracking-widest mb-3">Therapeutic guidelines disclaimer</h3>
                  <p className="text-[11px] text-slate-500 leading-relaxed bg-white border border-slate-150 p-3 rounded-lg">
                    Classical homeopathy focuses on constitutional prescriptions. High potency dilutes (e.g., 200C, 1M) should only be taken exactly according to your registered physician's dosage logs. Ensure a clean palate (no aromatic spices, coffee, camphor) for at least 30 minutes before taking remedies.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* SECURE CALL MODAL CONTAINER */}
      {activeCallAppointment && (
        <ConsultationRoom
          appointment={activeCallAppointment}
          userRole="patient"
          onClose={() => setActiveCallAppointment(null)}
        />
      )}

      {/* COMPREHENSIVE RX LAYOUT MODAL */}
      {activePrescription && (
        <PrescriptionViewer
          prescription={activePrescription}
          onClose={() => setActivePrescription(null)}
        />
      )}

    </div>
  );
};
