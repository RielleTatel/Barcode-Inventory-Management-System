import { NavLink, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import UserProfile from "./ui/userProfile";
import {
  LayoutDashboard,
  ChefHat,
  Package,
  UtensilsCrossed,
  Truck,
  Settings,
  ShieldCheck,
  Store,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import LogoutUser from "./ui/logoutUser";
import { fetchBranches } from "@/components/inventory/api";
import { INVENTORY_QUERY_KEYS } from "@/components/inventory";

type NavItem = {
  path: string;
  label: string;
  icon: LucideIcon;
};

const navItems: NavItem[] = [
  { path: "/dashboard",     label: "Overview",          icon: LayoutDashboard },
  { path: "/",              label: "Inventory",          icon: Package },
  { path: "/catering",      label: "Catering",           icon: ChefHat },
  { path: "/menus-recipes", label: "Menus & Recipes",    icon: UtensilsCrossed },
  { path: "/supply",        label: "Supply",             icon: Truck },
];

const navSettings: NavItem[] = [
  { path: "/admin",    label: "Admin",   icon: ShieldCheck },
  { path: "/settings", label: "Settings", icon: Settings },
];

const NavLinkItem = ({ item, indent = false }: { item: { path: string; label: string; icon: LucideIcon }; indent?: boolean }) => {
  const Icon = item.icon;
  return (
    <NavLink to={item.path} end={item.path === "/"}>
      {({ isActive }) => (
        <div
          className={`group text-[13px] w-full h-11 rounded-[14px] flex justify-start items-center gap-x-3 transition-all cursor-pointer
            ${isActive ? "bg-[#507ADC] text-white shadow-md" : "hover:bg-[#507ADC] hover:shadow-md"}
            ${indent ? 'pl-3' : ''}
          `}
        >
          <Icon
            className={`${indent ? 'ml-10' : 'ml-7'} w-4 h-4 transition-colors shrink-0
              ${isActive ? "text-white" : "text-text-color group-hover:text-white"}
            `}
          />
          <p className={`font-semibold transition-colors truncate
            ${isActive ? "text-white" : "text-text-color group-hover:text-white"}
          `}>
            {item.label}
          </p>
        </div>
      )}
    </NavLink>
  );
};

const Navbar = () => {
  const location = useLocation();

  const { data: branches = [] } = useQuery({
    queryKey: INVENTORY_QUERY_KEYS.BRANCHES,
    queryFn: fetchBranches,
    staleTime: 5 * 60 * 1000,
  });

  const isDashboardActive = location.pathname.startsWith('/dashboard');

  return (
    <div className="shadow-md h-auto min-h-full w-70 bg-white rounded-[40px] p-5 flex flex-col gap-1 font-sans text-text-color self-stretch border border-[#E5E5E5]">

      <UserProfile />

      <nav className="flex flex-col flex-1 overflow-y-auto">

        {/* Main menu */}
        <div className="w-full mt-4 mb-2 text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-text-blur">Main Menu</p>
        </div>

        <div className="flex flex-col gap-1">
          {navItems.map(item => (
            <NavLinkItem key={item.path} item={item} />
          ))}
        </div>

        {/* Branch dashboards section — only shown when branches exist */}
        {branches.length > 0 && (
          <>
            <div className="w-full mt-5 mb-2 text-left flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-wide text-text-blur">Branch Dashboards</p>
              <Store className="w-3.5 h-3.5 text-text-blur" />
            </div>

            <div className="flex flex-col gap-1">
              {branches.map(branch => {
                const branchPath = `/dashboard/branch/${branch.id}`;
                const isActive = location.pathname === branchPath;
                return (
                  <NavLink key={branch.id} to={branchPath}>
                    <div
                      className={`group text-[12px] w-full h-10 rounded-[12px] flex justify-start items-center gap-x-2 transition-all cursor-pointer pl-3
                        ${isActive ? "bg-[#507ADC] text-white shadow-md" : "hover:bg-[#EEF2FF]"}
                      `}
                    >
                      <span
                        className={`ml-8 w-1.5 h-1.5 rounded-full shrink-0 transition-colors
                          ${isActive ? "bg-white" : "bg-gray-300 group-hover:bg-[#507ADC]"}
                        `}
                      />
                      <p className={`font-medium truncate transition-colors
                        ${isActive ? "text-white" : "text-gray-500 group-hover:text-[#507ADC]"}
                      `}>
                        {branch.name}
                      </p>
                      <ChevronRight
                        className={`w-3 h-3 ml-auto mr-2 shrink-0 transition-colors
                          ${isActive ? "text-white" : "text-gray-300 group-hover:text-[#507ADC]"}
                        `}
                      />
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </>
        )}

        {/* Settings */}
        <div className="w-full mt-5 mb-2 text-left">
          <p className="text-xs font-bold uppercase tracking-wide text-text-blur">Settings</p>
        </div>

        <div className="flex flex-col gap-1">
          {navSettings.map(item => (
            <NavLinkItem key={item.path} item={item} />
          ))}
          <LogoutUser />
        </div>

      </nav>
    </div>
  );
};

export default Navbar;
