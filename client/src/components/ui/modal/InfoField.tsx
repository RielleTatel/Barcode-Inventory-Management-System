interface InfoFieldProps {
  label: string;
  value: string | number | React.ReactNode;
  className?: string;
}

const InfoField = ({ label, value, className = "" }: InfoFieldProps) => {
  return (
    <div className={`space-y-1 ${className}`}>
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="text-base text-gray-900 p-3 bg-gray-50 rounded-md border border-gray-200">
        {value}
      </div>
    </div>
  );
};

export default InfoField;
