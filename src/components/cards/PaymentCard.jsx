const PaymentCard = ({ id, date, amount, status, customer, type }) => {
    const statusClass = {
      completed: 'status-green',
      pending: 'status-yellow',
      failed: 'status-red',
      refunded: 'status-gray'
    };
  
    const typeIcons = {
      credit: '💳',
      paypal: '🅿️',
      bank: '🏦',
      crypto: '₿'
    };
  
    const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };
  
    return (
      <div className="card">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-white rounded-lg" style={{ border: '1px solid #e5e7eb' }}>
              <span style={{ fontSize: '1.25rem' }}>{typeIcons[type]}</span>
            </div>
            <div>
              <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>#{id}</p>
              <p style={{ fontWeight: 500 }}>{customer}</p>
              <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>{formatDate(date)}</p>
            </div>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 500, marginBottom: '0.5rem' }}>${amount}</p>
            <span className={`status ${statusClass[status]}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </div>
    );
  };
  
  export default PaymentCard;