import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { 
  Heart, 
  Video, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  UserCheck, 
  ChevronRight, 
  Star,
  BookOpen, 
  Sparkles,
  HelpCircle,
  Mail,
  Send,
  MessageSquare
} from "lucide-react";

interface LandingPageProps {
  onNavigate: (page: string, extra?: any) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { doctors, currentUser } = useApp();
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryMsg, setInquiryMsg] = useState("");
  const [inquirySuccess, setInquirySuccess] = useState(false);

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail || !inquiryMsg) return;
    setInquirySuccess(true);
    setTimeout(() => {
      setInquiryName("");
      setInquiryEmail("");
      setInquiryMsg("");
      setInquirySuccess(false);
    }, 4500);
  };

  const handleBookClick = (doctor?: any) => {
    if (!currentUser) {
      // Redirect to auth first
      onNavigate("auth", { next: "book", doctor });
    } else {
      onNavigate("dashboard", { tab: "book", doctor });
    }
  };

  const faqs = [
    {
      q: "What is Classical Homeopathy?",
      a: "Classical homeopathy is a holistic medical approach using extremely diluted substances from nature to trigger the body's natural defense and healing mechanisms. Remedies are determined by evaluating the complete mental, emotional, and physical diagnostic profile of the individual."
    },
    {
      q: "How does online consultation work?",
      a: "You select a verified homeopathic doctor, book a preferred date/time slot, and complete our comprehensive medical questionnaire. At the time of appointment, you join a face-to-face video consultation directly on HomeoCare from your mobile or PC, and your doctor prescribes remedies through a digital prescription."
    },
    {
      q: "Are the diluted remedies effective?",
      a: "Yes. Homeopathy operates under the 'Law of Similars' (like cures like) and the 'Law of Minimum Dose.' Under microscopic succussion, remedies retain nano-pharmacological structures that safely stimulate immunological defense mechanisms without the side effects of traditional heavy chemical drugs."
    },
    {
      q: "Can I upload previous tests or blood reports?",
      a: "Absolutely! Our secure portal permits uploading of PDFs and medical images (JPG, PNG). Doctors review these prior to your video appointment to contextualize constitutional prescribing."
    }
  ];

  return (
    <div id="landing_page_root" className="bg-slate-50 min-h-screen">
      {/* 1. HERO SECTION */}
      <header id="hero_section" className="relative overflow-hidden bg-gradient-to-tr from-teal-900 via-teal-800 to-slate-900 text-white pt-20 pb-24 sm:pb-32 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(13,148,136,0.35),rgba(0,0,0,0))]"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-teal-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full blur-3xl opacity-20"></div>

        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-500/10 border border-teal-500/20 rounded-full text-teal-300 text-xs font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Certified Classical Homeopathic Doctors</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight leading-none">
              Classical Homeopathy <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-emerald-300">
                Consultation from Home
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Book online consultations with trusted, approved homeopathic physicians. Get personalized constitutional case studies, tailored treatment calendars, and secure digital prescriptions.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                id="hero_book_btn"
                onClick={() => handleBookClick()}
                className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold px-7 py-3.5 rounded-xl transition shadow-xl shadow-teal-950/40 text-sm hover:scale-[1.02] transform duration-150 cursor-pointer"
              >
                Book Consultation Now
              </button>
              <button
                id="hero_showcase_btn"
                onClick={() => {
                  const el = document.getElementById("doctors_showcase");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 font-semibold px-6 py-3.5 rounded-xl transition text-sm cursor-pointer"
              >
                Our Specialties
              </button>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-800">
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold font-display text-teal-400">100%</span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Safe and Natural</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold font-display text-teal-400">12k+</span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Guided Cases</span>
              </div>
              <div>
                <span className="block text-2xl sm:text-3xl font-extrabold font-display text-teal-400">15+</span>
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Years Experience</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-emerald-500 rounded-3xl blur-2xl opacity-10 scale-95"></div>
            <div className="relative bg-slate-900/60 border border-slate-700/40 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
              <div className="flex items-center gap-3 border-b border-slate-850 pb-4 mb-4">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-500 animate-ping"></div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">Live Clinical Center</h4>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-450 font-bold">STEP 01</p>
                    <p className="text-sm font-semibold text-slate-200">Fill Multi-dimensional Case Profile</p>
                  </div>
                </div>
                
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-450 font-bold">STEP 02</p>
                    <p className="text-sm font-semibold text-slate-200">Attend Live Audio/Video Slot</p>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500/10 text-teal-400 rounded-xl flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div className="text-left">
                    <p className="text-xs text-slate-450 font-bold">STEP 03</p>
                    <p className="text-sm font-semibold text-slate-200">Download Digital dilution Prescriptions</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 2. FEATURES SECTION */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-teal-600 font-display">
            Tailored Healing System
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2 font-display">
            Everything You Need for Remote Care
          </h3>
          <p className="text-slate-650 mt-4 leading-relaxed text-sm sm:text-base">
            Classical homeopathy takes into account the environment, diet, genetics, and neurological temperament of each patient. We’ve configured our features to capture every dimension.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition duration-200 text-left">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
              <Video className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 font-display">Secure Video Consultations</h4>
            <p className="text-slate-600 mt-2.5 text-xs/relaxed sm:text-sm/relaxed">
              No software installations. Connect with WebRTC call portals directly inside your patient cabinet. Clear, low-latency audio/video.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition duration-200 text-left">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 font-display">Smart Appointment Scheduling</h4>
            <p className="text-slate-600 mt-2.5 text-xs/relaxed sm:text-sm/relaxed">
              Choose optimized dates and hour intervals. Our calendar locks booked slots dynamically, ensuring zero double-bookings or scheduling overlap.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition duration-200 text-left">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
              <BookOpen className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 font-display">Micro-Symptom Tracking</h4>
            <p className="text-slate-600 mt-2.5 text-xs/relaxed sm:text-sm/relaxed">
              Answer specific questions regarding appetite, weather sensitivities, sleep cycles, thirst, and stress indicators required for classic homeopathic analysis.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition duration-200 text-left">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 font-display">Secure Case History Records</h4>
            <p className="text-slate-600 mt-2.5 text-xs/relaxed sm:text-sm/relaxed">
              Upload blood work, reports, or visual dermatitis pictures via our secure Drag & Drop interface directly linked with doctor consultation rooms.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition duration-200 text-left">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
              <Send className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 font-display">Automated Notifications API</h4>
            <p className="text-slate-600 mt-2.5 text-xs/relaxed sm:text-sm/relaxed">
              Patients and doctors receive immediate automated email summaries (powered by Resend API integration) on booking, rescheduling, or completion.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-150 shadow-xs hover:shadow-md transition duration-200 text-left">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-6">
              <Clock className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-bold text-slate-900 font-display">Real-Time Inboxes</h4>
            <p className="text-slate-600 mt-2.5 text-xs/relaxed sm:text-sm/relaxed">
              Instant in-app notifications and approval notifications keep you up to date as your homeopathic file moves from Pending to Approved or Prescribed.
            </p>
          </div>

        </div>
      </section>

      {/* 3. ABOUT HOMEOPATHY SECTION */}
      <section id="about" className="py-20 bg-teal-50/50 border-y border-slate-200/65 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 space-y-6 text-left">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">The Power of Dilution</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Understating the Principles of Homeopathic Medicine
            </h2>
            <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
              Homeopathy is based on a fundamental concept formulate on 1796 by Samuel Hahnemann: <strong>"Similia Similibus Curentur"</strong> (Let likes be cured by likes). By introducing highly potentized micro-substances, we gently educate the dynamic immune vital force to restore homeostasis.
            </p>

            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1 w-5 h-5 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 fill-teal-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Constitutional Individualization</h4>
                  <p className="text-slate-600 text-xs mt-0.5">We do not treat migraines; we treat the individual who hosts the migraine. Sleep posture and weather patterns are key diagnostic criteria.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 mt-1 w-5 h-5 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center">
                  <Star className="w-3 h-3 fill-teal-700" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Nano-Pharmacology Potentization</h4>
                  <p className="text-slate-600 text-xs mt-0.5">Remedies undergo intensive succussion (physical shaking) making them non-toxic and absolutely safe for pediatric uses or pregnant mothers.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs">
                <span className="block text-3xl font-extrabold text-teal-600 font-display">No</span>
                <span className="block text-sm font-semibold text-slate-800 mt-1">Chemical Additives</span>
                <p className="text-[11px] text-slate-500 mt-2">Zero pharmaceutical processing or heavy chemical synthetics.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs mt-4">
                <span className="block text-3xl font-extrabold text-teal-600 font-display">100%</span>
                <span className="block text-sm font-semibold text-slate-800 mt-1 font-display">Ethical Dilutions</span>
                <p className="text-[11px] text-slate-500 mt-2">Natural extracts sourced exclusively from mineral, vegetable, or biotic states.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs">
                <span className="block text-3xl font-extrabold text-teal-600 font-display">Zero</span>
                <span className="block text-sm font-semibold text-slate-800 mt-1">Side Effects</span>
                <p className="text-[11px] text-slate-500 mt-2">A holistic micro-dosing path that does small work for long results.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs mt-4">
                <span className="block text-3xl font-extrabold text-teal-600 font-display">1:1</span>
                <span className="block text-sm font-semibold text-slate-800 mt-1 font-display">Physician Focus</span>
                <p className="text-[11px] text-slate-500 mt-2">Extended clinical attention covering mind-body stress variables.</p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 4. DOCTORS SHOWCASE */}
      <section id="doctors_showcase" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Our Experts</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display mt-2">
            Meet Our Approved Classical Physicians
          </h2>
          <p className="text-slate-600 mt-4 text-sm">
            Select a specialist today to start your holistic homeopathic case study analysis. All doctors are strictly-vetted and licensed practitioners.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doc: any, i: number) => (
            <div 
              key={doc.id || i}
              id={`doctor_card_${doc.id}`}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:shadow-lg transition duration-350 transform hover:-translate-y-1 text-left"
            >
              <div className="p-6 pb-4 border-b border-slate-100 flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-display">{doc.name}</h3>
                    <p className="text-xs/relaxed text-teal-600 font-medium font-display mt-0.5">
                      {doc.profile?.specialization || "Homeopathic Physician"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{doc.profile?.rating || "New"}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-xs">
                    <span className="text-slate-450 uppercase tracking-wider font-semibold">Qualification: </span>
                    <span className="text-slate-700">{doc.profile?.qualification || "BHMS"}</span>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-450 uppercase tracking-wider font-semibold">Experience: </span>
                    <span className="text-slate-700">{doc.profile?.experience || "1"}+ Years</span>
                  </div>
                  <div className="text-xs leading-relaxed mt-2 text-slate-600">
                    {doc.profile?.bio}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-500 tracking-wide font-mono">
                  {doc.phone}
                </span>
                <button
                  id={`doctor_book_btn_${doc.id}`}
                  onClick={() => handleBookClick(doc)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition shadow-xs flex items-center gap-1 cursor-pointer"
                >
                  <span>Consult Now</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. FAQS SECTION */}
      <section id="faq" className="py-20 bg-slate-100 border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-left">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Help & Support</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 font-display">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-150 shadow-xs">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 font-display">
                  <HelpCircle className="w-5 h-5 text-teal-600 shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mt-3 pl-7">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CONTACT SECTION & INQUIRY FORM */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 text-left">
          
          <div className="space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-teal-600">Get In Touch</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display">Contact HomeoCare Office</h2>
            <p className="text-slate-650 text-sm sm:text-base leading-relaxed">
              Have questions regarding homeopathic treatment schemas or custom corporate insurance integrations? Send us an inquiry! Our healthcare administrators will follow-up within 1 business day.
            </p>

            <div className="space-y-3.5 pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-450 uppercase font-bold">Email Support</p>
                  <p className="text-sm font-semibold text-slate-800">support@homeocare.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-450 uppercase font-bold">Primary Clinic Address</p>
                  <p className="text-sm font-semibold text-slate-800">Homoeo Classical Building, 808 Healing Hill, Boston, MA</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-7 sm:p-10 rounded-3xl border border-slate-200 shadow-xs relative">
            <h3 className="text-xl font-bold text-slate-900 font-display mb-2">Submit inquiry Form</h3>
            <p className="text-xs text-slate-500 mb-6">Ask clinic questions or report any support difficulty.</p>

            {inquirySuccess ? (
              <div id="inquiry_success_banner" className="bg-teal-50 border border-teal-200 rounded-2xl p-5 text-center animate-fade-in text-slate-800">
                <MessageSquare className="w-10 h-10 text-teal-600 mx-auto mb-3" />
                <h4 className="font-bold text-sm text-teal-800">Inquiry Sent Successfully!</h4>
                <p className="text-xs text-slate-600 mt-1">Thank you. Typical response cycles are completed within 12 hours.</p>
              </div>
            ) : (
              <form id="landing_inquiry_form" onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Full Name</label>
                  <input
                    id="inquiry_name_input"
                    type="text"
                    required
                    value={inquiryName}
                    onChange={(e) => setInquiryName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-250 rounded-xl bg-slate-50/50 focus:border-teal-500 focus:bg-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    id="inquiry_email_input"
                    type="email"
                    required
                    value={inquiryEmail}
                    onChange={(e) => setInquiryEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-250 rounded-xl bg-slate-50/50 focus:border-teal-500 focus:bg-white outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Your Message</label>
                  <textarea
                    id="inquiry_msg_input"
                    required
                    rows={4}
                    value={inquiryMsg}
                    onChange={(e) => setInquiryMsg(e.target.value)}
                    placeholder="Detail your inquiry..."
                    className="w-full text-xs px-3.5 py-2.5 border border-slate-250 rounded-xl bg-slate-50/50 focus:border-teal-500 focus:bg-white outline-none transition"
                  ></textarea>
                </div>

                <button
                  id="inquiry_submit_btn"
                  type="submit"
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-md shadow-teal-700/10 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Inquiry</span>
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-10 border-t border-slate-900 text-center">
        <p className="text-xs">&copy; 2026 HomeoCare Systems. Classical homeopathy online consultation. All Right Reserved.</p>
        <p className="text-[10px] text-slate-600 mt-2">Remedies are prescribed by individual consult. Medical advice disclaimer applies.</p>
      </footer>
    </div>
  );
};
