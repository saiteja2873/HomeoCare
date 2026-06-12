import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User, 
  Appointment, 
  Prescription, 
  Notification, 
  DoctorAvailability, 
  UploadedDocument,
  DoctorReview
} from "../types";

interface AppContextType {
  currentUser: User | null;
  doctors: any[];
  allAdminDoctors: any[];
  appointments: Appointment[];
  prescriptions: Prescription[];
  notifications: Notification[];
  emailLogs: any[];
  adminStats: any;
  loading: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: any) => Promise<boolean>;
  logout: () => void;
  setError: (err: string | null) => void;
  
  bookAppointment: (payload: any) => Promise<boolean>;
  updateAppointmentStatus: (id: string, status: string, extra?: any) => Promise<boolean>;
  addPrescription: (appointmentId: string, payload: any) => Promise<boolean>;
  uploadDocument: (fileName: string, fileSize: string, fileType: string, appointmentId?: string) => Promise<UploadedDocument | null>;
  saveAvailability: (doctorId: string, availableDays: string[], availableSlots: string[], holidays: string[]) => Promise<boolean>;
  getAvailability: (doctorId: string) => Promise<DoctorAvailability | null>;
  addReview: (doctorId: string, rating: number, text: string) => Promise<boolean>;
  markNotificationsRead: () => Promise<void>;
  approveDoctor: (doctorId: string) => Promise<boolean>;
  rejectDoctor: (doctorId: string) => Promise<boolean>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("homeocare_user");
    return saved ? JSON.parse(saved) : null;
  });
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [allAdminDoctors, setAllAdminDoctors] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [emailLogs, setEmailLogs] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);

  const setError = (err: string | null) => {
    setErrorState(err);
    if (err) {
      setTimeout(() => setErrorState(null), 5000);
    }
  };

  // Sync session
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("homeocare_user", JSON.stringify(currentUser));
      refreshAll();
    } else {
      localStorage.removeItem("homeocare_user");
    }
  }, [currentUser]);

  // Pull emails log regularly in background
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEmailLogs();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const fetchJsonSafely = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return null;
      const contentType = res.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        return null;
      }
      return await res.json();
    } catch (err) {
      return null;
    }
  };

  const fetchEmailLogs = async () => {
    const logs = await fetchJsonSafely("/api/email-simulation-log");
    if (logs) {
      setEmailLogs(logs);
    }
  };

  const refreshAll = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // 1. Doctors
      const docs = await fetchJsonSafely("/api/doctors");
      if (docs) setDoctors(docs);

      // 2. Appointments based on role
      const apts = await fetchJsonSafely(`/api/appointments?userId=${currentUser.id}&role=${currentUser.role}`);
      if (apts) setAppointments(apts);

      // 3. Prescriptions based on role
      const rx = await fetchJsonSafely(`/api/prescriptions?userId=${currentUser.id}&role=${currentUser.role}`);
      if (rx) setPrescriptions(rx);

      // 4. Notifications
      const nots = await fetchJsonSafely(`/api/notifications?userId=${currentUser.id}`);
      if (nots) setNotifications(nots);

      // 5. Admin specific
      if (currentUser.role === "admin") {
        const adminDocs = await fetchJsonSafely("/api/admin/doctors");
        if (adminDocs) setAllAdminDoctors(adminDocs);

        const stats = await fetchJsonSafely("/api/admin/stats");
        if (stats) setAdminStats(stats);
      }
      
      await fetchEmailLogs();
    } catch (err: any) {
      console.error("Refresh error", err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed");
        return false;
      }
      setCurrentUser(data.user);
      setError(null);
      return true;
    } catch (err: any) {
      setError("Server connection failure");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload: any): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed");
        return false;
      }
      setError(null);
      if (payload.role === "patient") {
        // Auto log in patient
        await login(payload.email, payload.password);
      }
      return true;
    } catch (err) {
      setError("Server connection failure");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setDoctors([]);
    setAppointments([]);
    setPrescriptions([]);
    setNotifications([]);
    setAllAdminDoctors([]);
    setAdminStats({});
  };

  const bookAppointment = async (payload: any): Promise<boolean> => {
    if (!currentUser) return false;
    setLoading(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, patientId: currentUser.id })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Booking failed");
        return false;
      }
      await refreshAll();
      return true;
    } catch (e) {
      setError("Booking server error");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: string, extra?: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/appointments/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra })
      });
      if (res.ok) {
        await refreshAll();
        return true;
      }
      const data = await res.json();
      setError(data.error || "Status update failed");
      return false;
    } catch (e) {
      setError("Server error during update");
      return false;
    }
  };

  const addPrescription = async (appointmentId: string, payload: any): Promise<boolean> => {
    try {
      const res = await fetch(`/api/appointments/${appointmentId}/prescription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await refreshAll();
        return true;
      }
      const data = await res.json();
      setError(data.error || "Prescription filing failed");
      return false;
    } catch (e) {
      setError("Filing server error");
      return false;
    }
  };

  const uploadDocument = async (fileName: string, fileSize: string, fileType: string, appointmentId?: string): Promise<UploadedDocument | null> => {
    if (!currentUser) return null;
    try {
      const res = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          appointmentId,
          fileName,
          fileType,
          fileUrl: "#", // Local mock URL inside context
          fileSize
        })
      });
      if (res.ok) {
        const data = await res.json();
        await refreshAll();
        return data.document;
      }
      return null;
    } catch (e) {
      console.error(e);
      setError("Document upload simulation failed");
      return null;
    }
  };

  const saveAvailability = async (doctorId: string, availableDays: string[], availableSlots: string[], holidays: string[]): Promise<boolean> => {
    try {
      const res = await fetch(`/api/doctors/${doctorId}/availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availableDays, availableSlots, holidays })
      });
      if (res.ok) {
        await refreshAll();
        return true;
      }
      return false;
    } catch (e) {
      setError("Availability update failed");
      return false;
    }
  };

  const getAvailability = async (doctorId: string): Promise<DoctorAvailability | null> => {
    try {
      const res = await fetch(`/api/doctors/${doctorId}/availability`);
      if (res.ok) {
        return await res.json();
      }
      return null;
    } catch (e) {
      return null;
    }
  };

  const addReview = async (doctorId: string, rating: number, text: string): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorId,
          patientName: currentUser.name,
          rating,
          reviewText: text
        })
      });
      if (res.ok) {
        await refreshAll();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const markNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id })
      });
      if (res.ok) {
        // Optimistic
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const approveDoctor = async (doctorId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/doctors/${doctorId}/approve`, { method: "POST" });
      if (res.ok) {
        await refreshAll();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  const rejectDoctor = async (doctorId: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/admin/doctors/${doctorId}/reject`, { method: "POST" });
      if (res.ok) {
        await refreshAll();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      doctors,
      allAdminDoctors,
      appointments,
      prescriptions,
      notifications,
      emailLogs,
      adminStats,
      loading,
      error,
      login,
      register,
      logout,
      setError,
      bookAppointment,
      updateAppointmentStatus,
      addPrescription,
      uploadDocument,
      saveAvailability,
      getAvailability,
      addReview,
      markNotificationsRead,
      approveDoctor,
      rejectDoctor,
      refreshAll
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside an AppProvider");
  }
  return context;
};
