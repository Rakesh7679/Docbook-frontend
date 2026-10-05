import React, { useEffect, useState, useContext } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import PrescriptionModal from '../components/PrescriptionModal';

const MyAppointment = () => {
  const { backendUrl, token } = useContext(AppContext);
  const [appointments, setAppointments] = useState([]);
  const [prescriptionsMap, setPrescriptionsMap] = useState({});
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' | 'past' | 'all'
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const navigate = useNavigate();

  const getUserAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/user/appointments', {
        headers: { token }
      });
      if (data.success) {
        setAppointments(data.appointments.reverse());
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to load appointments");
    }
  };

  const getPatientPrescriptions = async () => {
    try {
      const { data } = await axios.get(backendUrl + '/api/prescription/patient', {
        headers: { token }
      });
      if (data.success && data.prescriptions) {
        const pMap = {};
        data.prescriptions.forEach(p => {
          pMap[p.appointmentId] = p;
        });
        setPrescriptionsMap(pMap);
      }
    } catch (err) {
      console.log("Prescriptions fetch error:", err);
    }
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/cancel-appointment',
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        toast.success(data.message);
        getUserAppointments();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  };

  const initpay = (order) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name: "Appointment Payment",
      description: "DocBook Telemedicine Consultation Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async (response) => {
        try {
          const { data } = await axios.post(backendUrl + '/api/user/verifyRazorpay', response, {
            headers: { token }
          });
          if (data.success) {
            toast.success(data.message);
            getUserAppointments();
          } else {
            toast.error(data.message);
          }
        } catch (error) {
          console.log(error);
          toast.error("Payment verification failed");
        }
      }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  const appointmentRazorpay = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/payment-razorpay',
        { appointmentId },
        { headers: { token } }
      );
      if (data.success) {
        initpay(data.order);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error("Payment failed to initialize");
    }
  };

  useEffect(() => {
    if (token) {
      getUserAppointments();
      getPatientPrescriptions();
    }
  }, [token]);

  const filteredAppointments = appointments.filter((item) => {
    if (activeTab === 'upcoming') {
      return !item.cancelled && !item.isCompleted;
    }
    if (activeTab === 'past') {
      return item.isCompleted || item.cancelled;
    }
    return true;
  });

  return (
    <div className="py-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mt-8 border-b gap-4">
        <div>
          <h2 className="text-xl font-bold text-zinc-800">My Appointments & Consultations</h2>
          <p className="text-xs text-zinc-500">Manage video consultations, payments, and digital prescriptions.</p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl self-start sm:self-auto">
          {[
            { id: 'upcoming', label: 'Upcoming' },
            { id: 'past', label: 'Past & Completed' },
            { id: 'all', label: 'All History' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                activeTab === tab.id ? 'bg-white text-indigo-600 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Cards */}
      <div className="mt-4 space-y-4">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-500 font-medium text-sm">No appointments found in this category.</p>
          </div>
        ) : (
          filteredAppointments.map((item) => {
            const prescription = prescriptionsMap[item._id];
            const canJoinVideo = !item.cancelled;

            return (
              <div
                key={item._id}
                className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Doctor Info */}
                <div className="flex items-center gap-4">
                  <img
                    className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover bg-indigo-50 border border-indigo-100"
                    src={item.docData?.image}
                    alt=""
                  />
                  <div>
                    <h3 className="text-base font-bold text-neutral-800">Dr. {item.docData?.name}</h3>
                    <p className="text-xs font-semibold text-indigo-600">{item.docData?.speciality}</p>
                    
                    <div className="mt-2 text-xs text-zinc-600 space-y-0.5">
                      <p>
                        <span className="font-semibold text-neutral-700">Date & Time:</span> {item.slotDate} | {item.slotTime}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        {item.docData?.address?.line1} {item.docData?.address?.line2}
                      </p>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {item.cancelled && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-red-100 text-red-700">
                          Cancelled
                        </span>
                      )}
                      {item.isCompleted && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700">
                          Completed
                        </span>
                      )}
                      {item.payment && !item.cancelled && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700">
                          Payment Verified
                        </span>
                      )}
                      {prescription && (
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 flex items-center gap-1">
                          📄 Prescription Available
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-col sm:flex-row md:flex-col gap-2 justify-end min-w-[200px]">
                  {/* Join Video Consultation Button */}
                  {canJoinVideo && (
                    <button
                      onClick={() => navigate(`/consultation/${item._id}`)}
                      className="py-2 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span className="animate-pulse text-base">📹</span>
                      <span>Join Video Consultation</span>
                    </button>
                  )}

                  {/* Prescription Action Buttons */}
                  {prescription && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedPrescription(prescription)}
                        className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl transition text-center shadow-xs cursor-pointer"
                      >
                        👁️ Prescription
                      </button>
                      <button
                        onClick={() => window.open(`${backendUrl}/api/prescription/download/${prescription._id}`, '_blank')}
                        className="py-2 px-3 border border-purple-200 hover:bg-purple-50 text-purple-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                        title="Download Prescription PDF"
                      >
                        ⬇️ PDF
                      </button>
                    </div>
                  )}

                  {/* Payment Button */}
                  {!item.cancelled && !item.payment && !item.isCompleted && (
                    <button
                      onClick={() => appointmentRazorpay(item._id)}
                      className="py-2 px-4 border border-indigo-500 text-indigo-600 hover:bg-indigo-600 hover:text-white font-semibold text-xs rounded-xl transition text-center cursor-pointer"
                    >
                      Pay Online (₹{item.amount})
                    </button>
                  )}

                  {/* Cancel Button */}
                  {!item.cancelled && !item.isCompleted && (
                    <button
                      onClick={() => cancelAppointment(item._id)}
                      className="py-2 px-4 border border-red-200 text-red-500 hover:bg-red-600 hover:text-white font-medium text-xs rounded-xl transition text-center cursor-pointer"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Prescription View Modal */}
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

export default MyAppointment;