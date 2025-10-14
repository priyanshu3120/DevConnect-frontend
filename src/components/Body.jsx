import { Outlet, useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";
import {useEffect } from "react";
import axios from "axios";

const Body = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userData = useSelector((store) => store.user);

  const fetchUser = async () => {
    if(userData) return;
    try{
         const res = await axios.get(BASE_URL + "/profile/view", {
          withCredentials: true,
         });
         dispatch(addUser(res.data));
    }
    catch(err){
      if(err.status === 401){
        navigate("/login");
      }
      console.error(err);
    }
  };
  useEffect(() => {
    fetchUser();
  },[]);
  return (
    <div>
        <NavBar/>
        <Outlet/>
        <Footer/>
    </div>
    );
};
export default Body;