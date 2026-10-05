import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import PrescriptionModal from '../components/PrescriptionModal';

const Prescriptions = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  const fetchPrescriptions = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/prescription/patient`, {
        headers: { token }
      });
      if (data.success) {
        setPrescriptions(data.prescriptions || []);
      }
    } catch (err) {
      console.error("Fetch prescriptions error:", err);
      toast.error("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [token]);

  return (
    <div className="py-6 min-h-[70vh]">
      <div className="flex items-center justify-between pb-4 border-b mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">My Digital Prescriptions</h2>
          <p className="text-xs text-gray-500">View, print, or download official medical prescriptions issued by your doctors.</p>
        </div>
        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
          {prescriptions.length} Prescription{prescriptions.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 bg-gray-100 rounded-xl animate-pulse"></div>
          ))}
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-3">
            📋
          </div>
          <h3 className="font-semibold text-gray-700 text-base">No Prescriptions Available</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
            After completing your appointment consultation, your doctor will issue a digital prescription here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((item) => (
            <div
              key={item._id}
              className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.doctorData?.image || 'https://via.placeholder.com/150'}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover bg-indigo-50"
                    />
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">Dr. {item.doctorData?.name || 'Doctor'}</h3>
                      <p className="text-xs text-indigo-600 font-medium">{item.doctorData?.speciality}</p>
                    </div>
                  </div>
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md font-mono">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl mb-4">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">Diagnosis</span>
                  <p className="text-xs font-semibold text-amber-950 mt-0.5 line-clamp-2">{item.diagnosis}</p>
                </div>

                <div className="text-xs text-gray-600 mb-4">
                  <span className="font-semibold text-gray-700">Prescribed Medicines ({item.medicines?.length || 0}):</span>
                  <p className="text-gray-500 mt-0.5 line-clamp-1">
                    {item.medicines?.map((m) => m.name).join(', ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => setSelectedPrescription(item)}
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition text-center shadow-xs cursor-pointer"
                >
                  👁️ View Prescription
                </button>
                <button
                  onClick={() => window.open(`${backendUrl}/api/prescription/download/${item._id}`, '_blank')}
                  className="py-2 px-3 border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                  title="Download PDF"
                >
                  ⬇️ PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPrescription && (
        <PrescriptionModal
          prescription={selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          backendUrl={backendUrl}
        />
      )}
    </div>
  );
};

export default Prescriptions;
