import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import axios from 'axios';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
  });

    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.password !== formData.password2) {
      newErrors.password2 = "Passwords don't match";
    }

    if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try { 
      await axios.post(
        'http://localhost:8000/api/auth/register/',
        formData
      );

      setLoading(false);

      navigate('/login', {
        state: {
          message:
            'Registration successful! Please wait for admin approval before logging in.',
        },
      });
    } catch (error: unknown) {
      setLoading(false);

      if (axios.isAxiosError(error)) {
        const data = error.response?.data;

        if (typeof data === 'object' && data !== null) {
          const fieldErrors: Record<string, string> = {};

          for (const key in data) {
            fieldErrors[key] = Array.isArray(data[key])
              ? data[key][0]
              : String(data[key]);
          }

          setErrors(fieldErrors);
          return;
        }

        setErrors({ general: 'Registration failed.' });
      } else {
        setErrors({ general: 'An unexpected error occurred.' });
      }

      console.error('Registration error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Sign up to get started</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <Input
                id="first_name"
                name="first_name"
                type="text"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="John"
                className="w-full"
              />
            </div>

            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                Last Name
              </label>
              <Input
                id="last_name"
                name="last_name"
                type="text"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Doe"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username *
            </label>
            <Input
              id="username"
              name="username"
              type="text"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="johndoe"
              className="w-full"
            />
            {errors.username && (
              <p className="text-red-600 text-sm mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password *
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full"
            />
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div>
            <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password *
            </label>
            <Input
              id="password2"
              name="password2"
              type="password"
              required
              value={formData.password2}
              onChange={handleChange}
              placeholder="Confirm your password"
              className="w-full"
            />
            {errors.password2 && (
              <p className="text-red-600 text-sm mt-1">{errors.password2}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>

          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in here
            </Link>
          </div>
        </form>
      </Card>
    </div>
  );
}
