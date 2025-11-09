import React, { useState } from 'react';
import { X, MessageSquare, DollarSign, FileText } from 'lucide-react';

const CallPurposeModal = ({ isOpen, onClose, onConfirm, title = "Call Purpose" }) => {
  const [purpose, setPurpose] = useState('general');
  const [customPrompt, setCustomPrompt] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      purpose,
      custom_prompt: purpose === 'custom_purpose' ? customPrompt : null,
      additional_notes: additionalNotes
    });
    onClose();
  };

  const handleClose = () => {
    setPurpose('general');
    setCustomPrompt('');
    setAdditionalNotes('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Call Purpose Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Call Purpose *
            </label>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="purpose"
                  value="feedback"
                  checked={purpose === 'feedback'}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-900">Feedback Collection</span>
                </div>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="purpose"
                  value="upsell"
                  checked={purpose === 'upsell'}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-900">Upsell Opportunity</span>
                </div>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="purpose"
                  value="custom_purpose"
                  checked={purpose === 'custom_purpose'}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-900">Custom Purpose</span>
                </div>
              </label>
            </div>
          </div>

          {/* Custom Prompt Input */}
          {purpose === 'custom_purpose' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Call Purpose *
              </label>
              <textarea
                required
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the specific purpose of this call..."
              />
            </div>
          )}

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Any additional context or instructions for the call..."
            />
            <p className="text-xs text-gray-500 mt-1">
              These notes will be incorporated into the AI's conversation strategy
            </p>
          </div>

          {/* Purpose Description */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Purpose Description:</h4>
            <div className="text-sm text-gray-600">
              {purpose === 'feedback' && (
                <p>This call will focus on collecting feedback about our products/services, understanding customer satisfaction, and identifying areas for improvement.</p>
              )}
              {purpose === 'upsell' && (
                <p>This call will identify upselling opportunities by understanding current usage, pain points, and presenting relevant upgrade options.</p>
              )}
              {purpose === 'custom_purpose' && customPrompt && (
                <p><strong>Custom Purpose:</strong> {customPrompt}</p>
              )}
              {purpose === 'general' && (
                <p>This will be a general cold calling conversation focused on lead qualification and relationship building.</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Start Call
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CallPurposeModal;
