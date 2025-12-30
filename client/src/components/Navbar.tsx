import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { 
    LayoutDashboard, 
    ChefHat, 
    Package,
    UtensilsCrossed,
    Truck, 
    Settings,
    Beef, 
    Soup, 
    UtensilsCrossedIcon, 
    LogOut 
} from 'lucide-react'; 


const Navbar = () => {  
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(location.pathname);

    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/dashboard", label: "DashboardPage1", icon: Beef, variant: "highlighted" },
        { path: "/dashboard", label: "DashboardPage2", icon: UtensilsCrossedIcon, variant: "highlighted" },
        { path: "/dashboard", label: "DashboardPage3", icon: Soup, variant: "highlighted" },
        { path: "/inventory", label: "Inventory", icon: Package },
        { path: "/catering", label: "Catering", icon: ChefHat },
        { path: "/menus-recipes", label: "Menus & Recipes", icon: UtensilsCrossed },
        { path: "/supply", label: "Supply", icon: Truck },
    ];

    const handleNavClick = (path: string) => {
        setActiveTab(path);
    }; 

    return (
        <div className="h-full min-h-[770px] w-[280px] bg-white rounded-[40px] p-5 flex flex-col gap-1 font-sans text-text-color">

            {/* Profile Section */}
            <div className="w-full bg-inner-background h-[100px] rounded-[10px] flex flex-row items-center px-2 gap-1 justify-center"> 
                <div className="w-15 h-15 rounded-full bg-white flex items-center justify-center overflow-hidden"> 
                    <img src="" alt="" className="w-full h-full "/> 
                </div> 
                <div className="flex flex-col leading-none text-left ml-2 text-text-color">
                    <span className="text-[13px] font-bold mb-1">Barcode Restaurant</span>
                    <span className="text-[11px]">Barcode@gmail.com</span>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="flex flex-col flex-1">
                <div className="w-full mt-4 mb-2 text-left">
                    <p className="text-xs font-bold uppercase tracking-wide text-text-blur">
                        Main Menu
                    </p>
                </div>   

                <div className="flex flex-col gap-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = activeTab === item.path;
                        const isHighlighted = item.variant === "highlighted"; 
                        
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => handleNavClick(item.path)}
                                className={`text-[13px] w-full h-[45px] rounded-[14px] flex justify-start items-center gap-x-3 hover:bg-text-highlight hover:text-white hover:shadow-md transition-all cursor-pointer 
                                  ${isHighlighted && "ml-5"}
                                  ${isActive && "bg-text-highlight text-white shadow-md"}
                                  ${!isActive && "hover:bg-text-highlight hover:text-white hover:shadow-md"}
                                `}
                            >
                                <Icon
                                    className={`ml-7 w-4 h-4 transition-colors ${
                                        isActive ? "text-white" : "text-text-color"
                                    }`}
                                /> 
                                <p
                                    className={`font-semibold transition-colors ${
                                        isActive ? "text-white" : "text-text-color"
                                    }`}
                                >
                                    {item.label}
                                </p> 
                            </NavLink>
                        );
                    })}
                </div>

                {/* Settings Section */}
                <div className="w-full mt-6 mb-2 text-left">
                    <p className="text-xs font-bold uppercase tracking-wide text-text-blur">
                        Settings
                    </p>
                </div>

                <div className="flex flex-col gap-1">
                    <NavLink
                        to="/settings"
                        onClick={() => handleNavClick("/settings")}
                        className={`text-[13px] w-full h-[45px] rounded-[14px] flex justify-start items-center gap-x-3 hover:bg-text-highlight hover:text-white hover:shadow-md transition-all cursor-pointer ${
                            activeTab === "/settings" ? "bg-text-highlight text-white shadow-md" : "bg-transparent"
                        }`}
                    >
                        <Settings
                            className={`ml-7 w-4 h-4 transition-colors ${
                                activeTab === "/settings" ? "text-white" : "text-text-color"
                            }`}
                        /> 
                        <p
                            className={`font-semibold transition-colors ${
                                activeTab === "/settings" ? "text-white" : "text-text-color"
                            }`}
                        >
                            Settings
                        </p> 
                    </NavLink>
                </div>
            </nav> 
        </div>
    )
}

export default Navbar; 