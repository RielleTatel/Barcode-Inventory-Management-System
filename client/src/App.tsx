import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Mainlayout from "./layouts/Mainlayout";
import DashboardPage1 from './pages/Dashboard/DashboardPage1';
import BranchDashboard from './pages/Dashboard/BranchDashboard';
import Catering from './pages/Catering';
import Inventory from './pages/Inventory';
import MenusAndRecipes from './pages/MenusAndRecipes';
import Supply from './pages/Supply';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes under shared layout */}
          <Route element={<Mainlayout />}>

            <Route index element={<Inventory />} />

            {/* Global overview dashboard */}
            <Route path="dashboard" element={<DashboardPage1 />} />

            {/* Dynamic branch dashboard — /dashboard/branch/1, /dashboard/branch/2, etc. */}
            <Route path="dashboard/branch/:branchId" element={<BranchDashboard />} />

            <Route path="menus-recipes" element={<MenusAndRecipes />} />
            <Route path="supply"        element={<Supply />} />
            <Route path="catering"      element={<Catering />} />
            <Route path="admin"         element={<AdminPanel />} />

          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
