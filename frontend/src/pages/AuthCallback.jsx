import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setToken, setUser, fetchProfile } = useAuthStore();

  useEffect(() => {
    const handleOAuthCallback = async () => {
      const token = searchParams.get('token');
      const provider = searchParams.get('provider');
      const error = searchParams.get('error');

      if (error) {
        navigate('/login?error=Authentication failed. Please try again.');
        return;
      }

      if (token) {
        // Store token
        localStorage.setItem('token', token);
        setToken(token);

        // Fetch user profile
        try {
          await fetchProfile();
          navigate('/');
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          navigate('/login?error=Failed to complete authentication');
        }
      } else {
        navigate('/login?error=No authentication token received');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, setToken, setUser, fetchProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
