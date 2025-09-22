'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User as UserIcon, 
  LogIn, 
  UserPlus,
  Gift
} from '../../components/icons';

import { useCart } from '@/contexts/CartProvider2';

// Move enum inside component to avoid Next.js export issues
const AUTH_VIEW = {
  SIGN_IN: "sign-in",
  REGISTER: "register",
} as const;

export default function AuthPage() {
  const [currentView, setCurrentView] = useState<typeof AUTH_VIEW[keyof typeof AUTH_VIEW]>(AUTH_VIEW.SIGN_IN);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasRedirected, setHasRedirected] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  });

  const { login, register, isAuthenticated, loading } = useAuth();
  const {transferCartForLoggedUser} = useCart()
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check if user is already authenticated - improved logic
  useEffect(() => {
    if (!loading && isAuthenticated && !hasRedirected) {
      setHasRedirected(true);
      const redirectTo = searchParams.get('redirect') || '/gift-cards';
      console.log('Auth page: User already authenticated, redirecting to:', redirectTo);
      router.push(redirectTo);
    }
  }, [isAuthenticated, loading, router, searchParams, hasRedirected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isLoading) {
      console.log('Login already in progress, ignoring additional clicks');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      console.log('Auth Page: Starting login attempt for:', formData.email);
      
      const success = await login(formData.email, formData.password);
      
      if (success) {
        console.log('Auth Page: Login successful, preparing redirect');
        setHasRedirected(true);
        transferCartForLoggedUser()
        
        const redirectTo = searchParams.get('redirect') || '/gift-cards';
        console.log('Auth Page: Redirecting to:', redirectTo);
        
        // Small delay to ensure auth state is fully updated
        await new Promise(resolve => setTimeout(resolve, 200));
        
        router.push(redirectTo);
      } else {
        console.log('Auth Page: Login failed');
        setError('Invalid email or password');
      }
    } catch (err) {
      console.error('Auth Page: Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      // Always reset loading state
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
      });
      if (success) {
        setHasRedirected(true);
        const redirectTo = searchParams.get('redirect') || '/gift-cards';
        console.log('Registration successful, redirecting to:', redirectTo);
        router.push(redirectTo);
      } else {
        setError('Registration failed. Please try again.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while auth context is initializing or if user is already authenticated
  if (loading || (isAuthenticated && !hasRedirected)) {
    return (
      <div className="min-h-screen flex items-center justify-center transition-colors duration-500 dark:bg-gaming-darker light:bg-gradient-to-br light:from-blue-50/80 light:via-white light:to-purple-50/80">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gaming-cyan mx-auto mb-4"></div>
          <p className="text-gaming-cyan font-semibold">
            {isAuthenticated ? 'Redirecting...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen transition-colors duration-500 dark:bg-gaming-darker light:bg-gradient-to-br light:from-blue-50/80 light:via-white light:to-purple-50/80 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="dark:block hidden absolute inset-0 bg-gradient-to-br from-gaming-purple/10 via-transparent to-gaming-cyan/10" />
        <div className="dark:block hidden absolute top-1/4 left-10 w-72 h-72 bg-gaming-purple/5 rounded-full blur-3xl animate-pulse" />
        <div className="dark:block hidden absolute bottom-1/4 right-10 w-96 h-96 bg-gaming-cyan/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="light:block hidden absolute top-1/4 left-10 w-72 h-72 bg-blue-200/15 rounded-full blur-3xl animate-pulse" />
        <div className="light:block hidden absolute bottom-1/4 right-10 w-96 h-96 bg-purple-200/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4 mt-24">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-16 h-16 bg-gaming-purple/20 rounded-full flex items-center justify-center mr-4">
                <Gift className="w-8 h-8 text-gaming-cyan" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-gaming font-bold transition-colors duration-300 dark:text-white light:text-gray-900">
                  GiftCard
                </h1>
                <p className="text-sm transition-colors duration-300 dark:text-gray-400 light:text-gray-500">
                  Platform
                </p>
              </div>
            </div>
            <p className="text-lg transition-colors duration-300 dark:text-gray-300 light:text-gray-600">
              Access your gaming gift cards
            </p>
          </div>

          {/* Auth Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="gaming-card backdrop-blur-sm"
          >
            {/* Tab Navigation */}
            <div className="flex space-x-1 mb-8 bg-gaming-dark/50 p-1 rounded-lg border border-gaming-purple/30">
              <button
                onClick={() => setCurrentView(AUTH_VIEW.SIGN_IN)}
                className={`flex-1 py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center space-x-2 ${
                  currentView === AUTH_VIEW.SIGN_IN
                    ? 'bg-gaming-purple/30 text-gaming-cyan border border-gaming-cyan/30'
                    : 'text-gray-400 hover:text-white hover:bg-gaming-purple/10'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span className="font-medium">Sign In</span>
              </button>
              <button
                onClick={() => setCurrentView(AUTH_VIEW.REGISTER)}
                className={`flex-1 py-3 px-4 rounded-md transition-all duration-300 flex items-center justify-center space-x-2 ${
                  currentView === AUTH_VIEW.REGISTER
                    ? 'bg-gaming-purple/30 text-gaming-cyan border border-gaming-cyan/30'
                    : 'text-gray-400 hover:text-white hover:bg-gaming-purple/10'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                <span className="font-medium">Register</span>
              </button>
            </div>

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <p className="text-red-400 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Form Content */}
            <AnimatePresence mode="wait">
              {currentView === AUTH_VIEW.SIGN_IN && (
                <motion.div
                  key="signin"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium transition-colors duration-300 dark:text-gray-300 light:text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Mail className="w-5 h-5 text-gaming-cyan" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="input-cyber pl-10"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium transition-colors duration-300 dark:text-gray-300 light:text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Lock className="w-5 h-5 text-gaming-cyan" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="input-cyber pl-10 pr-10"
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gaming-cyan hover:text-gaming-neon transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-neon w-full"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                          Signing In...
                        </>
                      ) : (
                        <>
                          <LogIn className="w-5 h-5 mr-2" />
                          Sign In
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}

              {currentView === AUTH_VIEW.REGISTER && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <form onSubmit={handleRegister} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium transition-colors duration-300 dark:text-gray-300 light:text-gray-700 mb-2">
                          First Name
                        </label>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <UserIcon className="w-5 h-5 text-gaming-cyan" />
                          </div>
                          <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className="input-cyber pl-10"
                            placeholder="John"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium transition-colors duration-300 dark:text-gray-300 light:text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="input-cyber"
                          placeholder="Doe"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium transition-colors duration-300 dark:text-gray-300 light:text-gray-700 mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Mail className="w-5 h-5 text-gaming-cyan" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="input-cyber pl-10"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium transition-colors duration-300 dark:text-gray-300 light:text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Lock className="w-5 h-5 text-gaming-cyan" />
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="input-cyber pl-10 pr-10"
                          placeholder="Create a password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gaming-cyan hover:text-gaming-neon transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium transition-colors duration-300 dark:text-gray-300 light:text-gray-700 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <Lock className="w-5 h-5 text-gaming-cyan" />
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="input-cyber pl-10 pr-10"
                          placeholder="Confirm your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gaming-cyan hover:text-gaming-neon transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-neon w-full"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-5 h-5 mr-2" />
                          Create Account
                        </>
                      )}
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </main>
  );
} 