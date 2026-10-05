import React, { useRef } from 'react';

const PrescriptionModal = ({ prescription, onClose, backendUrl }) => {
  if (!prescription) return null;

  const printRef = useRef(null);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    const windowPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
    if (windowPrint) {
      windowPrint.document.write(`
        <html>
          <head>
            <title>Digital Prescription - DocBook</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; padding: 20px; color: #1f2937; }
              .header { background: #4f46e5; color: white; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
              .grid { display: flex; gap: 20px; margin-bottom: 20px; }
              .box { flex: 1; border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; background: #f9fafb; }
              .title { font-weight: bold; color: #4f46e5; margin-bottom: 5px; }
              .diagnosis { background: #fef3c7; border: 1px solid #fcd34d; padding: 10px; border-radius: 6px; margin-bottom: 20px; color: #92400e; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 13px; }
              th { background: #4f46e5; color: white; }
              .rx { font-size: 24px; font-weight: bold; color: #4f46e5; margin-bottom: 5px; }
              .footer { margin-top: 40px; border-top: 1px solid #e5e7eb; pt: 15px; font-size: 12px; color: #6b7280; text-align: right; }
            </style>
          </head>
          <body>
            ${printContent}
          </body>
        </html>
      `);
      windowPrint.document.close();
      windowPrint.focus();
      windowPrint.print();
      windowPrint.close();
    }
  };

  const handleDownloadPDF = () => {
    window.open(`${backendUrl}/api/prescription/download/${prescription._id}`, '_blank');
  };

  const doc = prescription.doctorData || {};
  const patient = prescription.patientData || {};
  const medicines = prescription.medicines || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-200">
        
        {/* Action Header */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <h3 className="font-semibold text-base">Digital Medical Prescription</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-medium rounded-lg transition flex items-center gap-1 cursor-pointer"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition flex items-center gap-1 shadow-md cursor-pointer"
            >
              ⬇️ Download PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-lg"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Prescription Printable Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-white" ref={printRef}>
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-5 rounded-xl flex items-center justify-between mb-6 shadow-sm">
            <div>
              <h1 className="text-xl font-bold tracking-tight">DocBook Medical Center</h1>
              <p className="text-xs text-indigo-100">Official Clinical Digital Prescription</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-mono font-bold">Rx ID: {prescription._id?.substring(0, 10).toUpperCase()}</p>
              <p className="text-indigo-100 mt-0.5">
                Date: {new Date(prescription.createdAt || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Doctor & Patient Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Prescribing Doctor</h4>
              <p className="font-semibold text-gray-900 text-sm">Dr. {doc.name || 'Doctor'}</p>
              <p className="text-xs text-gray-600">{doc.speciality || 'General Practitioner'} | {doc.degree || 'MBBS'}</p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">Patient Details</h4>
              <p className="font-semibold text-gray-900 text-sm">{patient.name || 'Patient'}</p>
              <p className="text-xs text-gray-600">
                Gender: {patient.gender || 'N/A'} | DOB: {patient.dob || 'N/A'}
              </p>
            </div>
          </div>

          {/* Diagnosis Box */}
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-6">
            <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Diagnosis / Clinical Impression:</h4>
            <p className="text-sm font-medium text-amber-950">{prescription.diagnosis}</p>
          </div>

          {/* Medicines Table */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl font-bold text-indigo-600">Rx</span>
              <h3 className="font-bold text-gray-900 text-base">Prescribed Medicines</h3>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-indigo-600 text-white font-semibold">
                    <th className="p-3 w-10 text-center">#</th>
                    <th className="p-3">Medicine Name</th>
                    <th className="p-3">Dosage</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {medicines.map((med, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="p-3 text-center font-medium text-gray-500">{index + 1}</td>
                      <td className="p-3 font-semibold text-gray-900">{med.name}</td>
                      <td className="p-3 text-gray-700">{med.dosage}</td>
                      <td className="p-3 text-gray-700">{med.frequency}</td>
                      <td className="p-3 text-gray-700">{med.duration}</td>
                      <td className="p-3 text-gray-600 italic">{med.instructions || 'After food'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Notes & Follow Up */}
          {(prescription.notes || prescription.followUpDate) && (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-6 text-xs text-gray-700 space-y-1">
              {prescription.notes && <p><strong>Additional Notes:</strong> {prescription.notes}</p>}
              {prescription.followUpDate && <p className="text-indigo-700 font-semibold"><strong>Follow-up Date:</strong> {prescription.followUpDate}</p>}
            </div>
          )}

          {/* Signature Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
            <div>
              <p>Digitally issued via DocBook Healthcare Platform</p>
              <p className="text-[10px] text-gray-400">Valid for clinical & pharmacy fulfillment</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900 text-sm">Dr. {doc.name}</p>
              <p className="text-[10px] text-emerald-600 font-semibold">✓ Verified Digital Signature</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrescriptionModal;
