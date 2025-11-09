import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Upload, 
  List, 
  BarChart3, 
  Download,
  Settings,
  Users,
  Zap,
  Target,
  Sparkles,
  Activity,
  Shield
} from 'lucide-react';

const QuickActions = () => {
  const actions = [
    {
      title: 'Add New Lead',
      description: 'Create a new lead manually',
      icon: Plus,
      href: '/leads/new',
      color: 'primary',
      gradient: 'from-primary-500 to-primary-600',
      bgGradient: 'from-primary-50 to-primary-100'
    },
    {
      title: 'Import CSV',
      description: 'Bulk import leads from CSV file',
      icon: Upload,
      href: '/upload',
      color: 'success',
      gradient: 'from-success-500 to-success-600',
      bgGradient: 'from-success-50 to-success-100'
    },
    {
      title: 'View Calls',
      description: 'Check call history and status',
      icon: List,
      href: '/calls',
      color: 'secondary',
      gradient: 'from-secondary-500 to-secondary-600',
      bgGradient: 'from-secondary-50 to-secondary-100'
    },
    {
      title: 'View Reports',
      description: 'Analytics and performance reports',
      icon: BarChart3,
      href: '/reports',
      color: 'warning',
      gradient: 'from-warning-500 to-warning-600',
      bgGradient: 'from-warning-50 to-warning-100'
    },
    {
      title: 'Export Data',
      description: 'Download leads and calls data',
      icon: Download,
      href: '/export',
      color: 'info',
      gradient: 'from-success-500 to-success-600',
      bgGradient: 'from-success-50 to-success-100'
    },
    {
      title: 'System Settings',
      description: 'Configure system preferences',
      icon: Settings,
      href: '/settings',
      color: 'dark',
      gradient: 'from-slate-500 to-slate-600',
      bgGradient: 'from-slate-50 to-slate-100'
    }
  ];

  return (
    <div className="card card-hover">
      <div className="card-header">
        <h3 className="text-xl font-bold text-slate-900 flex items-center">
          <Zap className="h-6 w-6 mr-3 text-primary-600" />
          Quick Actions
        </h3>
      </div>
      <div className="card-body">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <div
                key={action.title}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Link
                  to={action.href}
                  className="block group relative overflow-hidden"
                >
                  {/* Background glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.bgGradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
                  
                  {/* Main card */}
                  <div className="relative bg-white/80 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-glass hover:shadow-soft-lg transition-all duration-300 transform hover:scale-105">
                    <div className="flex items-center">
                      <div className={`w-16 h-16 bg-gradient-to-r ${action.gradient} rounded-2xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-slate-900 group-hover:text-primary-600 transition-colors duration-200 mb-2">
                          {action.title}
                        </h4>
                        <p className="text-sm text-slate-600 group-hover:text-slate-700 transition-colors duration-200">
                          {action.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Hover effect line */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${action.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

      
      </div>
    </div>
  );
};

export default QuickActions; 