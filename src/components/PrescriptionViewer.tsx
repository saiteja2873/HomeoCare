import React from "react";
import { Prescription } from "../types";
import { Printer, BadgeCheck, X, FileText, Download } from "lucide-react";
import { jsPDF } from "jspdf";

interface PrescriptionViewerProps {
  prescription: Prescription;
  onClose: () => void;
}

export const PrescriptionViewer: React.FC<PrescriptionViewerProps> = ({ prescription, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });

      // Color definitions
      const primaryTeal = [13, 148, 136]; // Teal #0d9488
      const darkSlate = [15, 23, 42]; // Slate-900 #0f172a
      const graySlate = [100, 116, 139]; // Slate-500 #64748b

      // Set document properties
      doc.setProperties({
        title: `HomeoCare_Prescription_${prescription.id}`,
        subject: "Medical Prescription",
        author: "HomeoCare Wellness Clinics",
        creator: prescription.doctorName
      });

      // 1. Header Left (Clinic particulars)
      doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text("HomeoCare Wellness Clinics", 15, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(graySlate[0], graySlate[1], graySlate[2]);
      doc.text("CLASSICAL HOMEOPATHY CLINICAL CENTER", 15, 24);
      doc.text("Homoeo Classical Bldg, 808 Healing Hill, Boston, MA", 15, 28);
      doc.text("office@homeocare.com | +1 (555) 019-2834", 15, 32);

      // 2. Header Right (Doctor particulars)
      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(prescription.doctorName, 195, 20, { align: "right" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
      doc.text((prescription.doctorSpecialization || "Specialist").toUpperCase(), 195, 24, { align: "right" });

      doc.setTextColor(graySlate[0], graySlate[1], graySlate[2]);
      doc.text("Reg No: HOM-2026-99381", 195, 28, { align: "right" });

      // Header border line
      doc.setDrawColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
      doc.setLineWidth(0.6);
      doc.line(15, 36, 195, 36);

      // 3. Patient Info Box (y = 42 to y = 62)
      doc.setDrawColor(203, 213, 225); // Slate 300
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.setLineWidth(0.2);
      doc.roundedRect(15, 42, 180, 20, 3, 3, "FD");

      // Labels and Values
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(graySlate[0], graySlate[1], graySlate[2]);
      doc.text("PATIENT NAME:", 20, 48);
      doc.text("AGE / GENDER:", 75, 48);
      doc.text("PRESCRIPTION DATE:", 120, 48);
      doc.text("REFERENCE CODE:", 160, 48);

      doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
      doc.setFont("helvetica", "bold");
      doc.text(prescription.patientName, 20, 54);
      doc.setFont("helvetica", "normal");
      doc.text(`${prescription.patientAge} Yrs / ${prescription.patientGender}`, 75, 54);
      doc.setFont("helvetica", "bold");
      doc.text(prescription.date, 120, 54);
      doc.text(prescription.id, 160, 54);

      // 4. Rx Symbol (y = 70)
      doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
      doc.setFont("times", "italic");
      doc.setFontSize(28);
      doc.text("Rx", 15, 74);

      // Header label
      doc.setTextColor(graySlate[0], graySlate[1], graySlate[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("RXs & DOSAGE SCHEDULE", 15, 82);

      // 5. Table Header
      doc.setDrawColor(148, 163, 184); // Slate 400
      doc.setLineWidth(0.3);
      doc.line(15, 85, 195, 85);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text("Medicine Name & Potency", 15, 89);
      doc.text("Dosage Units", 95, 89);
      doc.text("Duration", 130, 89);
      doc.text("Instructions", 195, 89, { align: "right" });

      doc.line(15, 92, 195, 92);

      // 6. Table Rows
      let currentY = 97;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);

      prescription.medicines.forEach((med) => {
        if (currentY > 240) {
          doc.addPage();
          currentY = 20;
          
          doc.setFont("helvetica", "bold");
          doc.text("Medicine Name & Potency", 15, currentY);
          doc.text("Dosage Units", 95, currentY);
          doc.text("Duration", 130, currentY);
          doc.text("Instructions", 195, currentY, { align: "right" });
          doc.line(15, currentY + 3, 195, currentY + 3);
          currentY += 8;
        }

        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text(med.name, 15, currentY);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.text(med.dosage, 95, currentY);
        doc.text(med.duration, 130, currentY);

        doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
        doc.setFont("helvetica", "bold");
        doc.text(med.instructions, 195, currentY, { align: "right" });

        doc.setDrawColor(241, 245, 249);
        doc.setLineWidth(0.1);
        doc.line(15, currentY + 3, 195, currentY + 3);

        currentY += 8;
      });

      // 7. General Instructions
      if (prescription.generalInstructions) {
        currentY += 4;
        if (currentY > 230) {
          doc.addPage();
          currentY = 20;
        }

        doc.setDrawColor(204, 251, 241); // Teal 100
        doc.setFillColor(240, 253, 250); // Teal 50
        doc.setLineWidth(0.2);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(8.5);
        const lines = doc.splitTextToSize(prescription.generalInstructions, 170);
        const boxHeight = lines.length * 4.5 + 10;

        doc.roundedRect(15, currentY, 180, boxHeight, 2, 2, "FD");

        doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text("DIETARY & LIFESTYLE INSTRUCTIONS:", 19, currentY + 5);

        doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
        doc.setFont("helvetica", "italic");
        doc.setFontSize(8.5);
        
        let textY = currentY + 10;
        lines.forEach((line: string) => {
          doc.text(line, 19, textY);
          textY += 4.5;
        });

        currentY += boxHeight + 10;
      }

      // 8. Sign-off Footer section
      const footerY = Math.max(currentY, 255);
      
      doc.setTextColor(graySlate[0], graySlate[1], graySlate[2]);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.text("Scan to verify original consultation record.", 15, footerY);
      doc.text("Generated securely on HomeoCare Health Platform.", 15, footerY + 4);

      doc.setFont("times", "italic");
      doc.setFontSize(10.5);
      doc.text("Catherine Vance", 170, footerY, { align: "center" });

      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.2);
      doc.line(145, footerY + 2, 195, footerY + 2);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(7.5);
      doc.text("AUTHORIZED SIGNATURE", 170, footerY + 5, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(7);
      doc.text("This digital prescription is validated securely. Verify doctor registry key from clinical offices at Boston, MA.", 105, 287, { align: "center" });

      doc.save(`homeocare_prescription_${prescription.id}.pdf`);
    } catch (err) {
      console.error("PDF download failed", err);
    }
  };

  return (
    <div id="prescription_viewer_backdrop" className="fixed inset-0 bg-slate-900/65 backdrop-blur-xs flex items-start justify-center p-4 z-50 overflow-y-auto print:p-0 print:bg-white print:static print:h-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col my-8 print:my-0 print:shadow-none print:border-none print:rounded-none">
        
        {/* Top Control bar (Hidden during print) */}
        <div className="bg-slate-900 p-4 text-white flex justify-between items-center print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold font-display tracking-tight">Homeopathic Prescription Review</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPDF}
              className="bg-teal-600 hover:bg-teal-500 text-slate-950 font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              id="prescription_viewer_close_btn"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Prescription Document Main Sheet */}
        <div id="prescription_print_sheet" className="p-8 sm:p-12 text-left bg-white text-slate-800 space-y-8 flex-1 font-sans">
          
          {/* 1. Letterhead */}
          <div className="flex justify-between items-start border-b-2 border-teal-600 pb-6">
            <div className="space-y-1">
              <h1 className="text-xl font-bold font-display tracking-tight text-teal-800">HomeoCare Wellness Clinics</h1>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Classical Homeopathy Clinical Center</p>
              <p className="text-xs text-slate-600">Homoeo Classical Bldg, 808 Healing Hill, Boston, MA</p>
              <p className="text-xs text-slate-600">office@homeocare.com | +1 (555) 019-2834</p>
            </div>
            <div className="text-right space-y-0.5">
              <h2 className="text-sm font-bold text-slate-800">{prescription.doctorName}</h2>
              <p className="text-[10px] font-semibold text-teal-650 uppercase tracking-wider">{prescription.doctorSpecialization}</p>
              <p className="text-[10px] text-slate-500 font-mono">Reg No: HOM-2026-99381</p>
              <div className="inline-flex items-center gap-1 bg-teal-50 border border-teal-100 rounded-full px-2.5 py-0.5 text-[9px] text-teal-700 font-bold mt-1.5">
                <BadgeCheck className="w-3 h-3" />
                <span>Verified Physician</span>
              </div>
            </div>
          </div>

          {/* 2. Patient metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 border border-slate-150 rounded-2xl text-xs leading-relaxed">
            <div>
              <span className="text-slate-450 uppercase font-semibold text-[9px] block">Patient Name:</span>
              <span className="font-bold text-slate-800">{prescription.patientName}</span>
            </div>
            <div>
              <span className="text-slate-450 uppercase font-semibold text-[9px] block">Age / Gender:</span>
              <span className="font-semibold text-slate-800">{prescription.patientAge} Yrs / {prescription.patientGender}</span>
            </div>
            <div>
              <span className="text-slate-450 uppercase font-semibold text-[9px] block">Prescription Date:</span>
              <span className="font-mono text-slate-800">{prescription.date}</span>
            </div>
            <div>
              <span className="text-slate-450 uppercase font-semibold text-[9px] block">Reference Code:</span>
              <span className="font-mono font-bold text-slate-800">{prescription.id}</span>
            </div>
          </div>

          {/* 3. RX Symbol */}
          <div className="text-3xl font-serif font-semibold italic text-teal-750 border-b border-slate-100 pb-2">
            ℞
          </div>

          {/* 4. Medicines table listing */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 block">Rxs & Dosage schedule</h4>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-450 uppercase font-bold text-[10px]">
                    <th className="pb-3 text-left w-2/5">Medicine Name & Potency</th>
                    <th className="pb-3 text-left w-1/5">Dosage Units</th>
                    <th className="pb-3 text-left w-1/5">Duration</th>
                    <th className="pb-3 text-left w-1/5 text-right">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {prescription.medicines.map((med, idx) => (
                    <tr key={idx} className="text-slate-750">
                      <td className="py-3.5 font-bold text-slate-900 text-sm">{med.name}</td>
                      <td className="py-3.5 font-mono text-slate-650">{med.dosage}</td>
                      <td className="py-3.5 text-slate-650">{med.duration}</td>
                      <td className="py-3.5 text-right font-medium text-teal-700">{med.instructions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. General Instructions */}
          {prescription.generalInstructions && (
            <div className="pt-4 border-t border-slate-100 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-widest text-[10px] mb-2 text-left">Dietary & lifestyle Instructions:</h4>
              <p className="text-slate-650 leading-relaxed bg-teal-50/40 p-4 border border-teal-150/45 rounded-2xl italic">
                "{prescription.generalInstructions}"
              </p>
            </div>
          )}

          {/* 6. Signature section */}
          <div className="flex justify-between items-end pt-12">
            <div className="text-[10px] text-slate-450 leading-relaxed">
              <p>Scan to verify original consultation record.</p>
              <p>Generated securely on HomeoCare Health Platform.</p>
            </div>
            <div className="text-right space-y-1">
              <div className="h-10 w-28 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(13,148,136,0.1),transparent)] flex items-center justify-center font-serif text-slate-450 text-xs italic">
                Catherine Vance
              </div>
              <div className="border-t border-slate-300 w-44 pt-1 text-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Authorized Signature</span>
              </div>
            </div>
          </div>

          {/* Print note */}
          <div className="hidden print:block text-center text-[9px] text-slate-400 border-t border-slate-150 pt-6 mt-8">
            This digital prescription is validated securely. Verify doctor registry key from clinical offices at Boston, MA.
          </div>

        </div>

        {/* Footer (Hidden during print) */}
        <div className="bg-slate-50 p-4 border-t border-slate-150 flex justify-end gap-3 print:hidden">
          <button
            id="prescription_viewer_cancel_btn"
            onClick={onClose}
            className="px-4 py-2 bg-slate-850 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
};
