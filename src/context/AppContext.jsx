import { createContext, useEffect, useState } from "react";
import axios from "axios";
import { toast} from "react-toastify";



export const AppContext = createContext()
const AppContextProvider = (props)=>{
    const currencySymbol='$'

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [doctors, setDoctors] = useState([])

    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false)

    const [userData, setUserData] = useState(false)

      
   

    const getDoctorsData = async ()=>{
        try {
            console.log('Fetching doctors from:', backendUrl + '/api/user/list-doctors');
            const {data} = await axios.get(backendUrl + '/api/user/list-doctors')
            console.log('API Response:', data);
            if(data.success){
                console.log('Doctors fetched:', data.doctors.length);
                setDoctors(data.doctors)

            }else{
                console.error('API Error:', data.message);
                toast.error(data.message)
            }
            
        } catch (error) {
          toast.error("Something went wrong while fetching doctors data")
          console.log(error)
            
        }
    }

    const loadUserProfileData = async ()=>{
        try {
            const {data} = await axios.get(backendUrl + '/api/user/get-profile',{
                headers:
                    {token}
                
            })
            if(data.success){
                setUserData(data.userData)
            }else{
                toast.error(data.message)
            }
            
        } catch (error) {
          toast.error("Something went wrong while fetching user data")
          console.log(error)
            
        }
    }

    const value = {
        doctors,getDoctorsData,
        currencySymbol,
        token,
        setToken,
        backendUrl,
        userData,
        setUserData,
        loadUserProfileData,
    }

    useEffect(()=>{
        getDoctorsData()
    },[ ])

    useEffect(()=>{
        if(token){
            loadUserProfileData()
        }else{
            setUserData(false)
        }
    }, [token])

    return(
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;

