import Navbar from "@/components/Navbar";
import { Outlet } from "react-router-dom";

const Mainlayout = () => {
  return (
    <div className="w-screen min-h-screen p-10 flex justify-center items-start">
      <div
        className="rounded-2xl bg-inner-background w-full min-h-HeightInner-container
        p-7 shadow-[0_0_30px_0_rgba(0,0,0,0.12)]
        flex flex-row gap-3"
      >
        <Navbar />

        {/* IMPORTANT */}
        <main className="flex-1 h-full flex">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Mainlayout;
