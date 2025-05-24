import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import { toast } from "react-toastify";
import axios from "axios";



const Appoinment = () => {

  const { docId } = useParams();
  const { doctors,currencySymbol,backendUrl,token,getDoctorsData } = useContext(AppContext);
  const dayOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  const navigate = useNavigate()

  const [docInfo, setDocInfo] = useState(null)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  

  const fetchDocInfo = async () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
   
  }

  const getAvailableSlots = async () => {
    setDocSlots([])
    let today = new Date()
    for(let i=0;i<7;i++){
      let currentDate =new Date(today)
      currentDate.setDate(today.getDate() + i)
      let endTime = new Date(today)
      endTime.setDate(today.getDate() + i)
      endTime.setHours(21,0,0,0)
      if(today.getDate()=== currentDate.getDate()){
        currentDate.setHours(currentDate.getHours()>10? currentDate.getHours()+1 : 10)
        currentDate.setMinutes(currentDate.getMinutes()> 30 ?30 : 0)

      }else{
        currentDate.setHours(10)
        currentDate.setMinutes(0)

      }

      let timeSlots = [];

      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        let day = currentDate.getDate();
        let month = currentDate.getMonth() + 1;
        let year = currentDate.getFullYear();

        let slotDate = day + '-' + month + '-' + year;
        let slotTime = formattedTime;
        const isSlotAvailable = docInfo.slots_booked[slotDate] && docInfo.slots_booked[slotDate].includes(slotTime) ? false : true;

        // Fix: Add slot only if it is available
        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime,
          });
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }
      setDocSlots(prev => ([...prev, timeSlots]))
    }

  }

  const bookAppointment = async () => {
    if(!token){
      toast.warn('Please login to book an appointment')
      return navigate('/login')
    }
    try {
      const date = docSlots[slotIndex][0].datetime
      let day = date.getDate()
      let month = date.getMonth() + 1
      let year = date.getFullYear()

      const slotDate = day + '-' + month + '-' + year
      const { data } = await axios.post(backendUrl + '/api/user/book-appointment', {
        docId,
        slotDate,
        slotTime,

        
      }, {
        headers: {
          token
        }
      })
      if (data.success) {
        toast.success(data.message)
        getDoctorsData()
        navigate('/my-appointments')
      } else {
        toast.error("error1" )
      }
      
      
    } catch (error) {
      toast.error('Something went wrong while booking appointment')
      console.log(error)
      
    }
  }

  useEffect(() => {
    
    fetchDocInfo();
  }, [doctors, docId]);

  useEffect(() => {
    getAvailableSlots();
  }, [docInfo]);

  useEffect(() => {
    console.log(docSlots);
    
  },[docSlots]);

  return (
    docInfo && (
      <div>
        {/*---- Doctor details ----*/}
        <div className="flex flex-col sm:flex-row gap-4">
          <div>
            <img className="bg-[#5f6FFF] w-full sm:max-w-72 rounded-lg" src={docInfo.image} alt="" />
          </div>
          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            {/* -------- Doc Information -------*/}
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name} <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600 ">
              <p>
                {docInfo.degree}-{docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">{docInfo.experience}</button>
            </div>
            {/* -----Doctor About ------*/}
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3"> About <img src={assets.info_icon} alt=""/> </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">{docInfo.about}</p>
              </div>
              <p className="text-gray-500 font-medium mt-4">
              Appointment fees: <span className="text-green-500 font-medium">{currencySymbol} {docInfo.fees} </span>


              </p>
          </div>
        </div>

        {/*---- Doctor slots ----*/}
        <div className="sm:ml-72 sm:pl-4 mt-4 font-medium text-gray-700">
          <p>Booking slots</p>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {
              docSlots.length  && docSlots.map((item,index)=>(
                <div onClick={() => setSlotIndex(index)} className={`text-center py-6 min-w-16 rounded-full cursor-pointer ${slotIndex === index ?'bg-[#5f6FFF] text-white ':'border border-gray-200 '}`} key={index}>
                  <p>{item[0] && dayOfWeek[item[0].datetime.getDay()]}</p>
                  <p>{item[0] && item[0].datetime.getDate()}</p>
                </div>


              ))
            }
          </div>
          <div className="flex gap-3 items-center w-full overflow-x-scroll mt-4">
            {docSlots.length && docSlots[slotIndex].map((item,index)=>(
              <p  onClick={() => setSlotTime(item.time)}  className={`text-sm font-light flex-shrink-0 px-5 py-2 rounded-full cursor-pointer ${item.time === slotTime ? 'bg-[#5f6FFF] text-white ' : 'text-gray-400 border border-gray-300'}`} key={index}>
                {item.time.toLowerCase()}
              </p>
            ))}
          </div>
            <button onClick={bookAppointment } className="my-6 bg-[#5f6FFF] text-white py-3 px-14 rounded-full flex items-center cursor-pointer gap-2">
              Book an appointment
            </button>
        </div>
        {/*----Related Doctors ----*/}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appoinment;

