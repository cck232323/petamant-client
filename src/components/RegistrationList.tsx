import React from 'react';

interface Registration {
  id?: number;
  petInfo: string;
}

interface RegistrationListProps {
  show: boolean;
  toggle: () => void;
  registrations: Registration[];
}

const RegistrationList: React.FC<RegistrationListProps> = ({ show, toggle, registrations }) => (
  <>
    <div className="d-flex align-items-center mt-4">
      <h4 className="mb-0 me-2">Registered Pets</h4>
      <button 
        className="btn btn-sm btn-outline-secondary d-flex align-items-center"
        onClick={toggle}
      >
        <span className="me-1">{show ? 'Hide' : 'Show'}</span>
        <span className="badge bg-secondary me-1">{registrations.length}</span>
        <i className={`bi bi-chevron-${show ? 'up' : 'down'}`}></i>
      </button>
    </div>

    {Array.isArray(registrations) && registrations.length > 0 ? (
      <div className={`collapse ${show ? 'show' : ''}`}>
        <ul className="list-group">
          {registrations.map((reg: any, index: number) => {
            let petInfo = { name: '', type: '' };
            if (reg && reg.petInfo && typeof reg.petInfo === 'string') {
              try {
                petInfo = JSON.parse(reg.petInfo);
              } catch (e) {
                console.warn('Failed to parse pet info:', reg.petInfo);
              }
            }
            
            const petName = petInfo.name || 'Unknown Pet';
            const petType = petInfo.type || 'Unknown Type';
            
            return (
              <li className="list-group-item" key={reg?.id || `registration-${index}`}>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{petName}</strong> 
                    <span className="badge bg-info ms-2">{petType}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    ) : (
      <p>No registrations yet.</p>
    )}
  </>
);

export default RegistrationList;