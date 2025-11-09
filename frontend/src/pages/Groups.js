import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getGroups, 
  createGroup, 
  updateGroup, 
  deleteGroup, 
  getLeads,
  createGroupCall,
  startGroupCall
} from '../services/api';
import { Plus, Pencil, Trash2, Users, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import CallPurposeModal from '../components/CallPurposeModal';

const Groups = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCallModal, setShowCallModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    lead_ids: []
  });

  useEffect(() => {
    fetchGroups();
    fetchLeads();
  }, []);

  const fetchGroups = async () => {
    try {
      const response = await getGroups();
      setGroups(response.data.groups);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await getLeads();
      setLeads(response.data.leads);
    } catch (error) {
      console.error('Error fetching leads:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, formData);
      } else {
        await createGroup(formData);
      }
      setShowModal(false);
      setEditingGroup(null);
      setFormData({ name: '', description: '', lead_ids: [] });
      fetchGroups();
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const handleEdit = (group) => {
    setEditingGroup(group);
    setFormData({
      name: group.name,
      description: group.description || '',
      lead_ids: group.leads.map(lead => lead.id)
    });
    setShowModal(true);
  };

  const handleDelete = async (groupId) => {
    if (window.confirm('Are you sure you want to delete this group?')) {
      try {
        await deleteGroup(groupId);
        fetchGroups();
      } catch (error) {
        console.error('Error deleting group:', error);
      }
    }
  };

  const handleLeadSelection = (leadId) => {
    setFormData(prev => ({
      ...prev,
      lead_ids: prev.lead_ids.includes(leadId)
        ? prev.lead_ids.filter(id => id !== leadId)
        : [...prev.lead_ids, leadId]
    }));
  };

  const handleStartGroupCall = (group) => {
    setSelectedGroup(group);
    setShowCallModal(true);
  };

  const handleCallPurposeConfirm = async (callPurposeData) => {
    try {
      const response = await createGroupCall({
        group_id: selectedGroup.id,
        ...callPurposeData
      });
      
      // Start the group call immediately
      await startGroupCall(response.data.id);
      
      setShowCallModal(false);
      setSelectedGroup(null);
      
      // Show success message and redirect to group calls
      alert('Group call campaign started successfully! Redirecting to Group Calls page...');
      window.location.href = '/group-calls';
    } catch (error) {
      console.error('Error starting group call:', error);
      alert('Failed to start group call campaign. Please try again.');
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
          <h1 className="text-3xl font-bold text-gray-900">Lead Groups</h1>
          <p className="text-gray-600 mt-2">Organize your leads into groups for efficient calling campaigns</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/group-calls"
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
                            <Phone className="h-5 w-5" />
            View Campaigns
          </Link>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Create Group
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{group.name}</h3>
                  <p className="text-sm text-gray-500">{group.leads.length} leads</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(group)}
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <Pencil className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleDelete(group.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {group.description && (
              <p className="text-gray-600 text-sm mb-4">{group.description}</p>
            )}
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Leads in this group:</h4>
              <div className="max-h-32 overflow-y-auto">
                {group.leads.map((lead) => (
                  <div key={lead.id} className="text-sm text-gray-600 py-1">
                    • {lead.name} - {lead.company || 'No company'}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleStartGroupCall(group)}
                disabled={group.leads.length === 0}
                className={`w-full px-4 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2 ${
                  group.leads.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Phone className="h-4 w-4" />
                Start Group Call
              </button>
            </div>
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No groups yet</h3>
          <p className="text-gray-500 mb-6">Create your first group to organize leads for calling campaigns</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto"
          >
            <Plus className="h-5 w-5" />
            Create Your First Group
          </button>
        </div>
      )}

      {/* Create/Edit Group Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingGroup ? 'Edit Group' : 'Create New Group'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter group description (optional)"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Leads
                  </label>
                  <div className="max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                    {leads.map((lead) => (
                      <label key={lead.id} className="flex items-center gap-3 py-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.lead_ids.includes(lead.id)}
                          onChange={() => handleLeadSelection(lead.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                          <div className="text-xs text-gray-500">{lead.company || 'No company'}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Selected: {formData.lead_ids.length} leads
                  </p>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                  >
                    {editingGroup ? 'Update Group' : 'Create Group'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingGroup(null);
                      setFormData({ name: '', description: '', lead_ids: [] });
                    }}
                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Call Purpose Modal for Group Calls */}
      <CallPurposeModal
        isOpen={showCallModal}
        onClose={() => setShowCallModal(false)}
        onConfirm={handleCallPurposeConfirm}
        title={`Start Group Call Campaign - ${selectedGroup?.name || 'Group'}`}
      />
    </div>
  );
};

export default Groups;
