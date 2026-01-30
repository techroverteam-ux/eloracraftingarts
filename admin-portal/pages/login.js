import { useState } from 'react';
import { useAuth } from '../hooks/useApi';
import { Button, Input, Card } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('admin@eloraart.com');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(email, password);
      if (result.success) {
        window.location.href = '/';
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎨 Elora Art
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            Admin Portal
          </h2>
          <p className="text-gray-600">
            Sign in to manage your platform
          </p>
        </div>

        <Card className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Demo Credentials:</h3>
            <p className="text-sm text-blue-700">
              <strong>Email:</strong> admin@eloraart.com<br />
              <strong>Password:</strong> admin123
            </p>
          </div>
        </Card>

        <div className="text-center text-sm text-gray-600">
          <p>
            {process.env.NEXT_PUBLIC_APP_NAME} v{process.env.NEXT_PUBLIC_APP_VERSION}
          </p>
          <p className="mt-1">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
}