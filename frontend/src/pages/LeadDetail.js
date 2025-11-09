import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { 
  User, 
  Phone, 
  Building, 
  Mail, 
  MapPin, 
  Star,
  Edit,
  ArrowLeft,
  Calendar,
  Clock,
  Video,
  Play,
  Trash2
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: lead, isLoading, error } = useQuery(
    ['lead', id],
    () => apiService.getLead(id)
  );

  const { data: callsData } = useQuery(
    ['lead-calls', id],
    () => apiService.getCalls({ lead_id: id })
  );

  const deleteLeadMutation = useMutation(
    () => apiService.deleteLead(id),
    {
      onSuccess: () => {
        toast.success('Lead deleted successfully');
        queryClient.invalidateQueries('leads');
        queryClient.invalidateQueries('recent-leads');
        navigate('/leads');
      },
      onError: (error) => {
        toast.error('Failed to delete lead');
      }
    }
  );

  const startCallMutation = useMutation(
    () => apiService.startCall(id),
    {
      onSuccess: () => {
        toast.success('Call initiated successfully');
        queryClient.invalidateQueries('lead-calls');
      },
      onError: (error) => {
        toast.error('Failed to start call');
      }
    }
  );

  const getStatusBadge = (status) => {
    const statusConfig = {
      scheduled: { color: 'success', text: 'Scheduled' },
      calling: { color: 'primary', text: 'Calling' },
      called: { color: 'info', text: 'Called' },
      not_interested: { color: 'danger', text: 'Not Interested' },
      pending: { color: 'warning', text: 'Pending' },
    };

    const config = statusConfig[status] || { color: 'secondary', text: status };
    return (
      <span className={`badge badge-${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getOutcomeBadge = (outcome) => {
    const outcomeConfig = {
      meeting_scheduled: { color: 'success', text: 'Meeting Scheduled' },
      answered: { color: 'info', text: 'Answered' },
      no_answer: { color: 'warning', text: 'No Answer' },
      busy: { color: 'warning', text: 'Busy' },
      rejected: { color: 'danger', text: 'Rejected' },
    };

    const config = outcomeConfig[outcome] || { color: 'secondary', text: outcome || 'Unknown' };
    return (
      <span className={`badge badge-${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPriorityStars = (priority) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-lg ${i < priority ? 'text-warning-500' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const handleDeleteLead = () => {
    if (window.confirm(`Are you sure you want to delete ${lead.name}?`)) {
      deleteLeadMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="loading-spinner"></div>
        <span className="ml-2 text-gray-600">Loading lead details...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 text-lg">Error loading lead</div>
        <div className="text-gray-600 mt-2">{error.message}</div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">Lead not found</div>
      </div>
    );
  }

  const calls = callsData?.calls || [];

  return (
    <div className="space-y-6">
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
            <h1 className="text-3xl font-bold text-gray-900">{lead.name}</h1>
            <p className="text-gray-600 mt-1">{lead.company || 'No company specified'}</p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => navigate(`/leads/${id}/edit`)}
            className="btn btn-outline"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </button>
          {lead.status === 'pending' && (
            <button
              onClick={() => startCallMutation.mutate()}
              disabled={startCallMutation.isLoading}
              className="btn btn-success"
            >
              {startCallMutation.isLoading ? (
                <div className="loading-spinner mr-2"></div>
              ) : (
                <Phone className="h-4 w-4 mr-2" />
              )}
              Start Call
            </button>
          )}
          <button
            onClick={handleDeleteLead}
            disabled={deleteLeadMutation.isLoading}
            className="btn btn-danger"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lead Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2"
        >
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <User className="h-5 w-5 mr-2 text-primary-600" />
                Lead Information
              </h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-lg font-medium text-gray-900">{lead.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      Phone Number
                    </label>
                    <p className="text-lg font-medium text-gray-900">{lead.phone}</p>
                  </div>
                  {lead.email && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center">
                        <Mail className="h-4 w-4 mr-2" />
                        Email Address
                      </label>
                      <p className="text-lg font-medium text-gray-900">{lead.email}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {lead.company && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center">
                        <Building className="h-4 w-4 mr-2" />
                        Company
                      </label>
                      <p className="text-lg font-medium text-gray-900">{lead.company}</p>
                    </div>
                  )}
                  {lead.title && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Job Title</label>
                      <p className="text-lg font-medium text-gray-900">{lead.title}</p>
                    </div>
                  )}
                  {lead.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        Address
                      </label>
                      <p className="text-lg font-medium text-gray-900">{lead.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {lead.notes && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-gray-900 mt-1">{lead.notes}</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Status and Priority */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Status & Priority</h3>
            </div>
            <div className="card-body space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">{getStatusBadge(lead.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Priority Level
                </label>
                <div className="mt-1 flex">
                  {getPriorityStars(lead.priority || 1)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  Created
                </label>
                <p className="text-gray-900 mt-1">
                  {lead.created_at ? 
                    formatDistanceToNow(new Date(lead.created_at), { addSuffix: true }) : 
                    'Unknown'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
            </div>
            <div className="card-body space-y-3">
              <button
                onClick={() => navigate(`/leads/${id}/edit`)}
                className="btn btn-outline w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Lead
              </button>
              {lead.status === 'pending' && (
                <button
                  onClick={() => startCallMutation.mutate()}
                  disabled={startCallMutation.isLoading}
                  className="btn btn-success w-full"
                >
                  {startCallMutation.isLoading ? (
                    <div className="loading-spinner mr-2"></div>
                  ) : (
                    <Phone className="h-4 w-4 mr-2" />
                  )}
                  Start Call
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Call History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Phone className="h-5 w-5 mr-2 text-primary-600" />
            Call History
          </h3>
        </div>
        <div className="card-body">
          {calls.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Outcome</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {calls.map((call) => (
                    <tr key={call.id} className="hover:bg-gray-50">
                      <td>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">
                              {call.called_at ? 
                                new Date(call.called_at).toLocaleDateString() : 
                                'Unknown'
                              }
                            </div>
                            <div className="text-sm text-gray-500">
                              {call.called_at ? 
                                new Date(call.called_at).toLocaleTimeString() : 
                                '-'
                              }
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-400" />
                          {formatDuration(call.duration)}
                        </div>
                      </td>
                      <td>{getStatusBadge(call.status)}</td>
                      <td>{getOutcomeBadge(call.outcome)}</td>
                      <td>
                        <div className="flex items-center space-x-2">
                          {call.google_meet_link && (
                            <a
                              href={call.google_meet_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-success btn-sm"
                              title="Join Meeting"
                            >
                              <Video className="h-4 w-4" />
                            </a>
                          )}
                          {call.recording_url && (
                            <a
                              href={call.recording_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-info btn-sm"
                              title="Listen to Recording"
                            >
                              <Play className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No calls yet</h4>
              <p className="text-gray-600 mb-4">Call history will appear here once calls are made to this lead.</p>
              {lead.status === 'pending' && (
                <button
                  onClick={() => startCallMutation.mutate()}
                  disabled={startCallMutation.isLoading}
                  className="btn btn-primary"
                >
                  {startCallMutation.isLoading ? (
                    <div className="loading-spinner mr-2"></div>
                  ) : (
                    <Phone className="h-4 w-4 mr-2" />
                  )}
                  Start First Call
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LeadDetail; 