import React from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Eye, Video, Play, Calendar } from 'lucide-react';
import { apiService } from '../services/api';
import { formatDistanceToNow } from 'date-fns';

const RecentCalls = () => {
  const { data: callsData, isLoading } = useQuery('recent-calls', () =>
    apiService.getCalls({ limit: 5 })
  );

  console.log("callsData", callsData);
  const calls = callsData?.data || [];

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

  const formatDuration = (seconds) => {
    if (!seconds) return '-';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Phone className="h-5 w-5 mr-2 text-primary-600" />
          Recent Calls
        </h3>
        <Link
          to="/leads/upload"
          className="btn btn-success btn-sm"
        >
          Import Leads
        </Link>
      </div>
      <div className="card-body">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="loading-spinner"></div>
            <span className="ml-2 text-gray-600">Loading calls...</span>
          </div>
        ) : calls.length > 0 ? (
          <div className="space-y-4">
            {calls.map((call) => (
              <motion.div
                key={call.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900">
                      {call.lead?.name || `Lead #${call.lead_id}`}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {getOutcomeBadge(call.outcome)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {call.lead?.phone && (
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        <span>{call.lead.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>
                          {call.called_at ? 
                            formatDistanceToNow(new Date(call.called_at), { addSuffix: true }) : 
                            'Unknown time'
                          }
                        </span>
                      </div>
                      <div className="text-sm">
                        Duration: {formatDuration(call.duration)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {call.lead && (
                    <Link
                      to={`/leads/${call.lead_id}`}
                      className="btn btn-outline btn-sm"
                      title="View Lead"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                  )}
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
              </motion.div>
            ))}
            <div className="text-center pt-4">
              <Link
                to="/calls"
                className="btn btn-outline btn-sm"
              >
                View All Calls
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">No calls made yet</h4>
            <p className="text-gray-600 mb-4">Call records will appear here once you start making calls to your leads.</p>
            <Link to="/leads" className="btn btn-primary btn-sm">
              <Phone className="h-4 w-4 mr-1" />
              View Leads
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentCalls; 