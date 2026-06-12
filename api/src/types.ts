export type UserRole = "patient" | "doctor" | "admin";

export interface User {
  id: string;
  email: string;
  password?: string; // Hashed password or simply stored key for mock auth
  role: UserRole;
  name: string;
  phone: string;
  isApproved: boolean; // Applicable for doctors, default false, needs admin approval. For patients/admins, true.
  createdAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  age: number;
  gender: string;
  height: string;
  weight: string;
  maritalStatus: string;
  occupation: string;
  address: string;
  city: string;
  state: string;
  country: string;
}

export interface DoctorProfile {
  id: string;
  userId: string;
  qualification: string;
  specialization: string;
  experience: number; // in years
  clinicAddress: string;
  bio?: string;
  rating: number; // calculated from reviews
  ratingsCount: number;
}

export type AppointmentStatus = "pending" | "confirmed" | "rejected" | "completed";
export type ConsultationMode = "video" | "audio" | "in-person";

export interface MedicalInformation {
  mainComplaint: string;
  symptoms: string;
  durationOfProblem: string;
  currentMedications: string;
  previousTreatments: string;
  allergies: string;
  chronicDiseases: string;
  familyMedicalHistory: string;
}

export interface HomeopathyQuestions {
  appetite: string;
  sleepPattern: string;
  thirstLevel: string;
  stressLevel: string;
  emotionalState: string;
  foodPreferences: string;
  sensitivityToWeather: string;
}

export interface UploadedDocument {
  id: string;
  userId: string;
  appointmentId?: string;
  fileName: string;
  fileType: string; // "pdf" | "jpg" | "png"
  fileUrl: string;
  fileSize: string; // e.g. "1.2 MB"
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string; // userId of patient
  doctorId: string; // userId of doctor
  doctorName?: string; // Doctor's full name
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  
  // Personal inputs
  age: number;
  gender: string;
  height: string;
  weight: string;
  maritalStatus: string;
  occupation: string;
  address: string;
  city: string;
  state: string;
  country: string;

  // Appointment config
  preferredDate: string;
  preferredTimeSlot: string;
  consultationMode: ConsultationMode;

  // Questionnaires
  medicalInfo: MedicalInformation;
  homeopathyQuestions: HomeopathyQuestions;
  
  // Documents
  documents: UploadedDocument[];

  // Workflow Status
  status: AppointmentStatus;
  doctorNotes?: string;
  rescheduleReason?: string;
  createdAt: string;
}

export interface MedicineEntry {
  name: string;
  dosage: string; // e.g., "30C, 4 pills"
  duration: string; // e.g., "7 days"
  instructions: string; // e.g., "Morning and night, empty stomach"
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialization: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  date: string;
  medicines: MedicineEntry[];
  generalInstructions?: string;
  createdAt: string;
}

export interface DoctorAvailability {
  doctorId: string;
  availableDays: string[]; // e.g. ["Monday", "Wednesday", "Friday"]
  availableSlots: string[]; // e.g. ["10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"]
  holidays: string[]; // e.g. ["2026-06-25"]
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning";
  isRead: boolean;
  createdAt: string;
}

export interface DoctorReview {
  id: string;
  doctorId: string;
  patientName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}
