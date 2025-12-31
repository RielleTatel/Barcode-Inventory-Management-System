import { NavLink } from "react-router-dom";
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
    const navItems = [
        { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { path: "/dashboardPage1", label: "DashboardPage1", icon: Beef, variant: "highlighted" },
        { path: "/dashboardPage2", label: "DashboardPage2", icon: UtensilsCrossedIcon, variant: "highlighted" },
        { path: "/dashboardPage3", label: "DashboardPage3", icon: Soup, variant: "highlighted" },
        { path: "/", label: "Inventory", icon: Package },
        { path: "/catering", label: "Catering", icon: ChefHat },
        { path: "/menus-recipes", label: "Menus & Recipes", icon: UtensilsCrossed },
        { path: "/supply", label: "Supply", icon: Truck },
    ];

    return (
        <div className="h-full min-h-HeightInner-container w-70 bg-white rounded-[40px] p-5 flex flex-col gap-1 font-sans text-text-color">

            {/* Profile Section */}
            <div className="w-full bg-inner-background h-25 rounded-[10px] flex flex-row items-center px-2 gap-1 justify-center"> 
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
                        const isHighlighted = item.variant === "highlighted"; 
                        
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={item.path === "/"}
                              >
                                {({ isActive }) => (
                                    <div className={`group text-[13px] w-full h-11.25 rounded-[14px] flex justify-start items-center gap-x-3 transition-all cursor-pointer 
                                      ${isActive ? "bg-text-highlight text-white shadow-md" : "hover:bg-text-highlight hover:shadow-md"}
                                    `}>
                                        <Icon
                                            className={`ml-7 w-4 h-4 transition-colors 
                                              ${isActive ? "text-white" : "text-text-color group-hover:text-white"}
                                              ${isHighlighted ? "ml-15" : ""}
                                              `}
                                        /> 
                                        <p
                                            className={`font-semibold transition-colors 
                                            ${isActive ? "text-white" : "text-text-color group-hover:text-white"}
   
                                          `}
                                        >
                                            {item.label}
                                        </p>
                                    </div>
                                )}
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
                    >

                        {({ isActive }) => (
                          <div className={`group text-[13px] w-full h-11.25 rounded-[14px] flex justify-start items-center gap-x-3 transition-all cursor-pointer 
                              ${isActive ? "bg-text-highlight text-white shadow-md" : "hover:bg-text-highlight hover:shadow-md"} 
                          `}> 
                            <Settings
                                className={`ml-7 w-4 h-4 transition-colors 
                                    ${isActive ? "text-white" : "text-text-color group-hover:text-white"}
                                `}
                            /> 
                            <p
                                className={`font-semibold transition-colors 
                                    ${isActive ? "text-white" : "text-text-color group-hover:text-white"}
                                `}
                            >
                                Settings
                            </p>
                          </div>
                        )} 
                    </NavLink> 
                    
                    <NavLink
                        to="/Logout"
                    >
                        {({ isActive }) => (
                          <div className={`group text-[13px] w-full h-11.25 rounded-[14px] flex justify-start items-center gap-x-3 transition-all cursor-pointer 
                              ${isActive ? "bg-text-highlight text-white shadow-md" : "hover:bg-text-highlight hover:shadow-md"} 
                          `}> 
                            <LogOut
                                className={`ml-7 w-4 h-4 transition-colors 
                                    ${isActive ? "text-white" : "text-text-color group-hover:text-white"}
                                `}
                            /> 
                            <p
                                className={`font-semibold transition-colors 
                                    ${isActive ? "text-white" : "text-text-color group-hover:text-white"}
                                `}
                            >
                                Logout
                            </p>
                          </div>
                        )} 
                    </NavLink> 
                    

                </div>
            </nav> 
        </div>
    )
}

export default Navbar; 