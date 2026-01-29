import { NavLink } from "react-router-dom";
import UserProfile from "./ui/userProfile";
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
  ShieldCheck,
  Shield,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import LogoutUser from "./ui/logoutUser";

type NavItemVariant = "default" | "highlighted";

export type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
  variant?: NavItemVariant;
};

const Navbar = () => {

  const navItems: NavItem[] = [
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/dashboardPage1", label: "DashboardPage1", icon: Beef, variant: "highlighted" },
    { path: "/dashboardPage2", label: "DashboardPage2", icon: UtensilsCrossedIcon, variant: "highlighted" },
    { path: "/dashboardPage3", label: "DashboardPage3", icon: Soup, variant: "highlighted" },
    { path: "/", label: "Inventory", icon: Package },
    { path: "/catering", label: "Catering", icon: ChefHat },
    { path: "/menus-recipes", label: "Menus & Recipes", icon: UtensilsCrossed },
    { path: "/supply", label: "Supply", icon: Truck },
  ];

  const navSettings: NavItem[] = [
    { path: "/admin", label: "Admin", icon: Shield },
    { path: "/settings", label: "Setting", icon: Settings },
  ]

  return (
    <div className="shadow-md h-auto min-h-full w-70 bg-white rounded-[40px] p-5 flex flex-col gap-1 font-sans text-text-color self-stretch border border-[#E5E5E5]">

    <UserProfile/> 
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
                  <div
                    className={`group text-[13px] w-full h-11.25 rounded-[14px] flex justify-start items-center gap-x-3 transition-all cursor-pointer 
                      ${isActive ? "bg-[#507ADC] text-white shadow-md" : "hover:bg-[#507ADC] hover:shadow-md"}
                    `}
                  >
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

        <div className="w-full mt-6 mb-2 text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-text-blur">
            Settings
          </p>
        </div>

        <div className="flex flex-col gap-1">
          {navSettings.map((item) => {
            const Icon = item.icon;
            const isHighlighted = item.variant === "highlighted";
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                >
                  {({ isActive }) => (
                    <div
                      className={`group text-[13px] w-full h-11.25 rounded-[14px] flex justify-start items-center gap-x-3 transition-all cursor-pointer 
                        ${isActive ? "bg-[#507ADC] text-white shadow-md" : "hover:bg-[#507ADC] hover:shadow-md"}
                      `}
                    >
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
          <LogoutUser />
        </div> 
      </nav>
    </div>
  );
};

export default Navbar;
