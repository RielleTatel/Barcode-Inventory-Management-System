import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Mainlayout from "./layouts/Mainlayout";
import DashboardPage1 from './pages/Dashboard/DashboardPage1';
import DashboardPage2 from './pages/Dashboard/DashboardPage2';
import DashboardPage3 from './pages/Dashboard/DashboardPage3';
import Catering from './pages/Catering';
import Inventory from './pages/Inventory';
import MenusAndRecipes from './pages/MenusAndRecipes'; 
import Supply from './pages/Supply';
import { Settings } from 'lucide-react';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>

          <Route element={<Mainlayout />}>

            <Route 
              index 
              element={<Inventory />} 
            />

            <Route 
              path="dashboard" 
              element={<DashboardPage1/>} 
            />

            <Route 
              path="dashboardPage1" 
              element={<DashboardPage1/>} 
            />

            <Route 
              path="dashboardPage2" 
              element={<DashboardPage2/>} 
            />

            <Route 
              path="dashboardPage3" 
              element={<DashboardPage3/>} 
            /> 

            <Route 
              path="menus-recipes" 
              element={<MenusAndRecipes/>}
            /> 

            <Route 
              path="supply" 
              element={<Supply/>}
            /> 
            
            <Route 
              path="catering" 
              element={<Catering/>}
            /> 

            <Route 
              path="settings" 
              element={<Settings/>}
            />

          </Route> 
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
