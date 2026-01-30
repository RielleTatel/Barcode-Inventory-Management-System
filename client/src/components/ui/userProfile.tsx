import { useAuth } from "../../context/AuthContext";

const userProfile = () => { 

  // Get position badge color
  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'admin': 
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'staff':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const { user } = useAuth(); 

  const currentUser = user ? {
  name: user.name || "Gabrielle Tatel",
  email: user.email || "user@adzu.edu.ph",
  position: user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User",
  status: "online" 
  } : {
    name: "Loading...",
    email: "...",
    position: "User",
    status: "online" 
  };
  

  return(
    <>
      <div className="w-full bg-inner-background h-25 rounded-[10px] flex flex-row items-center px-2 gap-1 justify-center">
        <div className="w-15 h-15 rounded-full bg-white flex items-center justify-center overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">

          </div>
        </div>
        <div className="leading-none text-left ml-2 text-text-color">
          <div className="flex flex-col"> 
            <span className="text-[13px] font-bold mb-1"> {currentUser.name} </span>
            <span className="text-[11px]"> {currentUser.email} </span>
            <div
              className={`mt-1 inline-flex w-fit items-center px-2 py-0.5 
                          rounded-full text-[10px] font-medium border 
                          ${getPositionColor(currentUser.position)}`}
            >
              {currentUser.position}
            </div>
          </div>
          
        </div>  
      </div> 
    </>
  )
}

export default userProfile; 