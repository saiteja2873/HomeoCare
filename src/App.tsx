import React, { useState, useEffect } from "react";
import { AppProvider, useApp } from "./context/AppContext";
import { Navigation } from "./components/Navigation";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { PatientDashboard } from "./components/PatientDashboard";
import { DoctorDashboard } from "./components/DoctorDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { EmailSimulationBadge } from "./components/EmailSimulationBadge";

function InnerApp() {
  const { currentUser, error, setError } = useApp();
  
  // Pages router: 'landing' | 'auth' | 'dashboard'
  const [activePage, setActivePage] = useState<string>("landing");

  // Allow passing parameters during page routing (like next redirect, chosen doctor, etc.)
  const [extraArgs, setExtraArgs] = useState<any>(null);

  const navigateTo = (pageStr: string, args: any = null) => {
    setActivePage(pageStr);
    setExtraArgs(args);
    // Auto clear error when page transfers
    setError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Keep path active on refresh/changes
  useEffect(() => {
    if (currentUser && activePage === "auth") {
      setActivePage("dashboard");
    }
  }, [currentUser]);

  // Route protection
  useEffect(() => {
    if (activePage === "dashboard" && !currentUser) {
      setActivePage("auth");
    }
  }, [activePage, currentUser]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* 1. Global Navigation Bar */}
      <Navigation onNavigate={navigateTo} activePage={activePage} />

      {/* 2. Main content router */}
      <main className="flex-grow">
        {activePage === "landing" && (
          <LandingPage onNavigate={navigateTo} />
        )}

        {activePage === "auth" && (
          <AuthPage onNavigate={navigateTo} extraArgs={extraArgs} />
        )}

        {activePage === "dashboard" && currentUser && (
          <>
            {currentUser.role === "patient" && <PatientDashboard />}
            {currentUser.role === "doctor" && <DoctorDashboard />}
            {currentUser.role === "admin" && <AdminDashboard />}
          </>
        )}
      </main>

      {/* 3. Footer Bar */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-12 px-6 text-xs mt-auto print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left space-y-1">
            <h3 className="text-white font-bold font-display tracking-tight text-sm">HomeoCare™ Digital</h3>
            <p className="text-slate-500">Corporate medical booking and diagnostic cabinet platforms.</p>
          </div>
          <div className="flex gap-6 font-semibold">
            <button onClick={() => navigateTo("landing")} className="hover:text-white transition">Home</button>
            <button onClick={() => navigateTo("auth")} className="hover:text-white transition">Sign In</button>
            <p className="text-slate-650">© 2026 HomeoCare. Classical Constitutional Dilution protocols strictly vetted.</p>
          </div>
        </div>
      </footer>

      {/* 4. Active Simulated Email Outbox Dispatcher */}
      <EmailSimulationBadge />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <InnerApp />
    </AppProvider>
  );
}
