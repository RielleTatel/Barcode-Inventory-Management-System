import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Mainlayout from "./layouts/Mainlayout";
import DashboardPage1 from './pages/Dashboard/DashboardPage1';
import DashboardPage2 from './pages/Dashboard/DashboardPage2';
import DashboardPage3 from './pages/Dashboard/DashboardPage3';

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route element={<Mainlayout />}>
            <Route path="/" element={<DashboardPage1/>} />
            <Route path="/" element={<DashboardPage2/>} />
            <Route path="/" element={<DashboardPage3/>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
