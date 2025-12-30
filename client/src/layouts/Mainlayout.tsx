import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";

const Mainlayout = () => {
  return (
    <div className="w-screen min-h-screen p-10 flex justify-center items-center">
        <div className="rounded-2xl bg-inner-background w-full min-h-HeightInner-container 
        p-7 shadow-[0_0_30px_0_rgba(0,0,0,0.12)] flex justify-center items-center flex-row gap-3"> 
            <Navbar/> 
            <main className="flex-1"> 
                <Outlet/>
            </main> 
        </div>
    </div> 
  );
};


export default Mainlayout; 

