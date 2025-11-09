import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Target,
  Phone,
  Building,
  ChevronDown,
  Search
} from 'lucide-react';
import toast from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const countryDropdownRef = useRef(null);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    industry: '',
    mobile: '',
    countryCode: '+91'
  });

  const countryCodes = [
    { code: "+91", name: "India", flag: "https://flagcdn.com/w320/in.png" },
    {code: "+500", name: "South Georgia", flag: "https://flagcdn.com/w320/gs.png",},
    { code: "+1473", name: "Grenada", flag: "https://flagcdn.com/w320/gd.png" },
  ];

  const industries = [
    'Cafes',
    'Restaurants',
    'Retail',
    'Healthcare',
    'Education',
    'Technology',
    'Finance',
    'Real Estate',
    'Manufacturing',
    'Other'
  ];

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
        setCountrySearch('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCountrySelect = (country) => {
    setFormData(prev => ({
      ...prev,
      countryCode: country.code
    }));
    setShowCountryDropdown(false);
    setCountrySearch('');
  };

  const filteredCountries = countryCodes.filter(country =>
    country.name.toLowerCase().includes(countrySearch.toLowerCase()) ||
    country.code.includes(countrySearch)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (!formData.industry) {
      toast.error('Please select an industry');
      return;
    }

    if (!formData.mobile) {
      toast.error('Please enter your mobile number');
      return;
    }

    setIsLoading(true);
    try {
      // Prepare data for backend (map countryCode to country_code)
      const registrationData = {
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        industry: formData.industry,
        mobile: formData.mobile,
        country_code: formData.countryCode
      };

      await register(registrationData);
      toast.success('Registration successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '4s' }}></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          <div className="relative">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-secondary-500/20 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-white/80 backdrop-blur-md rounded-3xl shadow-glass border border-white/20 animate-fade-in-up">
              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="relative mx-auto w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                    <Sparkles className="w-10 h-10 text-white" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-3xl opacity-20 animate-pulse"></div>
                  </div>
                  <h1 className="text-4xl font-bold gradient-text mb-3">Create Account</h1>
                  <p className="text-slate-600 text-lg">Join AI Cold Caller and start your journey</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* First Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="form-label">
                        <User className="h-4 w-4 mr-2" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="form-label">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="form-input"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  {/* Second Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="form-label">
                        <Building className="h-4 w-4 mr-2" />
                        Industry *
                      </label>
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        className="form-input"
                        required
                      >
                        <option value="">Select your industry</option>
                        {industries.map((industry) => (
                          <option key={industry} value={industry}>
                            {industry}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="form-label">
                        <Phone className="h-4 w-4 mr-2" />
                        Mobile Number *
                      </label>
                      <div className="flex gap-2">
                        {/* Country Code Dropdown */}
                        <div className="relative" ref={countryDropdownRef}>
                          <button
                            type="button"
                            onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                            className="flex items-center gap-2 px-4 py-2.5 border border-slate-300 rounded-xl bg-white/80 backdrop-blur-sm hover:border-primary-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 min-w-[120px]"
                          >
                            <img 
                              src={countryCodes.find(c => c.code === formData.countryCode)?.flag} 
                              alt="flag" 
                              className="w-5 h-4 object-cover rounded"
                            />
                            <span className="text-sm font-medium">{formData.countryCode}</span>
                            <ChevronDown className="h-4 w-4 text-slate-400" />
                          </button>
                          
                          {showCountryDropdown && (
                            <div className="absolute top-full left-0 mt-1 w-64 bg-white/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-soft-lg z-50 max-h-60 overflow-hidden">
                              {/* Search Input */}
                              <div className="p-3 border-b border-slate-200">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                  <input
                                    type="text"
                                    placeholder="Search countries..."
                                    value={countrySearch}
                                    onChange={(e) => setCountrySearch(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  />
                                </div>
                              </div>
                              
                              {/* Country List */}
                              <div className="max-h-48 overflow-y-auto">
                                {filteredCountries.map((country) => (
                                  <button
                                    key={country.code}
                                    type="button"
                                    onClick={() => handleCountrySelect(country)}
                                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors duration-200 text-left"
                                  >
                                    <img 
                                      src={country.flag} 
                                      alt={country.name} 
                                      className="w-6 h-4 object-cover rounded"
                                    />
                                    <div className="flex-1">
                                      <div className="text-sm font-medium text-slate-900">{country.name}</div>
                                      <div className="text-xs text-slate-500">{country.code}</div>
                                    </div>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {/* Mobile Number Input */}
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleInputChange}
                          className="form-input flex-1"
                          placeholder="Enter mobile number"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Third Row - Passwords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="form-label">
                        <Lock className="h-4 w-4 mr-2" />
                        Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="form-input pr-10"
                          placeholder="Create a password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="form-label">
                        <Lock className="h-4 w-4 mr-2" />
                        Confirm Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="form-input pr-10"
                          placeholder="Confirm your password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Fourth Row - Password Strength */}
                  <div className="space-y-2">
                    <label className="form-label">
                      <Shield className="h-4 w-4 mr-2" />
                      Password Strength
                    </label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            formData.password.length >= 8 
                              ? 'bg-success-500' 
                              : formData.password.length >= 6 
                              ? 'bg-warning-500' 
                              : 'bg-danger-500'
                          }`}
                          style={{ width: `${Math.min((formData.password.length / 8) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-slate-500">
                        {formData.password.length >= 8 ? 'Strong' : formData.password.length >= 6 ? 'Good' : 'Weak'}
                      </span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      className="btn btn-primary w-full py-4 text-lg font-semibold relative overflow-hidden group"
                      disabled={isLoading}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10 flex items-center justify-center">
                        {isLoading ? (
                          <>
                            <div className="loading-spinner mr-3"></div>
                            Creating Account...
                          </>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="h-5 w-5 ml-2" />
                          </>
                        )}
                      </span>
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <div className="relative my-8">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/80 text-slate-500">or</span>
                  </div>
                </div>

                {/* Login Link */}
                <div className="text-center">
                  <p className="text-slate-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold transition-colors duration-200">
                      Sign in here
                    </Link>
                  </p>
                </div>
              </div>

       
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 