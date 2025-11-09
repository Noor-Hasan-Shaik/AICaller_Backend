import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getGroupCalls, 
  getGroups, 
  createGroupCall, 
  startGroupCall,
  pauseGroupCall,
  resumeGroupCall,
  nextGroupCall
} from '../services/api';
import { 
  Play, 
  Pause, 
  ArrowRight, 
  Users,
  Phone,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import CallPurposeModal from '../components/CallPurposeModal';

const GroupCalls = () => {
  const { user } = useAuth();
  const [groupCalls, setGroupCalls] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [queueStatus, setQueueStatus] = useState({});

  useEffect(() => {
    fetchGroupCalls();
    fetchGroups();
  }, []);

  const fetchGroupCalls = async () => {
    try {
      const response = await getGroupCalls();
      setGroupCalls(response.data.group_calls);
    } catch (error) {
      console.error('Error fetching group calls:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const response = await getGroups();
      setGroups(response.data.groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleStartGroupCall = (group) => {
    setSelectedGroup(group);
    setShowModal(true);
  };

  const handleCallPurposeConfirm = async (callPurposeData) => {
    try {
      const response = await createGroupCall({
        group_id: selectedGroup.id,
        ...callPurposeData
      });
      
      // Start the group call immediately
      await startGroupCall(response.data.id);
      
      setShowModal(false);
      setSelectedGroup(null);
      fetchGroupCalls();
    } catch (error) {
      console.error('Error starting group call:', error);
    }
  };

  const handlePauseGroupCall = async (groupCallId) => {
    try {
      await pauseGroupCall(groupCallId);
      fetchGroupCalls();
    } catch (error) {
      console.error('Error pausing group call:', error);
    }
  };

  const handleResumeGroupCall = async (groupCallId) => {
    try {
      await resumeGroupCall(groupCallId);
      fetchGroupCalls();
    } catch (error) {
      console.error('Error resuming group call:', error);
    }
  };

  const handleNextCall = async (groupCallId) => {
    try {
      await nextGroupCall(groupCallId);
      fetchGroupCalls();
    } catch (error) {
      console.error('Error calling next lead:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'queued': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'queued': return <Clock className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Call Campaigns</h1>
          <p className="text-gray-600 mt-2">Manage and monitor your group calling campaigns</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Users className="h-5 w-5" />
          Start New Campaign
        </button>
      </div>

      {/* Active Group Calls */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Campaigns</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groupCalls.filter(gc => gc.status !== 'completed').map((groupCall) => (
            <div key={groupCall.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{groupCall.group.name}</h3>
                  <p className="text-sm text-gray-500">{groupCall.total_leads} leads</p>
                </div>
              </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(groupCall.status)}`}>
                  {getStatusIcon(groupCall.status)}
                  {groupCall.status.replace('_', ' ')}
                </span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Progress:</span>
                  <span className="font-medium">{groupCall.current_lead_index} / {groupCall.total_leads}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(groupCall.current_lead_index / groupCall.total_leads) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium">{groupCall.completed_calls}</span>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="font-medium text-gray-700">Purpose:</span>
                  <span className="ml-2 text-gray-600 capitalize">{groupCall.purpose}</span>
                </div>
                {groupCall.custom_prompt && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Custom:</span>
                    <span className="ml-2 text-gray-600">{groupCall.custom_prompt}</span>
                  </div>
                )}
                {groupCall.additional_notes && (
                  <div className="text-sm">
                    <span className="font-medium text-gray-700">Notes:</span>
                    <span className="ml-2 text-gray-600">{groupCall.additional_notes}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {groupCall.status === 'queued' && (
                  <button
                    onClick={() => handleNextCall(groupCall.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Start
                  </button>
                )}
                
                {groupCall.status === 'in_progress' && (
                  <>
                    <button
                      onClick={() => handlePauseGroupCall(groupCall.id)}
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Pause className="h-4 w-4" />
                      Pause
                    </button>
                    <button
                      onClick={() => handleNextCall(groupCall.id)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Next
                    </button>
                  </>
                )}
                
                {groupCall.status === 'paused' && (
                                      <button
                      onClick={() => handleResumeGroupCall(groupCall.id)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="h-4 w-4" />
                      Resume
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {groupCalls.filter(gc => gc.status !== 'completed').length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active campaigns</h3>
            <p className="text-gray-500 mb-6">Start a new group call campaign to begin calling leads in batches</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
            >
              <Users className="h-5 w-4" />
              Start Your First Campaign
            </button>
          </div>
        )}
      </div>

      {/* Completed Group Calls */}
      {groupCalls.filter(gc => gc.status === 'completed').length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Completed Campaigns</h2>
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Leads</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {groupCalls.filter(gc => gc.status === 'completed').map((groupCall) => (
                  <tr key={groupCall.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{groupCall.group.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900 capitalize">{groupCall.purpose}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{groupCall.total_leads}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{groupCall.completed_calls}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(groupCall.created_at).toLocaleDateString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Start New Campaign Modal */}
      <CallPurposeModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedGroup(null);
        }}
        onConfirm={handleCallPurposeConfirm}
        title="Start Group Call Campaign"
      />
    </div>
  );
};

export default GroupCalls;
