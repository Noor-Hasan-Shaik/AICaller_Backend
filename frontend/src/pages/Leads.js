import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Plus, 
  Upload, 
  Search, 
  Eye,
  Edit,
  Phone,
  Trash2,
  Building,
  Mail,
  Calendar,
  Filter,
  Sparkles,
  User,
  Target,
  Clock
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';
import CallPurposeModal from '../components/CallPurposeModal';

const Leads = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showCallModal, setShowCallModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);

  const { data: leadsData, isLoading, error } = useQuery(
    ['leads', currentPage, searchTerm, statusFilter, priorityFilter],
    () => apiService.getLeads({
      skip: (currentPage - 1) * itemsPerPage,
      limit: itemsPerPage,
      search: searchTerm,
      status: statusFilter === 'all' ? undefined : statusFilter,
      priority: priorityFilter === 'all' ? undefined : priorityFilter
    })
  );

  const deleteMutation = useMutation(
    (leadId) => apiService.deleteLead(leadId),
    {
      onSuccess: () => {
        toast.success('Lead deleted successfully');
        queryClient.invalidateQueries('leads');
        queryClient.invalidateQueries('recent-leads');
      },
      onError: (error) => {
        toast.error('Failed to delete lead');
      }
    }
  );

  const startCallMutation = useMutation(
    (callData) => apiService.startCallWithPurpose(callData),
    {
      onSuccess: () => {
        toast.success('Call started successfully');
        queryClient.invalidateQueries('leads');
        queryClient.invalidateQueries('calls');
      },
      onError: (error) => {
        toast.error('Failed to start call');
      }
    }
  );

  const leads = leadsData?.data?.leads || [];
  const totalLeads = leadsData?.total || 0;
  const totalPages = Math.ceil(totalLeads / itemsPerPage);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleFilter = (type, value) => {
    if (type === 'status') {
      setStatusFilter(value);
    } else if (type === 'priority') {
      setPriorityFilter(value);
    }
    setCurrentPage(1);
  };

  const handleDelete = (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      deleteMutation.mutate(leadId);
    }
  };

  const handleStartCall = (lead) => {
    setSelectedLead(lead);
    setShowCallModal(true);
  };

  const handleCallPurposeConfirm = (callPurposeData) => {
    startCallMutation.mutate({
      lead_id: selectedLead.id,
      ...callPurposeData
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'scheduled': return 'info';
      case 'calling': return 'primary';
      case 'called': return 'success';
      case 'not_interested': return 'danger';
      default: return 'secondary';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return 'danger';
      case 2: return 'warning';
      case 3: return 'info';
      case 4: return 'success';
      case 5: return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'scheduled': return 'Scheduled';
      case 'calling': return 'Calling';
      case 'called': return 'Called';
      case 'not_interested': return 'Not Interested';
      default: return status;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-danger-600">Failed to load leads data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Lead Management</h1>
          <p className="text-slate-600">Manage your lead database and track performance</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Link to="/upload" className="btn btn-outline">
            <Upload className="h-4 w-4 mr-2" />
            Import CSV
          </Link>
          <Link to="/leads/new" className="btn btn-primary">
            <Plus className="h-4 w-4 mr-2" />
            Add Lead
          </Link>
        </div>
      </div>

      {/* Combined Search, Filters, and Table */}
      <div className="card card-hover">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary-600" />
              Lead Database ({totalLeads})
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-500">Live Data</span>
            </div>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="px-6 py-4 border-b border-slate-200/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <form onSubmit={handleSearch} className="flex-1 max-w-md">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary-500 transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Search leads by name, company, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-12 w-full"
                />
              </div>
            </form>
            <div className="flex space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => handleFilter('status', e.target.value)}
                className="form-select"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="scheduled">Scheduled</option>
                <option value="calling">Calling</option>
                <option value="called">Called</option>
                <option value="not_interested">Not Interested</option>
              </select>
              <select
                value={priorityFilter}
                onChange={(e) => handleFilter('priority', e.target.value)}
                className="form-select"
              >
                <option value="all">All Priority</option>
                <option value="1">High (1)</option>
                <option value="2">Medium-High (2)</option>
                <option value="3">Medium (3)</option>
                <option value="4">Medium-Low (4)</option>
                <option value="5">Low (5)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="px-4 py-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-slate-500" />
                    Name
                  </div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2 text-slate-500" />
                    Company
                  </div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-slate-500" />
                    Phone
                  </div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-slate-500" />
                    Email
                  </div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-slate-500" />
                    Status
                  </div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-slate-500" />
                    Priority
                  </div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                    Created
                  </div>
                </th>
                <th className="px-4 py-3 w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, index) => (
                <tr key={lead.id} className="group hover:bg-slate-50/50 transition-all duration-200" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors duration-200">
                        {lead.name}
                      </div>
                      {lead.title && (
                        <div className="text-xs text-slate-500">
                          {lead.title}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{lead.company || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-medium">{lead.phone}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{lead.email || '-'}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge badge-${getStatusColor(lead.status)}`}>
                      {getStatusText(lead.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge badge-${getPriorityColor(lead.priority)}`}>
                      {lead.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <Link
                        to={`/leads/${lead.id}`}
                        className="btn btn-sm btn-ghost hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 p-1"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/leads/${lead.id}/edit`}
                        className="btn btn-sm btn-ghost hover:bg-secondary-50 hover:text-secondary-600 transition-all duration-200 p-1"
                        title="Edit Lead"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleStartCall(lead)}
                        disabled={startCallMutation.isLoading}
                        className="btn btn-sm btn-ghost hover:bg-success-50 hover:text-success-600 transition-all duration-200 p-1"
                        title="Start Call"
                      >
                        {startCallMutation.isLoading ? (
                          <div className="loading-spinner h-4 w-4"></div>
                        ) : (
                          <Phone className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(lead.id)}
                        className="btn btn-sm btn-ghost hover:bg-danger-50 hover:text-danger-600 transition-all duration-200 p-1"
                        title="Delete Lead"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
            <div className="text-sm text-slate-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalLeads)} of {totalLeads} leads
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-outline btn-sm"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-slate-600 bg-slate-100 rounded-lg">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-outline btn-sm"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Call Purpose Modal */}
      <CallPurposeModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        onConfirm={handleCallPurposeConfirm}
        title={`Call ${selectedLead?.name || 'Lead'}`}
      />
    </div>
  );
};

export default Leads; 