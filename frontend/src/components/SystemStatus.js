import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Activity, Play, AlertCircle, CheckCircle, Zap, Shield, Wifi, Server, Phone } from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const SystemStatus = () => {
  const queryClient = useQueryClient();
  
  const { data: schedulerStatus } = useQuery('scheduler-status', 
    () => apiService.getSchedulerStatus(),
    { refetchInterval: 5000 } // Refresh every 5 seconds
  );

  const startSchedulerMutation = useMutation(
    () => apiService.startScheduler(),
    {
      onSuccess: () => {
        toast.success('Scheduler started successfully');
        queryClient.invalidateQueries('scheduler-status');
        queryClient.invalidateQueries('dashboard-stats');
      },
      onError: (error) => {
        toast.error('Failed to start scheduler');
      }
    }
  );

  const stopSchedulerMutation = useMutation(
    () => apiService.stopScheduler(),
    {
      onSuccess: () => {
        toast.success('Scheduler stopped successfully');
        queryClient.invalidateQueries('scheduler-status');
        queryClient.invalidateQueries('dashboard-stats');
      },
      onError: (error) => {
        toast.error('Failed to stop scheduler');
      }
    }
  );

  const isRunning = schedulerStatus?.running || false;
  const activeCalls = schedulerStatus?.active_calls || 0;
  const queueHealth = schedulerStatus?.queue_health || 'unknown';
  const overdueCalls = schedulerStatus?.overdue_calls || 0;

  const getHealthColor = (health) => {
    switch (health) {
      case 'healthy': return 'text-success-600';
      case 'warning': return 'text-warning-600';
      case 'critical': return 'text-danger-600';
      default: return 'text-slate-600';
    }
  };

  const getHealthIcon = (health) => {
    switch (health) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertCircle;
      case 'critical': return AlertCircle;
      default: return AlertCircle;
    }
  };

  const HealthIcon = getHealthIcon(queueHealth);

  return (
    <div className="card card-hover">
      <div className="card-header">
        <h3 className="text-xl font-bold text-slate-900 flex items-center">
          <Activity className="h-6 w-6 mr-3 text-primary-600" />
          System Status
        </h3>
      </div>
      <div className="card-body">
        {/* Status Overview */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isRunning ? 'bg-success-500 animate-pulse' : 'bg-slate-400'}`}></div>
              <span className="text-sm font-semibold text-slate-700">
                {isRunning ? 'System Active' : 'System Inactive'}
              </span>
            </div>
            <div className="text-xs text-slate-500">Live Status</div>
          </div>
          
          {/* Progress Bar */}
          <div className="progress-bar mb-4">
            <div 
              className="progress-fill" 
              style={{ width: `${isRunning ? 85 : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl">
            <div className="w-12 h-12 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{activeCalls}</div>
            <div className="text-sm text-slate-600">Active Calls</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-warning-50 to-warning-100 rounded-2xl">
            <div className="w-12 h-12 bg-gradient-to-r from-warning-500 to-warning-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{overdueCalls}</div>
            <div className="text-sm text-slate-600">Overdue</div>
          </div>
        </div>

        {/* Health Status */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-slate-700">Queue Health</span>
            <HealthIcon className={`h-4 w-4 ${getHealthColor(queueHealth)}`} />
          </div>
          <div className={`flex items-center p-3 rounded-xl ${
            queueHealth === 'healthy' ? 'bg-success-50 border border-success-200' :
            queueHealth === 'warning' ? 'bg-warning-50 border border-warning-200' :
            'bg-danger-50 border border-danger-200'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-3 ${
              queueHealth === 'healthy' ? 'bg-success-500' :
              queueHealth === 'warning' ? 'bg-warning-500' :
              'bg-danger-500'
            }`}></div>
            <span className={`text-sm font-medium ${
              queueHealth === 'healthy' ? 'text-success-700' :
              queueHealth === 'warning' ? 'text-warning-700' :
              'text-danger-700'
            }`}>
              {queueHealth.charAt(0).toUpperCase() + queueHealth.slice(1)}
            </span>
          </div>
        </div>

        {/* Control Button */}
        <div className="flex space-x-3">
          {isRunning ? (
            <button
              onClick={() => stopSchedulerMutation.mutate()}
              disabled={stopSchedulerMutation.isLoading}
              className="btn btn-danger w-full relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-danger-600 to-danger-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center">
                {stopSchedulerMutation.isLoading ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Stopping...
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Stop System
                  </>
                )}
              </span>
            </button>
          ) : (
            <button
              onClick={() => startSchedulerMutation.mutate()}
              disabled={startSchedulerMutation.isLoading}
              className="btn btn-success w-full relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-success-600 to-success-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 flex items-center justify-center">
                {startSchedulerMutation.isLoading ? (
                  <>
                    <div className="loading-spinner mr-2"></div>
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start System
                  </>
                )}
              </span>
            </button>
          )}
        </div>

        {/* Last Updated */}
        <div className="text-center mt-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-500">Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus; 