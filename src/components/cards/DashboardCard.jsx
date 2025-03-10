const DashboardCard = ({ title, value, change }) => {
    const isPositive = change.startsWith('+');
    
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="mt-2 flex items-baseline">
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          <p className={`ml-2 flex items-baseline text-sm font-semibold ${
            isPositive ? 'text-green-600' : 'text-red-600'
          }`}>
            {change}
          </p>
        </div>
        <div className="mt-4">
          <div className="h-1 w-full bg-gray-200 rounded">
            <div 
              className={`h-1 rounded ${isPositive ? 'bg-green-500' : 'bg-red-500'}`}
              style={{ width: `${Math.abs(parseFloat(change))}%` }}
            />
          </div>
        </div>
      </div>
    );
  };
  
  export default DashboardCard;