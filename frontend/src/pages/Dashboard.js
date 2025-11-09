import React from 'react';
import { useQuery } from 'react-query';
import { 
  Users, 
  Phone, 
  Calendar, 
  Clock,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  Target,
  Award,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { apiService } from '../services/api';
import StatCard from '../components/StatCard';
import RecentLeads from '../components/RecentLeads';
import RecentCalls from '../components/RecentCalls';
import QuickActions from '../components/QuickActions';
import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { data: stats, isLoading, error } = useQuery('dashboard-stats', 
    () => apiService.getStats(30)
  );
  const { user, logout } = useAuth();

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
        <p className="text-danger-600">Failed to load dashboard data</p>
      </div>
    );
  }

  // Extract data from the nested structure
  const dashboardStats = stats?.data || {};
  const callStats = dashboardStats.call_stats || {};
  const leadStats = dashboardStats.lead_stats || {};
  const queueStats = dashboardStats.queue_stats || {};

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 rounded-2xl blur-2xl"></div>
        <div className="relative bg-white/70 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-glass">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold gradient-text mb-2">Welcome back, {user?.full_name || 'User'}!</h1>
              <p className="text-slate-600">Here's what's happening with your cold calling campaigns</p>
            </div>
            <div className="hidden lg:flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <div className="text-sm text-slate-500">AI Status</div>
                <div className="text-sm font-semibold text-slate-900">Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <StatCard
            title="Total Calls"
            value={callStats.total_calls || 0}
            icon={Phone}
            color="primary"
            trendValue={callStats.call_trend ? `${callStats.call_trend > 0 ? '+' : ''}${callStats.call_trend.toFixed(1)}%` : '+12.5%'}
            trendDirection={callStats.call_trend > 0 ? 'up' : 'down'}
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <StatCard
            title="Meetings Scheduled"
            value={callStats.meetings_scheduled || 0}
            icon={Calendar}
            color="success"
            trendValue={`${callStats.meeting_rate ? callStats.meeting_rate.toFixed(1) : 0}%`}
            trendDirection="up"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <StatCard
            title="Total Leads"
            value={leadStats.total_leads || 0}
            icon={Users}
            color="secondary"
            trendValue={`${leadStats.conversion_rate ? leadStats.conversion_rate.toFixed(1) : 0}%`}
            trendDirection="up"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <StatCard
            title="Calls Queued"
            value={queueStats.queued_calls || 0}
            icon={Clock}
            color="warning"
            trendValue={queueStats.active_calls ? `${queueStats.active_calls} active` : '0 active'}
            trendDirection="down"
          />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
        <div className="card card-hover">
          <div className="card-header">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <BarChart3 className="h-5 w-5 mr-2 text-primary-600" />
              Performance Metrics
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center group">
                <div className="relative">
                  <div className="text-3xl font-bold text-primary-600 group-hover:scale-110 transition-transform duration-300">
                    {callStats.answer_rate ? callStats.answer_rate.toFixed(1) : 0}%
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <TrendingUp className="h-4 w-4 text-success-500" />
                  </div>
                </div>
                <div className="text-sm text-slate-600 mt-1">Answer Rate</div>
                <div className="text-xs text-success-600">
                  {callStats.answered_calls || 0} answered out of {callStats.total_calls || 0} calls
                </div>
              </div>
              <div className="text-center group">
                <div className="relative">
                  <div className="text-3xl font-bold text-success-600 group-hover:scale-110 transition-transform duration-300">
                    {callStats.meeting_rate ? callStats.meeting_rate.toFixed(1) : 0}%
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Target className="h-4 w-4 text-primary-500" />
                  </div>
                </div>
                <div className="text-sm text-slate-600 mt-1">Meeting Rate</div>
                <div className="text-xs text-success-600">
                  {callStats.meetings_scheduled || 0} meetings scheduled
                </div>
              </div>
              <div className="text-center group">
                <div className="relative">
                  <div className="text-3xl font-bold text-secondary-600 group-hover:scale-110 transition-transform duration-300">
                    {callStats.avg_call_duration ? Math.round(callStats.avg_call_duration / 60) : 0}m
                  </div>
                  <div className="absolute -top-2 -right-2">
                    <Clock className="h-4 w-4 text-warning-500" />
                  </div>
                </div>
                <div className="text-sm text-slate-600 mt-1">Avg Call Duration</div>
                <div className="text-xs text-success-600">
                  {callStats.avg_call_duration ? `${callStats.avg_call_duration.toFixed(0)}s average` : '0s average'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <StatCard
            title="Answered Calls"
            value={callStats.answered_calls || 0}
            icon={Phone}
            color="success"
            trendValue={`${callStats.answer_rate ? callStats.answer_rate.toFixed(1) : 0}% rate`}
            trendDirection="up"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '700ms' }}>
          <StatCard
            title="No Answer"
            value={callStats.no_answer_calls || 0}
            icon={Phone}
            color="warning"
            trendValue="Failed attempts"
            trendDirection="down"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '800ms' }}>
          <StatCard
            title="Rejected Calls"
            value={callStats.rejected_calls || 0}
            icon={Phone}
            color="danger"
            trendValue="Declined calls"
            trendDirection="down"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '900ms' }}>
          <StatCard
            title="Active Calls"
            value={queueStats.active_calls || 0}
            icon={Activity}
            color="info"
            trendValue="Currently on call"
            trendDirection="up"
          />
        </div>
      </div>

      {/* Lead Status Breakdown */}
      <div className="animate-fade-in-up" style={{ animationDelay: '1000ms' }}>
        <div className="card card-hover">
          <div className="card-header">
            <h3 className="text-lg font-bold text-slate-900 flex items-center">
              <Users className="h-5 w-5 mr-2 text-secondary-600" />
              Lead Status Breakdown
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-warning-600">
                  {leadStats.pending_leads || 0}
                </div>
                <div className="text-sm text-slate-600">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-info-600">
                  {leadStats.scheduled_leads || 0}
                </div>
                <div className="text-sm text-slate-600">Scheduled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-success-600">
                  {leadStats.called_leads || 0}
                </div>
                <div className="text-sm text-slate-600">Called</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-danger-600">
                  {leadStats.not_interested_leads || 0}
                </div>
                <div className="text-sm text-slate-600">Not Interested</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-in-up" style={{ animationDelay: '1100ms' }}>
        <QuickActions />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="animate-fade-in-up" style={{ animationDelay: '1200ms' }}>
          <RecentLeads />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '1300ms' }}>
          <RecentCalls />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 