import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoutes";

const Mainlayout = () => {
  return (
    <ProtectedRoute>
      <div className="w-screen min-h-screen p-10 flex justify-center items-start">
        <div
          className="rounded-2xl bg-inner-background w-full min-h-HeightInner-container
          p-7 shadow-[0_0_30px_0_rgba(0,0,0,0.12)]
          flex flex-row gap-3 items-stretch"
        >
          <Navbar />

          <main className="flex-1 flex">
            <Outlet />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Mainlayout;
