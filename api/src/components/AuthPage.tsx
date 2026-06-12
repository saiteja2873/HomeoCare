import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  User, 
  LogIn, 
  UserPlus, 
  Stethoscope, 
  Phone, 
  Mail, 
  Lock, 
  Briefcase, 
  Award, 
  MapPin,
  AlertCircle
} from "lucide-react";

interface AuthPageProps {
  onNavigate: (page: string) => void;
  extraArgs?: any;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onNavigate, extraArgs }) => {
  const { login, register, error, setError } = useApp();
  
  // Tabs: 'login' | 'register_patient' | 'register_doctor'
  const [activeSegment, setActiveSegment] = useState<"login" | "patient" | "doctor">("login");
  
  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Generic Reg States
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Patient Extra Reg States
  const [patAge, setPatAge] = useState("");
  const [patGender, setPatGender] = useState("Female");
  const [patCity, setPatCity] = useState("");

  // Doctor Extra Reg States
  const [docQualification, setDocQualification] = useState("");
  const [docSpecialization, setDocSpecialization] = useState("Chronic Diseases");
  const [docExperience, setDocExperience] = useState("");
  const [docAddress, setDocAddress] = useState("");

  const [regSuccess, setRegSuccess] = useState(false);
  const [regSuccessMsg, setRegSuccessMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;
    
    const success = await login(loginEmail, loginPassword);
    if (success) {
      if (extraArgs?.next === "book" && extraArgs?.doctor) {
        onNavigate("dashboard"); // Automatically routed inside App.tsx or dashboard tab
      } else {
        onNavigate("dashboard");
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regPassword || !regName || !regPhone) {
      setError("Please fill all required standard fields.");
      return;
    }

    const payload: any = {
      role: activeSegment,
      email: regEmail,
      password: regPassword,
      name: regName,
      phone: regPhone
    };

    if (activeSegment === "patient") {
      payload.age = Number(patAge) || 30;
      payload.gender = patGender;
      payload.city = patCity;
    } else if (activeSegment === "doctor") {
      payload.qualification = docQualification || "BHMS";
      payload.specialization = docSpecialization;
      payload.experience = Number(docExperience) || 5;
      payload.clinicAddress = docAddress || "HomeoCare Clinic";
    }

    const success = await register(payload);
    if (success) {
      if (activeSegment === "doctor") {
        setRegSuccess(true);
        setRegSuccessMsg("Registration successful! Your doctor profile has been created and sent to the administrator panel. You can log in once reviewed and approved.");
        // Clear doctor inputs
        setRegName("");
        setRegEmail("");
        setRegPhone("");
        setRegPassword("");
        setDocQualification("");
        setDocAddress("");
        setDocExperience("");
      } else {
        // Patient is automatically logged in inside register() call
        onNavigate("dashboard");
      }
    }
  };

  // Demo Credentials Helper
  const fillCredentials = (role: "admin" | "admin_saiteja" | "doctor" | "patient") => {
    if (role === "admin_saiteja") {
      setLoginEmail("saiteja@homeocare.com");
      setLoginPassword("saiteja1234");
    } else if (role === "admin") {
      setLoginEmail("admin@homeocare.com");
      setLoginPassword("admin123");
    } else if (role === "doctor") {
      setLoginEmail("aditya.sen@homeocare.com");
      setLoginPassword("doctor123");
    } else {
      setLoginEmail("patient@gmail.com");
      setLoginPassword("patient123");
    }
    setActiveSegment("login");
  };

  return (
    <div id="auth_page_root" className="min-h-screen flex items-center justify-center py-16 px-4 bg-slate-100 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
        
        {/* Branding header bar */}
        <div className="bg-teal-900 px-6 py-8 text-center text-white relative">
          <div className="absolute inset-x-0 bottom-0 top-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,rgba(13,148,136,0.3),rgba(0,0,0,0))]"></div>
          <h2 className="text-2xl font-bold font-display tracking-tight relative z-10">Welcome to HomeoCare</h2>
          <p className="text-xs text-teal-350/90 mt-1.5 relative z-10 font-medium">Digital Homeopathy Clinical Cabinets</p>
        </div>

        {/* Action segment toggler */}
        <div id="auth_segmented_control" className="flex border-b border-slate-150 p-1.5 bg-slate-50">
          <button
            onClick={() => { setActiveSegment("login"); setRegSuccess(false); }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
              activeSegment === "login" 
                ? "bg-white text-teal-600 shadow-sm border border-slate-150/60" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setActiveSegment("patient"); setRegSuccess(false); }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
              activeSegment === "patient" 
                ? "bg-white text-teal-600 shadow-sm border border-slate-150/60" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Patient Sign Up
          </button>
          <button
            onClick={() => { setActiveSegment("doctor"); setRegSuccess(false); }}
            className={`flex-1 text-center py-2 text-xs font-bold rounded-lg cursor-pointer transition ${
              activeSegment === "doctor" 
                ? "bg-white text-teal-600 shadow-sm border border-slate-150/60" 
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Doctor Apply
          </button>
        </div>

        <div className="p-7 sm:p-9">
          {error && (
            <div id="auth_error_alert" className="mb-5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl p-3.5 flex gap-2 items-center">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <p className="font-semibold leading-relaxed text-left">{error}</p>
            </div>
          )}

          {regSuccess && (
            <div id="auth_success_alert" className="mb-5 bg-teal-50 border border-teal-200 text-teal-800 text-xs rounded-xl p-4 text-left">
              <p className="font-bold mb-1">Doctor Request Submitted</p>
              <p className="leading-relaxed text-slate-600">{regSuccessMsg}</p>
            </div>
          )}

          {/* 1. SIGN IN FORM */}
          {activeSegment === "login" && (
            <form id="auth_login_form" onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-left">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    id="login_email_input"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:border-teal-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 text-left">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    id="login_password_input"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs pl-10 pr-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50/50 focus:border-teal-500 outline-none transition"
                  />
                </div>
              </div>

              <button
                id="login_submit_btn"
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-md shadow-teal-700/10 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Submit Sign In</span>
              </button>
            </form>
          )}

          {/* 2. PATIENT REGISTRATION */}
          {activeSegment === "patient" && (
            <form id="auth_patient_form" onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 text-left">Full Name *</label>
                <input
                  id="pat_reg_name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Alice Cooper"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-teal-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 text-left">Email *</label>
                  <input
                    id="pat_reg_email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="alice@gmail.com"
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-teal-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 text-left">Phone *</label>
                  <input
                    id="pat_reg_phone"
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 438-1920"
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-teal-500 outline-none transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 text-left">Age</label>
                  <input
                    id="pat_reg_age"
                    type="number"
                    value={patAge}
                    onChange={(e) => setPatAge(e.target.value)}
                    placeholder="30"
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 text-left">Gender</label>
                  <select
                    id="pat_reg_gender"
                    value={patGender}
                    onChange={(e) => setPatGender(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1 text-left">City</label>
                  <input
                    id="pat_reg_city"
                    type="text"
                    value={patCity}
                    onChange={(e) => setPatCity(e.target.value)}
                    placeholder="Austin"
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 text-left">Create Password *</label>
                <input
                  id="pat_reg_password"
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-teal-500 outline-none transition"
                />
              </div>

              <button
                id="patient_submit_btn"
                type="submit"
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md shadow-teal-700/10 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Patient Account</span>
              </button>
            </form>
          )}

          {/* 3. DOCTOR REGISTRATION & APPLICATION */}
          {activeSegment === "doctor" && (
            <form id="auth_doctor_form" onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 text-left">Doctor Name *</label>
                <input
                  id="doc_reg_name"
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Dr. Samantha Jones"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-teal-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 text-left">Qualification *</label>
                  <input
                    id="doc_reg_qualification"
                    type="text"
                    required
                    value={docQualification}
                    onChange={(e) => setDocQualification(e.target.value)}
                    placeholder="BHMS, MD (Homeopathy)"
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-teal-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 text-left">Experience (Yrs) *</label>
                  <input
                    id="doc_reg_experience"
                    type="number"
                    required
                    value={docExperience}
                    onChange={(e) => setDocExperience(e.target.value)}
                    placeholder="8"
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-teal-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 text-left">Specialization *</label>
                <select
                  id="doc_reg_specialization"
                  value={docSpecialization}
                  onChange={(e) => setDocSpecialization(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-teal-500 outline-none transition"
                >
                  <option value="Chronic Diseases & Immunology">Chronic Diseases & Immunology</option>
                  <option value="Pediatric & Family Constitutional Care">Pediatric & Family Constitutional Care</option>
                  <option value="Allergies, Hair, and Skin Excellence">Allergies, Hair, and Skin Excellence</option>
                  <option value="Anxiety, Sleep, & Neurological Support">Anxiety, Sleep, & Neurological Support</option>
                  <option value="General constitutional Homeopathy">General constitutional Homeopathy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1 text-left">Clinic Address *</label>
                <input
                  id="doc_reg_address"
                  type="text"
                  required
                  value={docAddress}
                  onChange={(e) => setDocAddress(e.target.value)}
                  placeholder="101 Wellness Lane, New York, NY"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-teal-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 text-left">Email Address *</label>
                  <input
                    id="doc_reg_email"
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="dr.samantha@gmail.com"
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-teal-500 outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 text-left">Phone Number *</label>
                  <input
                    id="doc_reg_phone"
                    type="text"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 (555) 789-1092"
                    className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-teal-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1 text-left">Secret Password *</label>
                <input
                  id="doc_reg_password"
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs px-3 py-2 border border-slate-200 bg-slate-50 rounded-xl focus:border-teal-500 outline-none transition"
                />
              </div>

              <p className="text-[10px] text-slate-450 leading-normal text-left">
                * Note: Doctor accounts will reside in "Reviewing" state. Clinical credentials must be vetted by administrators before profile enters search listings.
              </p>

              <button
                id="doc_submit_btn"
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer mt-2"
              >
                <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
                <span>Submit Doctor Application</span>
              </button>
            </form>
          )}

          {/* Developer quick session launcher */}
          <div className="mt-8 pt-6 border-t border-slate-150 text-left">
            <span className="block text-[10px] hover:scale-95 text-slate-450 uppercase font-bold tracking-widest mb-3">
              Developer Quick Launcher (Bypass Login)
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                id="launcher_patient_btn"
                onClick={() => fillCredentials("patient")}
                className="bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-150 rounded-lg px-3 py-1.5 text-[11px] font-bold cursor-pointer"
              >
                Launch Patient Demo
              </button>
              <button
                id="launcher_doctor_btn"
                onClick={() => fillCredentials("doctor")}
                className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-150 rounded-lg px-3 py-1.5 text-[11px] font-bold cursor-pointer"
              >
                Launch Doctor Demo
              </button>
              <button
                id="launcher_admin_saiteja_btn"
                onClick={() => fillCredentials("admin_saiteja")}
                className="bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-150 rounded-lg px-3 py-1.5 text-[11px] font-bold cursor-pointer"
              >
                Launch Saiteja Admin
              </button>
              <button
                id="launcher_admin_btn"
                onClick={() => fillCredentials("admin")}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 rounded-lg px-3 py-1.5 text-[11px] font-bold cursor-pointer"
              >
                Launch Admin Panel
              </button>
            </div>
            {activeSegment === "login" && (
              <p className="text-[10px] text-slate-400 mt-2">
                Clicking will fill demo credentials. Press standard 'Submit Sign In' to enter the corresponding portal.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
