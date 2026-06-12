import express from "express";
import { createServer as createViteServer } from "vite";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import "dotenv/config";
import { Server as SocketServer } from "socket.io";
import { createServer as createHttpServer } from "http";
import { 
  User, 
  Appointment, 
  DoctorAvailability, 
  Notification, 
  Prescription, 
  DoctorReview 
} from "./src/types";

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const SALT_ROUNDS = 10;

// Password hashing helpers
async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

app.use(express.json({ limit: "50mb" }));

// MongoDB Connection Parameters
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI environment variable is not set");
}

let mongoClient: MongoClient | null = null;
let mongoDb: any = null;

async function connectMongoAndBootstrap() {
  console.log("[MongoDB] Connecting to MongoDB...");
  try {
    mongoClient = new MongoClient(MONGODB_URI!);
    await mongoClient.connect();
    mongoDb = mongoClient.db();
    console.log("[MongoDB] Connected successfully to DB: homeocare");

    // Check if database has data, if not seed with initial data
    const usersCount = await mongoDb.collection("users").countDocuments();
    if (usersCount === 0) {
      console.log("[MongoDB] Database is empty. Seeding with initial data...");
      const initialData = await getInitialMockData();
      const dbKeys = [
        "users",
        "doctorProfiles",
        "patientProfiles",
        "availabilities",
        "appointments",
        "prescriptions",
        "reviews",
        "notifications"
      ];
      for (const key of dbKeys) {
        const list = (initialData as any)[key] || [];
        if (list.length > 0) {
          await mongoDb.collection(key).insertMany(list);
          console.log(`[MongoDB] Seeded ${list.length} records into "${key}" collection`);
        }
      }
    }
    console.log("[MongoDB] Database ready.");
  } catch (error) {
    console.error("[MongoDB] Connection failed:", error);
    throw error;
  }
}

// Helper to get collection data from MongoDB
async function getCollection(collectionName: string) {
  if (!mongoDb) {
    throw new Error("MongoDB not connected");
  }
  const docs = await mongoDb.collection(collectionName).find({}).toArray();
  return docs.map((doc: any) => {
    const { _id, ...rest} = doc;
    return rest;
  });
}

// Helper to update a collection in MongoDB
async function updateCollection(collectionName: string, data: any[]) {
  if (!mongoDb) {
    throw new Error("MongoDB not connected");
  }
  await mongoDb.collection(collectionName).deleteMany({});
  if (data.length > 0) {
    await mongoDb.collection(collectionName).insertMany(JSON.parse(JSON.stringify(data)));
  }
}

// Load all data from MongoDB
async function loadDB() {
  if (!mongoDb) {
    throw new Error("MongoDB not connected");
  }
  
  const db: any = {
    users: await getCollection("users"),
    doctorProfiles: await getCollection("doctorProfiles"),
    patientProfiles: await getCollection("patientProfiles"),
    availabilities: await getCollection("availabilities"),
    appointments: await getCollection("appointments"),
    prescriptions: await getCollection("prescriptions"),
    reviews: await getCollection("reviews"),
    notifications: await getCollection("notifications")
  };
  
  return db;
}

// Save all data to MongoDB
async function saveDB(data: any) {
  if (!mongoDb) {
    throw new Error("MongoDB not connected");
  }
  
  const collections = [
    "users",
    "doctorProfiles",
    "patientProfiles",
    "availabilities",
    "appointments",
    "prescriptions",
    "reviews",
    "notifications"
  ];
  
  for (const collectionName of collections) {
    if (data[collectionName]) {
      await updateCollection(collectionName, data[collectionName]);
    }
  }
}

// Simulated or Live Resend Email Log
interface EmailLog {
  id: string;
  to: string;
  subject: string;
  html: string;
  sentAt: string;
  status: "simulated" | "sent" | "failed";
  error?: string;
}
let emailLogs: EmailLog[] = [];

