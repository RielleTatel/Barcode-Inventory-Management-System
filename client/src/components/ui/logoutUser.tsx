import { useState } from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button"; 

export const LogoutUser = () => { 

  const navigate = useNavigate();
  const { logout } = useAuth(); 

  const [logoutDialog, setLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setLogoutDialog(true); 
  };  

  const handleCancelLogout = () => {
    setLogoutDialog(false);
  }; 

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true); 
    try {

      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      
      await logout();
      
      setLogoutDialog(false);
      
      navigate("/login", { replace: true });
    } catch (error: unknown) {
      console.error("Logout error:", error);

      localStorage.removeItem('access_token');
      localStorage.removeItem('user');
      sessionStorage.clear();
      setLogoutDialog(false);
      navigate("/login", { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <> 
      {/* Logout Button */}
      <div
        onClick={handleLogoutClick}
        className="group text-[13px] w-full h-11.25 rounded-[14px] flex justify-start items-center gap-x-3 transition-all cursor-pointer hover:bg-[#507ADC] hover:shadow-md"
      >
        <LogOut
          className="ml-7 w-4 h-4 transition-colors text-text-color group-hover:text-white"
        />
        <p className="font-semibold transition-colors text-text-color group-hover:text-white">
          Logout
        </p>
      </div>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialog} onOpenChange={(open) => !open && handleCancelLogout()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="w-5 h-5" />
              Confirm Logout
            </DialogTitle>
            <DialogDescription className="pt-4">
              Are you sure you want to logout?
              <br />
              <br />
              You will need to login again to access the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={handleCancelLogout}
              disabled={isLoggingOut}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmLogout}
              disabled={isLoggingOut}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isLoggingOut ? "Logging out..." : "Logout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> 
    </>
  );
};

export default LogoutUser;