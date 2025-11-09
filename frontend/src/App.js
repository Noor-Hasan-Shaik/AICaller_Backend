import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Groups from './pages/Groups';
import GroupCalls from './pages/GroupCalls';
import Calls from './pages/Calls';
import Reports from './pages/Reports';
import LeadForm from './pages/LeadForm';
import LeadDetail from './pages/LeadDetail';
import UploadLeads from './pages/UploadLeads';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="leads" element={<Leads />} />
            <Route path="groups" element={<Groups />} />
            <Route path="group-calls" element={<GroupCalls />} />
            <Route path="calls" element={<Calls />} />
            <Route path="reports" element={<Reports />} />
            <Route path="leads/new" element={<LeadForm />} />
            <Route path="leads/:id" element={<LeadDetail />} />
            <Route path="leads/:id/edit" element={<LeadForm />} />
            <Route path="upload" element={<UploadLeads />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 