async function sendSimulatedEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM || "onboarding@resend.dev";
  const finalFrom = `HomeoCare <${fromEmail}>`;

  const log: EmailLog = {
    id: `email_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    to,
    subject,
    html,
    sentAt: new Date().toISOString(),
    status: apiKey ? "sent" : "simulated"
  };

  if (apiKey) {
    try {
      console.log(`[Resend Live] Attempting to dispatch email to ${to} via Resend...`);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: finalFrom,
          to,
          subject,
          html
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        log.status = "failed";
        log.error = `HTTP ${response.status}: ${errText}`;
        console.error(`[Resend Live Error] Failed to send email:`, errText);
      } else {
        const resData = await response.json();
        console.log(`[Resend Live Success] Successfully dispatched email. ID:`, resData.id);
      }
    } catch (fetchErr: any) {
      log.status = "failed";
      log.error = fetchErr?.message || String(fetchErr);
      console.error(`[Resend Live Exception]`, fetchErr);
    }
  } else {
    console.log(`[Resend simulated email to ${to}] Subject: "${subject}"`);
  }

  emailLogs.unshift(log);
}

// Base Initial Mock Data
// Note: All passwords in mock data are pre-hashed with bcrypt
// Original passwords (for testing): saiteja1234, admin123, doctor123, patient123
async function getInitialMockData() {
  const users: User[] = [
    {
      id: "admin_saiteja",
      email: "saiteja@homeocare.com",
      password: await hashPassword("saiteja1234"),
      role: "admin",
      name: "Saiteja Admin",
      phone: "+1 (555) 543-2100",
      isApproved: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "admin_1",
      email: "admin@homeocare.com",
      password: await hashPassword("admin123"),
      role: "admin",
      name: "Dr. Catherine Vance (Director)",
      phone: "+1 (555) 019-2834",
      isApproved: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "doc_aditya",
      email: "aditya.sen@homeocare.com",
      password: await hashPassword("doctor123"),
      role: "doctor",
      name: "Dr. Aditya Sen",
      phone: "+1 (555) 782-9901",
      isApproved: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "doc_meera",
      email: "meera.nair@homeocare.com",
      password: await hashPassword("doctor123"),
      role: "doctor",
      name: "Dr. Meera Nair",
      phone: "+1 (555) 234-5678",
      isApproved: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "doc_robert",
      email: "robert.vance@homeocare.com",
      password: await hashPassword("doctor123"),
      role: "doctor",
      name: "Dr. Robert Vance",
      phone: "+1 (555) 876-5432",
      isApproved: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "doc_sharma",
      email: "priya.sharma@homeocare.com",
      password: await hashPassword("doctor123"),
      role: "doctor",
      name: "Dr. Priya Sharma",
      phone: "+1 (555) 901-2345",
      isApproved: false, // Pending approval
      createdAt: new Date().toISOString()
    },
    {
      id: "patient_alice",
      email: "patient@gmail.com",
      password: await hashPassword("patient123"),
      role: "patient",
      name: "Alice Cooper",
      phone: "+1 (555) 432-1098",
      isApproved: true,
      createdAt: new Date().toISOString()
    }
  ];

  const doctorProfiles = [
    {
      id: "dp_aditya",
      userId: "doc_aditya",
      qualification: "MD (Homeopathy), BHMS (Lond)",
      specialization: "Chronic Diseases & Immunology",
      experience: 15,
      clinicAddress: "Apex Homoeo Wellness Center, Suite 402, Boston, MA",
      bio: "An internationally acclaimed classical homeopath specializing in auto-immune conditions, gut issues, and complex respiratory diagnoses with over 15 years of precise clinical expertise.",
      rating: 4.8,
      ratingsCount: 24
    },
    {
      id: "dp_meera",
      userId: "doc_meera",
      qualification: "BHMS, MSc (Constitutional Medicine)",
      specialization: "Pediatric & Family Constitutional Care",
      experience: 10,
      clinicAddress: "Serene Homeopathy Clinic, 12 Garden Grove, Austin, TX",
      bio: "Dedicated to prescribing tailored constitutional treatments for developmental issues, behavioral support, colic, skin irritations, and multi-generational infant-to-elderly homeopathic treatment plans.",
      rating: 4.9,
      ratingsCount: 31
    },
    {
      id: "dp_robert",
      userId: "doc_robert",
      qualification: "BHMS, Dip. Trichology & Dermatology",
      specialization: "Allergies, Hair, and Skin Excellence",
      experience: 8,
      clinicAddress: "Vance Aesthetic Homeo Care, 909 Broadway, New York, NY",
      bio: "Combining homeopathic remedies with dermal wellness science to deliver holistic, side-effect-free therapy for psoriasis, eczema, alopecia, and hyper-allergic immune profiles.",
      rating: 4.7,
      ratingsCount: 18
    },
    {
      id: "dp_sharma",
      userId: "doc_sharma",
      qualification: "BHMS, Postgraduate Diploma in Stress & Anxiety Care",
      specialization: "Anxiety, Sleep, & Neurological Support",
      experience: 5,
      clinicAddress: "Sharma Mind & Body Homeo Care, 54 Hilltop Blvd, Seattle, WA",
      bio: "Focuses on neurological regulation, systemic fatigue, psychosomatic ailments, migraine relief, and stress-adaptive clinical consulting using modern and dynamic homeopathy.",
      rating: 0,
      ratingsCount: 0
    }
  ];

  const patientProfiles = [
    {
      id: "pp_alice",
      userId: "patient_alice",
      age: 32,
      gender: "Female",
      height: "5'6\"",
      weight: "135 lbs",
      maritalStatus: "Single",
      occupation: "UX Designer",
      address: "42 Cloud Crescent",
      city: "San Francisco",
      state: "CA",
      country: "USA"
    }
  ];

  const availabilities: DoctorAvailability[] = [
    {
      doctorId: "doc_aditya",
      availableDays: ["Monday", "Wednesday", "Friday"],
      availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
      holidays: []
    },
    {
      doctorId: "doc_meera",
      availableDays: ["Tuesday", "Thursday", "Saturday"],
      availableSlots: ["10:00 AM", "11:00 AM", "12:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM"],
      holidays: []
    },
    {
      doctorId: "doc_robert",
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday"],
      availableSlots: ["01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"],
      holidays: []
    }
  ];

  const appointments: Appointment[] = [
    {
      id: "apt_1",
      patientId: "patient_alice",
      doctorId: "doc_aditya",
      patientName: "Alice Cooper",
      patientEmail: "patient@gmail.com",
      patientPhone: "+1 (555) 432-1098",
      age: 32,
      gender: "Female",
      height: "5'6\"",
      weight: "135 lbs",
      maritalStatus: "Single",
      occupation: "UX Designer",
      address: "42 Cloud Crescent",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      preferredDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 3 days ago
      preferredTimeSlot: "10:00 AM",
      consultationMode: "video",
      medicalInfo: {
        mainComplaint: "Severe, periodic migraine headaches.",
        symptoms: "Throbbing pain on the right side of the head, triggered by bright lights or skipping meals. Nausea during peaks.",
        durationOfProblem: "2 years",
        currentMedications: "Sumatriptan (as-needed, occasionally causes fatigue), Ibuprofen 400mg.",
        previousTreatments: "Allopathic pain killers, routine chiropractic adjustments.",
        allergies: "None known",
        chronicDiseases: "None",
        familyMedicalHistory: "Mother has a history of chronic migraines and sinus congestion."
      },
      homeopathyQuestions: {
        appetite: "Normal, but drops significantly when migraine hits.",
        sleepPattern: "Restless sleep, wakes up around 3 AM feeling mentally hyperactive.",
        thirstLevel: "Low, struggles to drink 1 liter of water standardly.",
        stressLevel: "High stress due to product launch deadlines.",
        emotionalState: "Anxious, easily irritated by clutter and loud environmental noises.",
        foodPreferences: "Desires chocolate and salty potato chips heavily.",
        sensitivityToWeather: "Extremely sensitive to dry winds and cold atmosphere changes."
      },
      documents: [
        {
          id: "doc_mock_1",
          userId: "patient_alice",
          appointmentId: "apt_1",
          fileName: "Brain_MRI_Report.pdf",
          fileType: "application/pdf",
          fileUrl: "#",
          fileSize: "840 KB",
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      status: "completed",
      doctorNotes: "Classic Belladonna 30C profile presentation. Right-sided throbbing pain with hyper-sensitivity to light and sound. Recommended dosage is 4 globules twice daily for 2 weeks on clean palate. Advised small meals every 4 hours to avoid fasting triggers.",
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "apt_2",
      patientId: "patient_alice",
      doctorId: "doc_meera",
      patientName: "Alice Cooper",
      patientEmail: "patient@gmail.com",
      patientPhone: "+1 (555) 432-1098",
      age: 32,
      gender: "Female",
      height: "5'6\"",
      weight: "135 lbs",
      maritalStatus: "Single",
      occupation: "UX Designer",
      address: "42 Cloud Crescent",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 days from now
      preferredTimeSlot: "11:00 AM",
      consultationMode: "video",
      medicalInfo: {
        mainComplaint: "Digestive bloating and occasional skin rashes.",
        symptoms: "Extreme gassiness post starchy foods, small itchy hives on inner forearms that come and go.",
        durationOfProblem: "6 months",
        currentMedications: "Antihistamine pills occasionally.",
        previousTreatments: "Applied hydrocortisone creams localized.",
        allergies: "Slight lactose and dust allergy",
        chronicDiseases: "None",
        familyMedicalHistory: "Father has skin psoriasis."
      },
      homeopathyQuestions: {
        appetite: "Good, but easily bloating.",
        sleepPattern: "Normal sleep, takes 20 mins to fall asleep.",
        thirstLevel: "Moderate, prefers cold drinks.",
        stressLevel: "Moderate.",
        emotionalState: "Generally balanced, but feelings of stagnation.",
        foodPreferences: "Prefers warm foods and spicy curries.",
        sensitivityToWeather: "Prefers warm, humid environments."
      },
      documents: [],
      status: "confirmed",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const prescriptions: Prescription[] = [
    {
      id: "rx_1",
      appointmentId: "apt_1",
      doctorId: "doc_aditya",
      doctorName: "Dr. Aditya Sen",
      doctorSpecialization: "Chronic Diseases & Immunology",
      patientId: "patient_alice",
      patientName: "Alice Cooper",
      patientAge: 32,
      patientGender: "Female",
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      medicines: [
        {
          name: "Belladonna 30C",
          dosage: "4 pills",
          duration: "14 days",
          instructions: "Twice daily, dissolve on tongue 20 minutes before meals"
        },
        {
          name: "Natrum Muriaticum 200C",
          dosage: "4 pills",
          duration: "Single Dose",
          instructions: "Take once on Sunday morning on empty stomach"
        }
      ],
      generalInstructions: "Strictly avoid caffeine, raw onions, and camphoraceous perfumes/ointments during the medicine course as they can antidotalize the dilutions.",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const reviews: DoctorReview[] = [
    {
      id: "rev_1",
      doctorId: "doc_aditya",
      patientName: "Alice Cooper",
      rating: 5,
      reviewText: "Incredible attention to detail during the case history. The migraine attacks have significantly reduced in amplitude and frequency after starting Belladonna. Exceptional classical homeopathic physician!",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "rev_2",
      doctorId: "doc_meera",
      patientName: "Marcus Vance",
      rating: 5,
      reviewText: "Dr. Meera cured my son's chronic eczema where steroids had failed for years. She has our absolute trust.",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  const notifications: Notification[] = [
    {
      id: "not_1",
      userId: "patient_alice",
      title: "Consultation Completed",
      message: "Dr. Aditya Sen has finished your migraine consultation and uploaded your prescription.",
      type: "success",
      isRead: false,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "not_2",
      userId: "patient_alice",
      title: "Appointment Confirmed",
      message: "Dr. Meera Nair has approved your consultation on preferred time slot.",
      type: "success",
      isRead: true,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: "not_3",
      userId: "doc_aditya",
      title: "New Appointment Booked",
      message: "Alice Cooper has booked an appointment for Severe Migraines.",
      type: "info",
      isRead: true,
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];

  return {
    users,
    doctorProfiles,
    patientProfiles,
    availabilities,
    appointments,
    prescriptions,
    reviews,
    notifications
  };
}

// REST APIs
// --- Authentication ---
app.post("/api/auth/register", async (req, res) => {
  const db = await loadDB();
  const { role, email, password, name, phone, ...extra } = req.body;

  if (!email || !password || !name || !phone || !role) {
    return res.status(400).json({ error: "Required fields missing" });
  }

  // Check unique email
  if (db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "Email already registered" });
  }

  const userId = `u_${Date.now()}`;
  const hashedPassword = await hashPassword(password);
  const newUser: User = {
    id: userId,
    email,
    password: hashedPassword, // Store hashed password
    role,
    name,
    phone,
    isApproved: role === "patient" || role === "admin" ? true : false, // Doctors require admin approval
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);

  if (role === "patient") {
    const defaultProfile = {
      id: `pp_${Date.now()}`,
      userId,
      age: Number(extra.age) || 30,
      gender: extra.gender || "Not specified",
      height: extra.height || "-",
      weight: extra.weight || "-",
      maritalStatus: extra.maritalStatus || "-",
      occupation: extra.occupation || "-",
      address: extra.address || "-",
      city: extra.city || "-",
      state: extra.state || "-",
      country: extra.country || "-"
    };
    db.patientProfiles.push(defaultProfile);
  } else if (role === "doctor") {
    const defaultDoctorProfile = {
      id: `dp_${Date.now()}`,
      userId,
      qualification: extra.qualification || "BHMS",
      specialization: extra.specialization || "General Homeopathy",
      experience: Number(extra.experience) || 1,
      clinicAddress: extra.clinicAddress || "HomeoCare Clinic",
      bio: extra.bio || "Classical homeopath treating custom cases safely.",
      rating: 0,
      ratingsCount: 0
    };
    db.doctorProfiles.push(defaultDoctorProfile);

    // Give default availability
    db.availabilities.push({
      doctorId: userId,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
      holidays: []
    });

    // Notify Admins about new doctor sign up
    db.users.forEach((u: any) => {
      if (u.role === "admin") {
        db.notifications.push({
          id: `not_reg_${Date.now()}`,
          userId: u.id,
          title: "New Doctor Registration",
          message: `${name} has registered and is pending approval.`,
          type: "warning",
          isRead: false,
          createdAt: new Date().toISOString()
        });
      }
    });
  }

  await saveDB(db);
  const { password: _, ...safeUser } = newUser;
  res.json({ success: true, user: safeUser });
});

app.post("/api/auth/login", async (req, res) => {
  const db = await loadDB();
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Compare hashed password
  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  if (user.role === "doctor" && !user.isApproved) {
    return res.status(403).json({ error: "Your doctor account is registered but pending Admin approval." });
  }

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
});

// --- Doctors endpoint ---
app.get("/api/doctors", async (req, res) => {
  const db = await loadDB();
  const approvedDoctors = db.users.filter((u: any) => u.role === "doctor" && u.isApproved);
  
  const detailedDoctors = approvedDoctors.map((doc: any) => {
    const profile = db.doctorProfiles.find((dp: any) => dp.userId === doc.id) || {};
    return {
      ...doc,
      profile
    };
  });

  res.json(detailedDoctors);
});

// Admin gets all doctors (including pending)
app.get("/api/admin/doctors", async (req, res) => {
  const db = await loadDB();
  const allDocs = db.users.filter((u: any) => u.role === "doctor").map((doc: any) => {
    const profile = db.doctorProfiles.find((dp: any) => dp.userId === doc.id) || {};
    return {
      ...doc,
      profile
    };
  });
  res.json(allDocs);
});

// Admin approves/rejects doctor
app.post("/api/admin/doctors/:id/approve", async (req, res) => {
  const db = await loadDB();
  const userIndex = db.users.findIndex((u: any) => u.id === req.params.id && u.role === "doctor");
  if (userIndex === -1) {
    return res.status(404).json({ error: "Doctor not found" });
  }

  db.users[userIndex].isApproved = true;
  
  // Add notification to doctor
  db.notifications.push({
    id: `not_approve_${Date.now()}`,
    userId: req.params.id,
    title: "Account Approved",
    message: "Congratulations! Your HomeoCare Doctor account has been approved by our administrators. You can now configure appointments and availability.",
    type: "success",
    isRead: false,
    createdAt: new Date().toISOString()
  });

  await saveDB(db);
  res.json({ success: true, doctor: db.users[userIndex] });
});

app.post("/api/admin/doctors/:id/reject", async (req, res) => {
  const db = await loadDB();
  const doctorId = req.params.id;
  
  // Find the doctor
  const userIndex = db.users.findIndex((u: any) => u.id === doctorId && u.role === "doctor");
  if (userIndex === -1) {
    return res.status(404).json({ error: "Doctor not found" });
  }

  // Remove the doctor user account
  const removedDoctor = db.users.splice(userIndex, 1)[0];
  
  // Remove associated doctor profile
  db.doctorProfiles = db.doctorProfiles.filter((dp: any) => dp.userId !== doctorId);
  
  // Remove associated availabilities
  db.availabilities = db.availabilities.filter((a: any) => a.doctorId !== doctorId);
  
  // Remove associated notifications
  db.notifications = db.notifications.filter((n: any) => n.userId !== doctorId);
  
  // Note: Keep appointments for record-keeping purposes
  
  await saveDB(db);
  res.json({ success: true, message: "Doctor application rejected and removed", doctor: removedDoctor });
});

app.post("/api/admin/doctors/:id/revoke", async (req, res) => {
  const db = await loadDB();
  const doctorId = req.params.id;
  
  // Find the doctor
  const userIndex = db.users.findIndex((u: any) => u.id === doctorId && u.role === "doctor");
  if (userIndex === -1) {
    return res.status(404).json({ error: "Doctor not found" });
  }

  // Set isApproved to false (move back to pending)
  db.users[userIndex].isApproved = false;
  
  // Add notification to doctor
  db.notifications.push({
    id: `not_revoke_${Date.now()}`,
    userId: doctorId,
    title: "License Revoked",
    message: "Your HomeoCare Doctor license has been revoked by an administrator. Your account is now pending re-approval.",
    type: "warning",
    isRead: false,
    createdAt: new Date().toISOString()
  });
  
  await saveDB(db);
  res.json({ success: true, message: "Doctor license revoked - moved to pending status", doctor: db.users[userIndex] });
});

// --- Get Doctor availability ---
app.get("/api/doctors/:id/availability", async (req, res) => {
  const db = await loadDB();
  const avail = db.availabilities.find((a: any) => a.doctorId === req.params.id);
  if (!avail) {
    return res.json({
      doctorId: req.params.id,
      availableDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      availableSlots: ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM"],
      holidays: []
    });
  }
  res.json(avail);
});

// --- Update Doctor availability ---
app.post("/api/doctors/:id/availability", async (req, res) => {
  const db = await loadDB();
  const { availableDays, availableSlots, holidays } = req.body;
  const index = db.availabilities.findIndex((a: any) => a.doctorId === req.params.id);

  if (index !== -1) {
    db.availabilities[index] = { doctorId: req.params.id, availableDays, availableSlots, holidays };
  } else {
    db.availabilities.push({ doctorId: req.params.id, availableDays, availableSlots, holidays });
  }

  await saveDB(db);
  res.json({ success: true });
});

// --- Appointments Endpoints ---
app.get("/api/appointments", async (req, res) => {
  const db = await loadDB();
  const { userId, role } = req.query;

  let appointmentsList = db.appointments;
  if (role === "patient") {
    appointmentsList = db.appointments.filter((a: any) => a.patientId === userId);
  } else if (role === "doctor") {
    appointmentsList = db.appointments.filter((a: any) => a.doctorId === userId);
  }

  // Populate doctor name if not present
  appointmentsList = appointmentsList.map((apt: any) => {
    if (!apt.doctorName && apt.doctorId) {
      const doctor = db.users.find((u: any) => u.id === apt.doctorId);
      if (doctor) {
        apt.doctorName = doctor.name;
      }
    }
    return apt;
  });

  // Sort by created or date
  appointmentsList.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));

  res.json(appointmentsList);
});

// Migration endpoint: Add doctorName to all existing appointments
app.post("/api/admin/migrate-appointments", async (req, res) => {
  try {
    const db = await loadDB();
    
    // Update all appointments
    let updated = 0;
    for (const apt of db.appointments) {
      if (!apt.doctorName && apt.doctorId) {
        const doctor = db.users.find((u: any) => u.id === apt.doctorId);
        if (doctor) {
          apt.doctorName = doctor.name;
          updated++;
        }
      }
    }
    
    // Save back to MongoDB
    await saveDB(db);
    
    res.json({ success: true, message: `Updated ${updated} appointments with doctor names` });
  } catch (err) {
    console.error("Migration error:", err);
    res.status(500).json({ error: "Migration failed" });
  }
});

app.post("/api/appointments", async (req, res) => {
  const db = await loadDB();
  const aptData = req.body;

  const doctorUser = db.users.find((u: any) => u.id === aptData.doctorId);
  const patientUser = db.users.find((u: any) => u.id === aptData.patientId);

  if (!doctorUser || !patientUser) {
    return res.status(404).json({ error: "Doctor or Patient session invalid" });
  }

  // Check double-booking
  const exists = db.appointments.some((a: any) => 
    a.doctorId === aptData.doctorId && 
    a.preferredDate === aptData.preferredDate && 
    a.preferredTimeSlot === aptData.preferredTimeSlot &&
    a.status === "confirmed"
  );

  if (exists) {
    return res.status(400).json({ error: "This time slot has already been booked of the doctor. Please select another slot." });
  }

  const appointmentId = `apt_${Date.now()}`;
  const newApt: Appointment = {
    id: appointmentId,
    patientId: aptData.patientId,
    doctorId: aptData.doctorId,
    doctorName: doctorUser.name,
    patientName: patientUser.name,
    patientEmail: patientUser.email,
    patientPhone: patientUser.phone,

    age: Number(aptData.age),
    gender: aptData.gender,
    height: aptData.height,
    weight: aptData.weight,
    maritalStatus: aptData.maritalStatus,
    occupation: aptData.occupation,
    address: aptData.address,
    city: aptData.city,
    state: aptData.state,
    country: aptData.country,

    preferredDate: aptData.preferredDate,
    preferredTimeSlot: aptData.preferredTimeSlot,
    consultationMode: aptData.consultationMode,

    medicalInfo: {
      mainComplaint: aptData.medicalInfo.mainComplaint || "General consultation",
      symptoms: aptData.medicalInfo.symptoms || "",
      durationOfProblem: aptData.medicalInfo.durationOfProblem || "",
      currentMedications: aptData.medicalInfo.currentMedications || "",
      previousTreatments: aptData.medicalInfo.previousTreatments || "",
      allergies: aptData.medicalInfo.allergies || "None",
      chronicDiseases: aptData.medicalInfo.chronicDiseases || "None",
      familyMedicalHistory: aptData.medicalInfo.familyMedicalHistory || "None"
    },
    homeopathyQuestions: {
      appetite: aptData.homeopathyQuestions.appetite || "Normal",
      sleepPattern: aptData.homeopathyQuestions.sleepPattern || "Restless",
      thirstLevel: aptData.homeopathyQuestions.thirstLevel || "Thirsty",
      stressLevel: aptData.homeopathyQuestions.stressLevel || "Moderate",
      emotionalState: aptData.homeopathyQuestions.emotionalState || "Calm",
      foodPreferences: aptData.homeopathyQuestions.foodPreferences || "None",
      sensitivityToWeather: aptData.homeopathyQuestions.sensitivityToWeather || "Normal"
    },
    documents: aptData.documents || [],
    status: "pending",
    createdAt: new Date().toISOString()
  };

  db.appointments.push(newApt);

  // Notify Doctor
  db.notifications.push({
    id: `not_apt_new_${Date.now()}`,
    userId: aptData.doctorId,
    title: "New Homeopathy consultation Request",
    message: `${patientUser.name} requested an appointment for ${aptData.preferredDate} at ${aptData.preferredTimeSlot}.`,
    type: "info",
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Simulated Email to Doctor (using Resend simulation)
  const emailHtml = `
    <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
      <h2 style="color: #0d9488;">New Appointment Request - HomeoCare</h2>
      <p>Hi <strong>${doctorUser.name}</strong>,</p>
      <p>A patient has requested a homeopathic appointment with you. Below are the details:</p>
      <div style="background: #f0fdfa; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <strong>Patient Name:</strong> ${patientUser.name}<br/>
        <strong>Requested Date:</strong> ${aptData.preferredDate}<br/>
        <strong>Requested Time:</strong> ${aptData.preferredTimeSlot}<br/>
        <strong>Consultation Type:</strong> ${aptData.consultationMode}<br/>
        <strong>Main Complaint:</strong> ${newApt.medicalInfo.mainComplaint}
      </div>
      <p>Please log in to your HomeoCare dashboard to Approve or Reject this request.</p>
    </div>
  `;
  sendSimulatedEmail(doctorUser.email, `HomeoCare Appointment Request from ${patientUser.name}`, emailHtml);

  await saveDB(db);
  res.json({ success: true, appointment: newApt });
});

// --- Update Appointment Status (approval/completion) ---
app.post("/api/appointments/:id/status", async (req, res) => {
  const db = await loadDB();
  const { status, doctorNotes, rescheduleReason, preferredDate, preferredTimeSlot } = req.body;
  const aptIndex = db.appointments.findIndex((a: any) => a.id === req.params.id);

  if (aptIndex === -1) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  const apt = db.appointments[aptIndex];
  apt.status = status;
  if (doctorNotes !== undefined) apt.doctorNotes = doctorNotes;
  if (rescheduleReason !== undefined) apt.rescheduleReason = rescheduleReason;
  if (preferredDate) apt.preferredDate = preferredDate;
  if (preferredTimeSlot) apt.preferredTimeSlot = preferredTimeSlot;

  // Fetch profiles for notification
  const doctor = db.users.find((u: any) => u.id === apt.doctorId);
  const patient = db.users.find((u: any) => u.id === apt.patientId);

  // Send Patient Notification
  let notStyle: "info" | "success" | "warning" = "info";
  let title = "Appointment Updated";
  let msg = `Your appointment status changed to ${status}.`;

  if (status === "confirmed") {
    notStyle = "success";
    title = "Appointment CONFIRMED";
    msg = `Dr. ${doctor?.name || "Doctor"} has approved your appointment on ${apt.preferredDate} at ${apt.preferredTimeSlot}.`;
  } else if (status === "rejected") {
    notStyle = "warning";
    title = "Appointment DECLINED";
    msg = `Dr. ${doctor?.name || "Doctor"} declined your appointment slot.${rescheduleReason ? ` Reason: ${rescheduleReason}` : ""}`;
  } else if (status === "completed") {
    notStyle = "success";
    title = "Consultation COMPLETED";
    msg = `Dr. ${doctor?.name || "Doctor"} finished your consultation. Notes and any prescriptions are available.`;
  }

  db.notifications.push({
    id: `not_apt_status_${Date.now()}`,
    userId: apt.patientId,
    title,
    message: msg,
    type: notStyle,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  // Simulated Email to Patient
  const emailHtml = `
    <div style="font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;">
      <h2 style="color: #0d9488;">Appointment ${status.toUpperCase()}</h2>
      <p>Hi <strong>${patient?.name}</strong>,</p>
      <p>Your appointment on <strong>${apt.preferredDate}</strong> at <strong>${apt.preferredTimeSlot}</strong> with Dr. ${doctor?.name} has been processed:</p>
      <div style="background: #f0fdfa; padding: 15px; border-radius: 8px; margin: 15px 0;">
        <strong>Status:</strong> <span style="text-transform:uppercase; font-weight:bold; color:${status === 'confirmed' ? '#0d9488' : '#e11d48'};">${status}</span><br/>
        ${rescheduleReason ? `<strong>Notes:</strong> ${rescheduleReason}` : ""}
      </div>
      <p>Thank you for choosing HomeoCare.</p>
    </div>
  `;
  sendSimulatedEmail(apt.patientEmail, `HomeoCare Appointment Update - ${status}`, emailHtml);

  await saveDB(db);
  res.json({ success: true, appointment: apt });
});

// --- Update Appointment Intake Details (for doctors to edit) ---
app.put("/api/appointments/:id/intake", async (req, res) => {
  const db = await loadDB();
  const { demographics, medicalInfo, homeopathyQuestions } = req.body;
  const aptIndex = db.appointments.findIndex((a: any) => a.id === req.params.id);

  if (aptIndex === -1) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  const apt = db.appointments[aptIndex];

  // Update demographic fields
  if (demographics) {
    apt.age = demographics.age || apt.age;
    apt.gender = demographics.gender || apt.gender;
    apt.height = demographics.height || apt.height;
    apt.weight = demographics.weight || apt.weight;
    apt.maritalStatus = demographics.maritalStatus || apt.maritalStatus;
    apt.occupation = demographics.occupation || apt.occupation;
    apt.address = demographics.address || apt.address;
    apt.city = demographics.city || apt.city;
    apt.state = demographics.state || apt.state;
    apt.country = demographics.country || apt.country;
  }

  // Update medical info fields
  if (medicalInfo) {
    apt.medicalInfo = {
      ...apt.medicalInfo,
      mainComplaint: medicalInfo.mainComplaint || apt.medicalInfo.mainComplaint,
      symptoms: medicalInfo.symptoms || "",
      durationOfProblem: medicalInfo.durationOfProblem || "",
      currentMedications: medicalInfo.currentMedications || "",
      previousTreatments: medicalInfo.previousTreatments || "",
      allergies: medicalInfo.allergies || "",
      chronicDiseases: medicalInfo.chronicDiseases || "",
      familyMedicalHistory: medicalInfo.familyMedicalHistory || ""
    };
  }

  // Update homeopathy questions
  if (homeopathyQuestions) {
    apt.homeopathyQuestions = {
      ...apt.homeopathyQuestions,
      appetite: homeopathyQuestions.appetite || apt.homeopathyQuestions.appetite,
      sleepPattern: homeopathyQuestions.sleepPattern || apt.homeopathyQuestions.sleepPattern,
      thirstLevel: homeopathyQuestions.thirstLevel || apt.homeopathyQuestions.thirstLevel,
      emotionalState: homeopathyQuestions.emotionalState || "",
      sensitivityToWeather: homeopathyQuestions.sensitivityToWeather || ""
    };
  }

  await saveDB(db);
  res.json({ success: true, appointment: apt });
});

// --- Post Prescriptions ---
app.post("/api/appointments/:id/prescription", async (req, res) => {
  const db = await loadDB();
  const { medicines, generalInstructions } = req.body;
  
  const apt = db.appointments.find((a: any) => a.id === req.params.id);
  if (!apt) {
    return res.status(404).json({ error: "Appointment not found" });
  }

  const doctor = db.users.find((u: any) => u.id === apt.doctorId);
  const doctorProf = db.doctorProfiles.find((dp: any) => dp.userId === apt.doctorId);

  const rxId = `rx_${Date.now()}`;
  const newRx: Prescription = {
    id: rxId,
    appointmentId: apt.id,
    doctorId: apt.doctorId,
    doctorName: doctor?.name || "Doctor",
    doctorSpecialization: doctorProf?.specialization || "Classical Homeopathy",
    patientId: apt.patientId,
    patientName: apt.patientName,
    patientAge: apt.age,
    patientGender: apt.gender,
    date: new Date().toISOString().split("T")[0],
    medicines,
    generalInstructions,
    createdAt: new Date().toISOString()
  };

  db.prescriptions.push(newRx);

  // Auto-complete the appointment or hold state
  apt.status = "completed";

  db.notifications.push({
    id: `not_rx_${Date.now()}`,
    userId: apt.patientId,
    title: "New Prescription Uploaded",
    message: `Dr. ${doctor?.name} designed a homeopathic prescription for your cases. You can view or download it now.`,
    type: "success",
    isRead: false,
    createdAt: new Date().toISOString()
  });

  await saveDB(db);
  res.json({ success: true, prescription: newRx });
});

// --- Fetch Prescriptions ---
app.get("/api/prescriptions", async (req, res) => {
  const db = await loadDB();
  const { userId, role } = req.query;

  let list = db.prescriptions;
  if (role === "patient") {
    list = db.prescriptions.filter((p: any) => p.patientId === userId);
  } else if (role === "doctor") {
    list = db.prescriptions.filter((p: any) => p.doctorId === userId);
  }

  res.json(list);
});

// --- Reviews ---
app.get("/api/reviews", async (req, res) => {
  const db = await loadDB();
  const { doctorId } = req.query;
  const list = doctorId ? db.reviews.filter((r: any) => r.doctorId === doctorId) : db.reviews;
  res.json(list);
});

app.post("/api/reviews", async (req, res) => {
  const db = await loadDB();
  const { doctorId, patientName, rating, reviewText } = req.body;

  const newReview: DoctorReview = {
    id: `rev_${Date.now()}`,
    doctorId,
    patientName,
    rating: Number(rating),
    reviewText,
    createdAt: new Date().toISOString()
  };

  db.reviews.unshift(newReview);

  // Recalculate doctor rating
  const docRevs = db.reviews.filter((r: any) => r.doctorId === doctorId);
  const totalRating = docRevs.reduce((acc: number, r: any) => acc + r.rating, 0);
  const avg = Math.round((totalRating / docRevs.length) * 10) / 10;

  const profIndex = db.doctorProfiles.findIndex((dp: any) => dp.userId === doctorId);
  if (profIndex !== -1) {
    db.doctorProfiles[profIndex].rating = avg;
    db.doctorProfiles[profIndex].ratingsCount = docRevs.length;
  }

  await saveDB(db);
  res.json({ success: true, review: newReview });
});

// --- Uploaded documents ---
app.post("/api/medical-records", async (req, res) => {
  const db = await loadDB();
  const { userId, appointmentId, fileName, fileType, fileUrl, fileSize } = req.body;

  const docId = `doc_${Date.now()}`;
  const newDoc: any = {
    id: docId,
    userId,
    appointmentId,
    fileName,
    fileType,
    fileUrl: fileUrl || "#",
    fileSize: fileSize || "1.0 MB",
    createdAt: new Date().toISOString()
  };

  if (appointmentId) {
    const apt = db.appointments.find((a: any) => a.id === appointmentId);
    if (apt) {
      if (!apt.documents) apt.documents = [];
      apt.documents.push(newDoc);
    }
  }

  // Push to root list or store nested
  db.appointments.forEach((a: any) => {
    if (a.patientId === userId && a.id === appointmentId) {
      if (!a.documents) a.documents = [];
      a.documents.push(newDoc);
    }
  });

  await saveDB(db);
  res.json({ success: true, document: newDoc });
});

// --- Notifications ---
app.get("/api/notifications", async (req, res) => {
  const db = await loadDB();
  const { userId } = req.query;
  const list = db.notifications.filter((n: any) => n.userId === userId);
  list.sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt));
  res.json(list);
});

app.post("/api/notifications/read", async (req, res) => {
  const db = await loadDB();
  const { userId } = req.body;
  db.notifications.forEach((n: any) => {
    if (n.userId === userId) {
      n.isRead = true;
    }
  });
  await saveDB(db);
  res.json({ success: true });
});

// --- Admin / Metrics stats ---
app.get("/api/admin/stats", async (req, res) => {
  const db = await loadDB();
  const totalDoctors = db.users.filter((u: any) => u.role === "doctor").length;
  const approvedDoctors = db.users.filter((u: any) => u.isActive || (u.role === "doctor" && u.isApproved)).length;
  const totalPatients = db.users.filter((u: any) => u.role === "patient").length;
  const allAppointments = db.appointments.length;
  const pendingApts = db.appointments.filter((a: any) => a.status === "pending").length;
  const confirmedApts = db.appointments.filter((a: any) => a.status === "confirmed").length;

  res.json({
    totalDoctors,
    approvedDoctors,
    pendingDoctors: totalDoctors - approvedDoctors,
    totalPatients,
    allAppointments,
    pendingAppointments: pendingApts,
    confirmedAppointments: confirmedApts
  });
});

// --- Get Email simulated log (For proving Email Resend system works) ---
app.get("/api/email-simulation-log", (req, res) => {
  res.json(emailLogs);
});

// Export app for Vercel
export { app, connectMongoAndBootstrap };

// WebRTC Signaling Server with Socket.io
function setupWebRTCSignaling(httpServer: any) {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  const rooms = new Map<string, Set<string>>();

  io.on("connection", (socket) => {
    console.log(`[WebRTC] Client connected: ${socket.id}`);

    socket.on("join-room", (roomId: string) => {
      console.log(`[WebRTC] ${socket.id} joining room: ${roomId}`);
      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
      }
      rooms.get(roomId)!.add(socket.id);

      // Notify others in the room
      const otherUsers = Array.from(rooms.get(roomId)!).filter(id => id !== socket.id);
      socket.emit("other-users", otherUsers);

      // Notify others that a new user joined
      socket.to(roomId).emit("user-joined", socket.id);
    });

    socket.on("offer", ({ offer, to }) => {
      console.log(`[WebRTC] Sending offer from ${socket.id} to ${to}`);
      io.to(to).emit("offer", { offer, from: socket.id });
    });

    socket.on("answer", ({ answer, to }) => {
      console.log(`[WebRTC] Sending answer from ${socket.id} to ${to}`);
      io.to(to).emit("answer", { answer, from: socket.id });
    });

    socket.on("ice-candidate", ({ candidate, to }) => {
      console.log(`[WebRTC] Sending ICE candidate from ${socket.id} to ${to}`);
      io.to(to).emit("ice-candidate", { candidate, from: socket.id });
    });

    socket.on("end-call", (roomId: string) => {
      console.log(`[WebRTC] ${socket.id} ending call in room: ${roomId}`);
      socket.to(roomId).emit("call-ended");
    });

    socket.on("video-toggle", ({ roomId, videoActive }: { roomId: string; videoActive: boolean }) => {
      console.log(`[WebRTC] ${socket.id} toggled video in room ${roomId}: ${videoActive}`);
      socket.to(roomId).emit("video-toggle", { videoActive });
    });

    socket.on("audio-toggle", ({ roomId, audioActive }: { roomId: string; audioActive: boolean }) => {
      console.log(`[WebRTC] ${socket.id} toggled audio in room ${roomId}: ${audioActive}`);
      socket.to(roomId).emit("audio-toggle", { audioActive });
    });

    socket.on("leave-room", (roomId: string) => {
      console.log(`[WebRTC] ${socket.id} leaving room: ${roomId}`);
      socket.leave(roomId);
      if (rooms.has(roomId)) {
        rooms.get(roomId)!.delete(socket.id);
        if (rooms.get(roomId)!.size === 0) {
          rooms.delete(roomId);
        }
      }
      socket.to(roomId).emit("user-left", socket.id);
    });

    socket.on("disconnect", () => {
      console.log(`[WebRTC] Client disconnected: ${socket.id}`);
      // Clean up rooms
      rooms.forEach((users, roomId) => {
        if (users.has(socket.id)) {
          users.delete(socket.id);
          io.to(roomId).emit("user-left", socket.id);
          if (users.size === 0) {
            rooms.delete(roomId);
          }
        }
      });
    });
  });

  return io;
}

async function startServer() {
  // Connect to MongoDB first
  await connectMongoAndBootstrap();
  
  // Create HTTP server
  const httpServer = createHttpServer(app);

  // Setup WebRTC signaling
  setupWebRTCSignaling(httpServer);
  
  // Vite integration
  if (process.env.NODE_ENV === "production") {
    // Production Mode: Serve built files
    const { default: path } = await import("path");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    
    // API route matching wildcard should NOT intercept the API calls
    app.get("/api/*", (req, res) => {
      res.status(404).json({ error: "Endpoint not found" });
    });

    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  } else {
    // Development Mode with Vite Dev Server Middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    app.use(vite.middlewares);
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`[HomeoCare Fullstack Server] Online at http://localhost:${PORT}`);
    console.log(`[WebRTC Signaling] Socket.io ready for peer connections`);
  });
}

// Start server when running directly (not when imported by Vercel)
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  startServer();
}
