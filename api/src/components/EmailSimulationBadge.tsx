import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { Mail, Clock, Eye, X, ChevronDown, ChevronUp } from "lucide-react";

export const EmailSimulationBadge: React.FC = () => {
  const { emailLogs } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<any>(null);

  if (emailLogs.length === 0) return null;

  return (
    <div id="email_simulation_container" className="fixed bottom-4 right-4 z-50">
      {/* Mini badge / header */}
      <button
        id="email_simulation_trigger"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs py-2.5 px-4 rounded-full shadow-2xl transition duration-200 border border-slate-700 animate-bounce hover:animate-none cursor-pointer"
      >
        <div className="relative">
          <Mail className="w-4 h-4 text-teal-400" />
          <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white font-bold rounded-full w-4 h-4 flex items-center justify-center text-[10px]">
            {emailLogs.length}
          </span>
        </div>
        <span>Resend Email Outbox</span>
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      {/* Main Drawer panel */}
      {isOpen && (
        <div 
          id="email_simulation_outbox_panel"
          className="absolute bottom-14 right-0 w-80 max-h-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="bg-slate-900 p-3.5 flex justify-between items-center border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-white">
              <Mail className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-semibold font-display tracking-wide">Developer Email Simulator</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-2 bg-slate-100 text-[10px] text-slate-500 font-medium border-b border-slate-200">
            Simulates or dispatches live emails via Resend API.
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-slate-100">
            {emailLogs.map((email: any) => (
              <div 
                key={email.id} 
                className="p-3 text-left hover:bg-slate-55 transition cursor-pointer"
                onClick={() => setSelectedEmail(email)}
              >
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-mono">{email.to}</span>
                  <span className="flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(email.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">{email.subject}</h4>
                <div className="flex items-center justify-between mt-1.5">
                  <div className="flex items-center gap-1 text-[11px] text-teal-600 font-medium">
                    <Eye className="w-3 h-3" />
                    <span>View Content</span>
                  </div>
                  <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    email.status === "sent" ? "bg-emerald-100 text-emerald-800 border border-emerald-250" :
                    email.status === "failed" ? "bg-rose-100 text-rose-800 border border-rose-250" :
                    "bg-amber-100 text-amber-800 border border-amber-250"
                  }`}>
                    {email.status || "simulated"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed inspection modal */}
      {selectedEmail && (
        <div id="email_detail_modal" className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[80vh]">
            <div className="bg-slate-50 p-4 border-b border-slate-200 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] bg-slate-900 text-slate-100 font-bold px-2 py-0.5 rounded-full uppercase">
                    Resend Service API Block
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    selectedEmail.status === "sent" ? "bg-emerald-100 text-emerald-800 border border-emerald-250" :
                    selectedEmail.status === "failed" ? "bg-rose-100 text-rose-800 border border-rose-250" :
                    "bg-amber-100 text-amber-800 border border-amber-250"
                  }`}>
                    {selectedEmail.status || "simulated"}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-800 mt-2">{selectedEmail.subject}</h3>
                <p className="text-xs text-slate-500 mt-1 font-mono">To: {selectedEmail.to}</p>
                {selectedEmail.status === "failed" && selectedEmail.error && (
                  <div className="text-[10px] text-rose-700 bg-rose-50 border border-rose-200 p-2 rounded-lg mt-2 font-mono">
                    <strong>API Delivery Error:</strong> {selectedEmail.error}
                  </div>
                )}
              </div>
              <button 
                onClick={() => setSelectedEmail(null)}
                className="text-slate-400 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 bg-slate-50">
              <div 
                className="bg-white p-4 rounded-xl border border-slate-150 shadow-inner text-sm"
                dangerouslySetInnerHTML={{ __html: selectedEmail.html }}
              />
            </div>

            <div className="p-3.5 bg-slate-100 border-t border-slate-200 flex justify-end">
              <button 
                onClick={() => setSelectedEmail(null)}
                className="bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs px-4 py-2 rounded-lg transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
