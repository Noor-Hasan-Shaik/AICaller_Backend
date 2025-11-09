import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Plus, Eye, Phone, Calendar } from 'lucide-react';
import { apiService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const RecentLeads = () => {
  const { data: leadsData, isLoading } = useQuery('recent-leads', () =>
    apiService.getLeads({ limit: 5 })
  );

  const leads = leadsData?.data?.leads || [];
  console.log("Leads Data Dashboard: ", leads)
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

  const getPriorityStars = (priority) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span
        key={i}
        className={`text-sm ${i < priority ? 'text-warning-500' : 'text-gray-300'}`}
      >
        ★
      </span>
    ));
  };

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Users className="h-5 w-5 mr-2 text-primary-600" />
          Recent Leads
        </h3>
        <Link
          to="/leads/new"
          className="btn btn-primary btn-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Lead
        </Link>
      </div>
      <div className="card-body">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner"></div>
            <span className="ml-2 text-gray-600">Loading leads...</span>
          </div>
        ) : leads.length > 0 ? (
          <div className="space-y-4">
            {leads.map((lead) => (
              <motion.div
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{lead.name}</h4>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(lead.status)}
                      <div className="flex">
                        {getPriorityStars(lead.priority || 1)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {lead.company && (
                      <div className="flex items-center">
                        <span className="font-medium">Company:</span>
                        <span className="ml-1">{lead.company}</span>
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.created_at && (
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>Added {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  <Link
                    to={`/leads/${lead.id}`}
                    className="btn btn-outline btn-sm"
                    title="View Details"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  {lead.status === 'pending' && (
                    <button
                      className="btn btn-success btn-sm"
                      title="Start Call"
                      onClick={() => {
                        // Handle start call
                      }}
                    >
                      <Phone className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
            <div className="text-center pt-4">
              <Link
                to="/leads"
                className="btn btn-outline btn-sm"
              >
                View All Leads
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No leads yet</h4>
            <p className="text-gray-600 mb-4">Get started by adding your first lead or importing a CSV file.</p>
            <div className="flex justify-center space-x-3">
              <Link to="/leads/new" className="btn btn-primary btn-sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Lead
              </Link>
              <Link to="/leads/upload" className="btn btn-outline btn-sm">
                Import CSV
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentLeads; 