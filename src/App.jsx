import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import MyProfile from './pages/MyProfile';
import MyAppointment from './pages/MyAppointment';
import Appointment from './pages/Appoinment';
import Doctors from './pages/Doctors';
import VideoConsultation from './pages/VideoConsultation';
import Prescriptions from './pages/Prescriptions';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <div className='mx-4 sm:mx-[10%] min-h-screen flex flex-col justify-between'>
      <div>
        <ToastContainer />
        <Navbar />

        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/about' element={<About />} />
          <Route path='/contact' element={<Contact />} />
          <Route path='/doctors' element={<Doctors />} />
          <Route path='/doctors/:speciality' element={<Doctors />} />
          <Route path='/login' element={<Login />} />
          <Route path='/my-profile' element={<MyProfile />} />
          <Route path="/my-appointments" element={<MyAppointment />} />
          <Route path='/prescriptions' element={<Prescriptions />} />
          <Route path='/consultation/:appointmentId' element={<VideoConsultation />} />
          <Route path='/appointment/:docId' element={<Appointment />} />
          <Route path='*' element={<Home />} />
        </Routes>
      </div>

      {/* Global AI Assistant Floating Widget */}
      <AIChatbot />

      <Footer />
    </div>
  );
};

export default App;
