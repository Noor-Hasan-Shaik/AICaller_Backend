import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  User, 
  Phone, 
  Building, 
  Mail, 
  MapPin, 
  Star,
  Save,
  ArrowLeft,
  Sparkles,
  Target,
  Calendar
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const LeadForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    title: '',
    address: '',
    notes: '',
    priority: 3,
    status: 'pending'
  });

  // Fetch lead data if editing
  const { data: leadData, isLoading: isLoadingLead } = useQuery(
    ['lead', id],
    () => apiService.getLead(id),
    { enabled: isEditing }
  );

  // Update form data when lead data is loaded
  useEffect(() => {
    if (leadData && isEditing) {
      setFormData({
        name: leadData.name || '',
        phone: leadData.phone || '',
        email: leadData.email || '',
        company: leadData.company || '',
        title: leadData.title || '',
        address: leadData.address || '',
        notes: leadData.notes || '',
        priority: leadData.priority || 3,
        status: leadData.status || 'pending'
      });
    }
  }, [leadData, isEditing]);

  const createLeadMutation = useMutation(
    (data) => apiService.createLead(data),
    {
      onSuccess: () => {
        toast.success('Lead created successfully');
        queryClient.invalidateQueries('leads');
        queryClient.invalidateQueries('recent-leads');
        navigate('/leads');
      },
      onError: (error) => {
        toast.error('Failed to create lead');
      }
    }
  );

  const updateLeadMutation = useMutation(
    (data) => apiService.updateLead(id, data),
    {
      onSuccess: () => {
        toast.success('Lead updated successfully');
        queryClient.invalidateQueries('leads');
        queryClient.invalidateQueries('recent-leads');
        navigate('/leads');
      },
      onError: (error) => {
        toast.error('Failed to update lead');
      }
    }
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Phone number is required');
      return;
    }

    if (isEditing) {
      updateLeadMutation.mutate(formData);
    } else {
      createLeadMutation.mutate(formData);
    }
  };

  const isLoading = isLoadingLead || createLeadMutation.isLoading || updateLeadMutation.isLoading;

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'text-success-600 bg-success-100';
      case 2: return 'text-info-600 bg-info-100';
      case 3: return 'text-warning-600 bg-warning-100';
      case 4: return 'text-danger-600 bg-danger-100';
      case 5: return 'text-purple-600 bg-purple-100';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const getPriorityText = (priority) => {
    switch (priority) {
      case 1: return 'Low';
      case 2: return 'Medium';
      case 3: return 'High';
      case 4: return 'Very High';
      case 5: return 'Critical';
      default: return 'Medium';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/leads')}
            className="btn btn-outline btn-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </button>
          <div>
            <h1 className="text-3xl font-bold gradient-text">
              {isEditing ? 'Edit Lead' : 'Add New Lead'}
            </h1>
            <p className="text-slate-600 mt-1">
              {isEditing ? 'Update lead information' : 'Create a new lead for your cold calling campaign'}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="card card-hover">
        <div className="card-header">
          <h2 className="text-lg font-bold text-slate-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-primary-600" />
            Lead Information
          </h2>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label className="form-label">
                  <User className="h-4 w-4 mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="form-label">
                  <Phone className="h-4 w-4 mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="form-label">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label className="form-label">
                  <Building className="h-4 w-4 mr-2" />
                  Company
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <label className="form-label">
                  <User className="h-4 w-4 mr-2" />
                  Job Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter job title"
                />
              </div>
              <div className="space-y-2">
                <label className="form-label">
                  <MapPin className="h-4 w-4 mr-2" />
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="form-input"
                  placeholder="Enter address"
                />
              </div>
            </div>

            {/* Third Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-2">
                <label className="form-label">
                  <Star className="h-4 w-4 mr-2" />
                  Priority Level
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value={1}>Low</option>
                  <option value={2}>Medium</option>
                  <option value={3}>High</option>
                  <option value={4}>Very High</option>
                  <option value={5}>Critical</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="form-label">
                  <Calendar className="h-4 w-4 mr-2" />
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="form-select"
                >
                  <option value="pending">Pending</option>
                  <option value="calling">Calling</option>
                  <option value="called">Called</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="not_interested">Not Interested</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="form-label">
                  <Target className="h-4 w-4 mr-2" />
                  Priority Preview
                </label>
                <div className={`inline-flex items-center px-4 py-2 rounded-xl ${getPriorityColor(formData.priority)}`}>
                  <Star className="h-4 w-4 mr-2" />
                  <span className="font-semibold">{getPriorityText(formData.priority)}</span>
                </div>
              </div>
            </div>

            {/* Fourth Row - Notes */}
            <div className="space-y-2 mb-6">
              <label className="form-label">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="form-textarea"
                rows={3}
                placeholder="Add any additional notes about this lead..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => navigate('/leads')}
                className="btn btn-outline"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? 'Update Lead' : 'Create Lead'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LeadForm; 