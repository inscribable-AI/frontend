const IntegrationCard = ({ name, description, logo, beta }) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 flex items-center justify-center">
          {logo}
        </div>
        {beta && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            BETA
          </span>
        )}
      </div>

      <h3 className="text-lg font-medium text-gray-900 mb-2">{name}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      
      <a 
        href="#" 
        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
      >
        Read documentation
      </a>
    </div>
  );
};

export default IntegrationCard;