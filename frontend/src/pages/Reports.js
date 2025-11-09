import React from 'react';
import { useQuery } from 'react-query';
import { 
  TrendingUp, 
  Users, 
  Phone, 
  Calendar,
  BarChart,
  PieChart
} from 'lucide-react';
import { apiService } from '../services/api';
import StatCard from '../components/StatCard';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const Reports = () => {
  const { data: stats, isLoading, error } = useQuery('reports-stats', 
    () => apiService.getStats(30)
  );

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
        <p className="text-red-600">Failed to load reports data</p>
      </div>
    );
  }

  const reportStats = stats?.data || {};

  // Chart data
  const callOutcomeData = [
    { name: 'Answered', value: reportStats.answered_calls || 0, color: '#10B981' },
    { name: 'No Answer', value: reportStats.no_answer_calls || 0, color: '#F59E0B' },
    { name: 'Rejected', value: reportStats.rejected_calls || 0, color: '#EF4444' },
    { name: 'Meetings', value: reportStats.meetings_scheduled || 0, color: '#3B82F6' },
  ];

  const leadStatusData = [
    { name: 'Pending', value: reportStats.pending_leads || 0, color: '#6B7280' },
    { name: 'Scheduled', value: reportStats.scheduled_leads || 0, color: '#10B981' },
    { name: 'Called', value: reportStats.called_leads || 0, color: '#3B82F6' },
    { name: 'Not Interested', value: reportStats.not_interested_leads || 0, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600 mt-1">Detailed insights into your cold calling performance</p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Calls (30d)"
          value={reportStats.total_calls || 0}
          icon={Phone}
          color="primary"
          trend={reportStats.call_trend}
        />
        <StatCard
          title="Answer Rate"
          value={`${reportStats.answer_rate || 0}%`}
          icon={TrendingUp}
          color="success"
        />
        <StatCard
          title="Meeting Rate"
          value={`${reportStats.meeting_rate || 0}%`}
          icon={Calendar}
          color="info"
        />
        <StatCard
          title="Total Leads"
          value={reportStats.total_leads || 0}
          icon={Users}
          color="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Outcomes */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-primary-600" />
              Call Outcomes
            </h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart data={callOutcomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </RechartsBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lead Status */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="h-5 w-5 mr-2 text-primary-600" />
              Lead Status Distribution
            </h3>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={leadStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {leadStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Call Statistics */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Call Statistics</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Calls:</span>
                <span className="font-semibold">{reportStats.total_calls || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Answered Calls:</span>
                <span className="font-semibold text-success-600">{reportStats.answered_calls || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">No Answer:</span>
                <span className="font-semibold text-warning-600">{reportStats.no_answer_calls || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Rejected Calls:</span>
                <span className="font-semibold text-danger-600">{reportStats.rejected_calls || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Meetings Scheduled:</span>
                <span className="font-semibold text-info-600">{reportStats.meetings_scheduled || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Duration:</span>
                <span className="font-semibold">{reportStats.avg_call_duration || 0}m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Statistics */}
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-semibold text-gray-900">Lead Statistics</h3>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Leads:</span>
                <span className="font-semibold">{reportStats.total_leads || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Pending Leads:</span>
                <span className="font-semibold text-warning-600">{reportStats.pending_leads || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Scheduled Leads:</span>
                <span className="font-semibold text-success-600">{reportStats.scheduled_leads || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Called Leads:</span>
                <span className="font-semibold text-info-600">{reportStats.called_leads || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Not Interested:</span>
                <span className="font-semibold text-danger-600">{reportStats.not_interested_leads || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Conversion Rate:</span>
                <span className="font-semibold text-primary-600">{reportStats.conversion_rate || 0}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 