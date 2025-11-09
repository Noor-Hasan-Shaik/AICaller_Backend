import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { 
  Phone, 
  Calendar, 
  Clock, 
  User, 
  Eye,
  Play,
  Search,
  Sparkles,
  Filter
} from 'lucide-react';
import { apiService } from '../services/api';

const Calls = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { data: callsData, isLoading, error } = useQuery(
    ['calls', currentPage, searchTerm, statusFilter],
    () => apiService.getCalls({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      status: statusFilter === 'all' ? undefined : statusFilter
    })
  );
  console.log("callsData", 	callsData);

  const calls = callsData?.data || [];
  const totalCalls = calls.length || 0;
  const totalPages = Math.ceil(totalCalls / itemsPerPage);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleStatusFilter = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'answered': return 'success';
      case 'failed': return 'danger';
      case 'no_answer': return 'warning';
      case 'rejected': return 'danger';
      case 'meeting_scheduled': return 'info';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Completed';
      case 'answered': return 'Answered';
      case 'failed': return 'Failed';
      case 'no_answer': return 'No Answer';
      case 'rejected': return 'Rejected';
      case 'meeting_scheduled': return 'Meeting Scheduled';
      default: return status;
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
        <p className="text-red-600">Failed to load calls data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text mb-2">Call Records</h1>
          <p className="text-slate-600">View and manage all call history</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button className="btn btn-primary">
            <Phone className="h-4 w-4 mr-2" />
            Start New Call
          </button>
        </div>
      </div>

      {/* Combined Search, Filters, and Table */}
      <div className="card card-hover">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-primary-600" />
              Call Records ({totalCalls})
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
                  placeholder="Search calls by lead name, phone, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="form-input pl-12 w-full"
                />
              </div>
            </form>
            <div className="flex space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="form-select"
              >
                <option value="all">All Status</option>
                <option value="answered">Answered</option>
                <option value="no_answer">No Answer</option>
                <option value="meeting_scheduled">Meetings</option>
                <option value="failed">Failed</option>
                <option value="rejected">Rejected</option>
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
                    <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                    Date/Time
                  </div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-slate-500" />
                    Lead
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
                    <Clock className="h-4 w-4 mr-2 text-slate-500" />
                    Duration
                  </div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-slate-500" />
                    Status
                  </div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2 text-slate-500" />
                    Outcome
                  </div>
                </th>
                <th className="px-4 py-3 w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call, index) => (
                <tr key={call.id} className="group hover:bg-slate-50/50 transition-all duration-200" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors duration-200">
                        {new Date(call.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-slate-500">
                        {new Date(call.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-primary-600 transition-colors duration-200">
                        {call.lead?.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {call.lead?.company || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-medium">{call.phone_number}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{formatDuration(call.duration)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge badge-${getStatusColor(call.status)}`}>
                      {getStatusText(call.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge badge-${getStatusColor(call.outcome)}`}>
                      {getStatusText(call.outcome)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {/* View call details */}}
                        className="btn btn-sm btn-ghost hover:bg-primary-50 hover:text-primary-600 transition-all duration-200 p-1"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {call.recording_url && (
                        <button
                          onClick={() => {/* Play recording */}}
                          className="btn btn-sm btn-ghost hover:bg-success-50 hover:text-success-600 transition-all duration-200 p-1"
                          title="Play Recording"
                        >
                          <Play className="h-4 w-4" />
                        </button>
                      )}
                      {call.meeting_url && (
                        <button
                          onClick={() => {/* Join meeting */}}
                          className="btn btn-sm btn-ghost hover:bg-info-50 hover:text-info-600 transition-all duration-200 p-1"
                          title="Join Meeting"
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      )}
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalCalls)} of {totalCalls} calls
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
    </div>
  );
};

export default Calls; 