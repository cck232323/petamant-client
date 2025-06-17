import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RegistrationService } from '../api/registrationService';
import { ActivityService } from '../api/activityService';
import { AuthService } from '../api/authService';

const ActivityRegistrationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [activityTitle, setActivityTitle] = useState<string>('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petDescription, setPetDescription] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

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

  // Check authentication and fetch activity details
  useEffect(() => {
    const checkAuthAndFetchActivity = async () => {
      // Check authentication
      if (!AuthService.isAuthenticated()) {
        navigate('/login', { 
          state: { returnUrl: `/register-activity/${id}` }
        });
        return;
      }

      // Fetch activity details
      if (id) {
        try {
          const activityData = await ActivityService.getActivityById(parseInt(id));
          setActivityTitle(activityData.title);

          // Check if user is already registered for this activity
          const userId = AuthService.getUserId();
          if (userId) {
            const registrations = await RegistrationService.getUserRegistrations(userId);
            const isUserRegistered = registrations.some(registration => registration.activityId === parseInt(id));
            setIsRegistered(isUserRegistered);
          }
        } catch (err) {
          console.error('Failed to fetch activity details:', err);
          setError('Failed to load activity details');
        }
      } else {
        setError('Activity ID is missing');
        setTimeout(() => navigate('/activities'), 2000);
      }
    };
    
    checkAuthAndFetchActivity();
  }, [id, navigate]);

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

    const userId = AuthService.getUserId();
    if (!userId) {
      setError('User not authenticated. Please login again.');
      setLoading(false);
      setTimeout(() => {
        navigate('/login', { state: { returnUrl: `/register-activity/${id}` } });
      }, 2000);
      return;
    }

    try {
      console.log('Sending registration request...');
      await RegistrationService.registerForActivity({
        activityId: parseInt(id!),
        userId,
        petInfo: JSON.stringify({ 
          name: petName, 
          type: petType,
          age: petAge,
          description: petDescription
        })
      });
      
      console.log('Registration successful!');
      // Show success message and redirect back to activity detail
      setError(null);
      alert('Registration successful!');
      navigate(`/activities/${id}`);
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

  const handleCancel = () => {
    navigate(`/activities/${id}`);
  };

  if (isRegistered) {
    return (
      <div className="container mt-4">
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card">
              <div className="card-header">
                <h5 className="card-title mb-0">Already Registered for Activity: {activityTitle}</h5>
              </div>
              <div className="card-body">
                <p>You have already registered for this activity.</p>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  Back to Activity Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Register for Activity: {activityTitle}</h5>
            </div>
            
            <div className="card-body">
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
                    onClick={handleCancel}
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
        </div>
      </div>
    </div>
  );
};

export default ActivityRegistrationPage;