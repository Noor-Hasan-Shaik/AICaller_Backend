import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeft,
  Download
} from 'lucide-react';
import { apiService } from '../services/api';
import toast from 'react-hot-toast';

const UploadLeads = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = useMutation(
    (file) => apiService.uploadLeads(file),
    {
      onSuccess: (data) => {
        toast.success(`Successfully imported ${data.imported_count} leads`);
        queryClient.invalidateQueries('leads');
        queryClient.invalidateQueries('recent-leads');
        navigate('/leads');
      },
      onError: (error) => {
        toast.error('Failed to upload leads');
      }
    }
  );

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast.error('Please select a CSV file');
      }
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setSelectedFile(file);
      } else {
        toast.error('Please select a CSV file');
      }
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    uploadMutation.mutate(selectedFile);
  };

  const removeFile = () => {
    setSelectedFile(null);
  };

  const downloadTemplate = () => {
    const csvContent = `name,phone,email,company,title,address,notes,priority,status
John Doe,+1234567890,john@example.com,Example Corp,Manager,123 Main St,Notes here,3,pending
Jane Smith,+1234567891,jane@example.com,Another Corp,Director,456 Oak Ave,More notes,2,pending`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'leads_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/leads')}
            className="btn btn-outline btn-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Upload Leads</h1>
            <p className="text-gray-600 mt-1">Import leads from a CSV file</p>
          </div>
        </div>
        <button
          onClick={downloadTemplate}
          className="btn btn-outline"
        >
          <Download className="h-4 w-4 mr-2" />
          Download Template
        </button>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div className="card-body">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-12 w-12 text-success-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedFile.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {(selectedFile.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleUpload}
                    disabled={uploadMutation.isLoading}
                    className="btn btn-primary"
                  >
                    {uploadMutation.isLoading ? (
                      <div className="loading-spinner mr-2"></div>
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    Upload File
                  </button>
                  <button
                    onClick={removeFile}
                    className="btn btn-outline"
                  >
                    Remove File
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  <Upload className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Upload CSV File
                  </h3>
                  <p className="text-sm text-gray-600">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                </div>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="btn btn-primary cursor-pointer"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Choose File
                </label>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-warning-600" />
            CSV Format Instructions
          </h3>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Required Columns:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><strong>name</strong> - Full name of the lead</li>
                <li><strong>phone</strong> - Phone number (with country code)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Optional Columns:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><strong>email</strong> - Email address</li>
                <li><strong>company</strong> - Company name</li>
                <li><strong>title</strong> - Job title</li>
                <li><strong>address</strong> - Physical address</li>
                <li><strong>notes</strong> - Additional notes</li>
                <li><strong>priority</strong> - Priority level (1-5, default: 3)</li>
                <li><strong>status</strong> - Lead status (default: pending)</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Example CSV:</h4>
              <pre className="text-sm text-gray-600 overflow-x-auto">
{`name,phone,email,company,title,priority,status
John Doe,+1234567890,john@example.com,Example Corp,Manager,3,pending
Jane Smith,+1234567891,jane@example.com,Another Corp,Director,2,pending`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadLeads; 