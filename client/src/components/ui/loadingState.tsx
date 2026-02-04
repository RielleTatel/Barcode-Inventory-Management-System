import { Activity } from "lucide-react";

const LoadingState = () => {
  return (
    <>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: '#0033A0' }} />
          <p className="text-gray-600">Loading health data...</p>
        </div>
      </div>
    </>
  )
}; 

export default LoadingState; 