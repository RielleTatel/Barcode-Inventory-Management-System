interface InfoFieldProps {
  label: string;
  value: string | number | React.ReactNode;
  className?: string;
}

const InfoField = ({ label, value, className = "" }: InfoFieldProps) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</label>
      <div className="text-base text-gray-900 font-medium">
        {value}
      </div>
    </div>
  );
};

export default InfoField;
