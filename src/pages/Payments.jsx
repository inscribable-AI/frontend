import PaymentCard from '../components/cards/PaymentCard';

const Payments = () => {
  const payments = [
    {
      id: 'PAY-1234',
      date: '2024-02-15',
      amount: '299.99',
      status: 'completed',
      customer: 'Alex Thompson',
      type: 'credit'
    },
    {
      id: 'PAY-1235',
      date: '2024-02-14',
      amount: '199.50',
      status: 'pending',
      customer: 'Maria Garcia',
      type: 'paypal'
    },
    {
      id: 'PAY-1236',
      date: '2024-02-14',
      amount: '599.99',
      status: 'failed',
      customer: 'James Wilson',
      type: 'bank'
    },
    {
      id: 'PAY-1237',
      date: '2024-02-13',
      amount: '149.99',
      status: 'refunded',
      customer: 'Emma Davis',
      type: 'crypto'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Payments</h1>
        <div className="space-x-4">
          <button className="button button-secondary">
            Export
          </button>
          <button className="button button-primary">
            New Payment
          </button>
        </div>
      </div>

      <div className="card">
        <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div>
            <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>Total Revenue</p>
            <p className="text-2xl font-bold">$1,149.47</p>
          </div>
          <div>
            <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>Pending</p>
            <p className="text-2xl font-bold">$199.50</p>
          </div>
          <div>
            <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>Completed</p>
            <p className="text-2xl font-bold">$299.99</p>
          </div>
          <div>
            <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>Refunded</p>
            <p className="text-2xl font-bold">$149.99</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {payments.map((payment, index) => (
          <PaymentCard
            key={index}
            id={payment.id}
            date={payment.date}
            amount={payment.amount}
            status={payment.status}
            customer={payment.customer}
            type={payment.type}
          />
        ))}
      </div>
    </div>
  );
};

export default Payments;