import React, { useState, useEffect } from 'react';
import { RegistrationService } from '../api/registrationService';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../api/authService';

interface RegistrationFormProps {
  activityId: number;
  onRegistrationComplete: () => void;
  onDirectSubmit?: (petName: string, petType: string, petAge: string, petDescription: string) => Promise<void>;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ 
  activityId, 
  onRegistrationComplete,
  onDirectSubmit
}) => {
  const navigate = useNavigate();
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petDescription, setPetDescription] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Pet type options
  const petTypes = [
    { value: '', label: 'Please select pet type' },
    { value: 'Dog', label: 'Dog' },
    { value: 'Cat', label: 'Cat' },
    { value: 'Bird', label: 'Bird' },
    { value: 'Rabbit', label: 'Rabbit' },
    { value: 'Fish', label: 'Fish' },
    { value: 'Reptile', label: 'Reptile' },
    { value: 'Other', label: 'Other' }
  ];

  // Check authentication status when component loads
  useEffect(() => {
    const checkAndFixAuth = async () => {
      AuthService.ensureAuthenticated();
      const authenticated = AuthService.isAuthenticated();
      const userId = AuthService.getUserId();
      
      console.log('RegistrationForm - Auth status:', authenticated);
      console.log('RegistrationForm - User ID:', userId);
      
      // Try to recover userId if missing
      if (authenticated && !userId) {
        console.log('Detected inconsistent auth state: token exists but no userId');
        
        // Try to recover from sessionStorage
        const sessionUserId = sessionStorage.getItem('userId');
        if (sessionUserId) {
          console.log('Recovered userId from sessionStorage:', sessionUserId);
          localStorage.setItem('userId', sessionUserId);
          setIsAuthenticated(true);
        } else {
          // If recovery fails, clear token and treat user as unauthenticated
          console.log('Could not recover userId, clearing token and treating user as unauthenticated');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(authenticated);
      }
    };
    
    checkAndFixAuth();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!petName.trim()) {
      setError('Pet name is required');
      return;
    }
    
    if (!petType) {
      setError('Pet type is required');
      return;
    }
    
    if (!agreeToTerms) {
      setError('You must agree to the activity rules and terms');
      return;
    }
    
    setError(null);
    setLoading(true);

    // Check if token is temporary
    const token = localStorage.getItem('token');
    console.log('Current token:', token);
    
    if (token && token.startsWith('temp-token-')) {
      setError('Your session has expired. Please login again to get a valid token.');
      setLoading(false);
      
      // Clear temporary token
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/login', { state: { returnUrl: window.location.pathname } });
      }, 2000);
      return;
    }
    
    // Debug user ID
    console.log('Current userId:', AuthService.getUserId());

    // If onDirectSubmit is provided, use it
    if (onDirectSubmit) {
      try {
        await onDirectSubmit(petName, petType, petAge, petDescription);
        onRegistrationComplete();
      } catch (err: any) {
        console.error('Registration failed:', err);
        setError(err.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Otherwise use the standard registration flow
    const userId = AuthService.getUserId();
    if (!userId) {
      // Try to recover userId from session storage
      const sessionUserId = sessionStorage.getItem('userId');
      if (sessionUserId) {
        localStorage.setItem('userId', sessionUserId);
        
        try {
          console.log('Sending registration request with recovered userId...');
          await RegistrationService.registerForActivity({
            activityId,
            userId: parseInt(sessionUserId),
            petInfo: JSON.stringify({ 
              name: petName, 
              type: petType,
              age: petAge,
              description: petDescription
            })
          });
          
          console.log('Registration successful!');
          onRegistrationComplete();
        } catch (err: any) {
          handleRegistrationError(err);
        } finally {
          setLoading(false);
        }
      } else {
        setError('User not authenticated. Please login again.');
        setLoading(false);
        setTimeout(() => {
          navigate('/login', { state: { returnUrl: window.location.pathname } });
        }, 2000);
      }
      return;
    }

    try {
      console.log('Sending registration request...');
      await RegistrationService.registerForActivity({
        activityId,
        userId,
        petInfo: JSON.stringify({ 
          name: petName, 
          type: petType,
          age: petAge,
          description: petDescription
        })
      });
      
      console.log('Registration successful!');
      onRegistrationComplete();
    } catch (err: any) {
      handleRegistrationError(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to handle registration errors
  const handleRegistrationError = (err: any) => {
    console.error('Registration error:', err);
    
    if (err.response && err.response.status === 401) {
      console.error('Authorization issue during activity registration');
      setError('Authorization issue. Please try again.');
    } else {
      // Handle other errors
      if (err.response && err.response.data) {
        console.error('Error response data:', err.response.data);
        if (typeof err.response.data === 'string') {
          setError(err.response.data);
        } else if (err.response.data.message) {
          setError(err.response.data.message);
        } else if (err.response.data.errors) {
          // Handle validation errors
          const errorMessages = [];
          for (const key in err.response.data.errors) {
            errorMessages.push(...err.response.data.errors[key]);
          }
          setError(errorMessages.join(', '));
        } else {
          setError('Registration failed. Please try again.');
        }
      } else {
        setError('An error occurred during registration. Please try again.');
      }
    }
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">Activity Registration</h5>
        <button type="button" className="btn-close" aria-label="Close"></button>
      </div>
      
      <div className="modal-body">
        <form onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}
          
          <div className="mb-3">
            <label htmlFor="petName" className="form-label">
              Pet Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              className="form-control"
              id="petName"
              placeholder="Enter your pet's name"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="petType" className="form-label">
              Pet Type <span className="text-danger">*</span>
            </label>
            <select
              className="form-select"
              id="petType"
              value={petType}
              onChange={(e) => setPetType(e.target.value)}
              required
            >
              {petTypes.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-3">
            <label htmlFor="petAge" className="form-label">
              Pet Age
            </label>
            <input
              type="text"
              className="form-control"
              id="petAge"
              placeholder="Enter your pet's age"
              value={petAge}
              onChange={(e) => setPetAge(e.target.value)}
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="petDescription" className="form-label">
              Pet Description <span className="text-danger">*</span>
            </label>
            <textarea
              className="form-control"
              id="petDescription"
              rows={3}
              placeholder="Describe your pet (personality, habits, etc.)"
              value={petDescription}
              onChange={(e) => setPetDescription(e.target.value)}
              required
            ></textarea>
          </div>
          
          <div className="mb-3 form-check">
            <input
              type="checkbox"
              className="form-check-input"
              id="agreeTerms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              required
            />
            <label className="form-check-label" htmlFor="agreeTerms">
              I agree to the activity rules and terms <span className="text-danger">*</span>
            </label>
          </div>
          
          <div className="d-flex justify-content-end gap-2">
            <button 
              type="button" 
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegistrationForm;
