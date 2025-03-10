const TeamCard = ({ name, role, email, avatar, status }) => {
    const statusColors = {
      online: '#22c55e',  // green
      offline: '#9ca3af', // gray
      busy: '#ef4444',    // red
      away: '#eab308'     // yellow
    };
  
    return (
      <div className="card">
        <div className="flex items-center space-x-4">
          <div style={{ position: 'relative' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: '50%',
              backgroundColor: '#f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem'
            }}>
              {avatar || name.charAt(0)}
            </div>
            <span style={{
              position: 'absolute',
              bottom: '0',
              right: '0',
              width: '0.75rem',
              height: '0.75rem',
              borderRadius: '50%',
              backgroundColor: statusColors[status],
              border: '2px solid white'
            }} />
          </div>
          
          <div className="flex-1">
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: '#111827' }}>{name}</h3>
            <p className="text-gray-500">{role}</p>
            <p className="text-gray-500">{email}</p>
          </div>
  
          <div className="space-x-4">
            <button className="button button-secondary" style={{ padding: '0.5rem' }}>
              ✉️
            </button>
            <button className="button button-secondary" style={{ padding: '0.5rem' }}>
              ⚙️
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  export default TeamCard;