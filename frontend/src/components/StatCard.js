import React from 'react';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color = 'primary', trend, trendValue, trendDirection }) => {
  const getColorClasses = (color) => {
    switch (color) {
      case 'primary':
        return {
          icon: 'text-primary-600',
          bg: 'bg-gradient-to-r from-primary-500 to-primary-600',
          text: 'text-primary-600',
          light: 'bg-primary-50',
          border: 'border-primary-200'
        };
      case 'success':
        return {
          icon: 'text-success-600',
          bg: 'bg-gradient-to-r from-success-500 to-success-600',
          text: 'text-success-600',
          light: 'bg-success-50',
          border: 'border-success-200'
        };
      case 'warning':
        return {
          icon: 'text-warning-600',
          bg: 'bg-gradient-to-r from-warning-500 to-warning-600',
          text: 'text-warning-600',
          light: 'bg-warning-50',
          border: 'border-warning-200'
        };
      case 'danger':
        return {
          icon: 'text-danger-600',
          bg: 'bg-gradient-to-r from-danger-500 to-danger-600',
          text: 'text-danger-600',
          light: 'bg-danger-50',
          border: 'border-danger-200'
        };
      case 'secondary':
        return {
          icon: 'text-secondary-600',
          bg: 'bg-gradient-to-r from-secondary-500 to-secondary-600',
          text: 'text-secondary-600',
          light: 'bg-secondary-50',
          border: 'border-secondary-200'
        };
      default:
        return {
          icon: 'text-primary-600',
          bg: 'bg-gradient-to-r from-primary-500 to-primary-600',
          text: 'text-primary-600',
          light: 'bg-primary-50',
          border: 'border-primary-200'
        };
    }
  };

  const colorClasses = getColorClasses(color);

  return (
    <div className="group relative">
      {/* Background glow effect */}
      <div className={`absolute inset-0 ${colorClasses.light} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300`}></div>
      
      {/* Main card */}
      <div className="relative card card-hover border-0 overflow-hidden">
        {/* Gradient overlay */}
        <div className={`absolute top-0 right-0 w-32 h-32 ${colorClasses.bg} opacity-10 rounded-full -translate-y-16 translate-x-16`}></div>
        
        <div className="card-body relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-600 mb-2">{title}</p>
              <p className="text-3xl font-bold text-slate-900 mb-3">{value}</p>
              
              {/* Trend indicator */}
              {trendValue && (
                <div className="flex items-center space-x-2">
                  <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                    trendDirection === 'up' ? 'bg-success-100' : 'bg-danger-100'
                  }`}>
                    {trendDirection === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 text-success-600" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-danger-600" />
                    )}
                    <span className={`text-xs font-semibold ${
                      trendDirection === 'up' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {trendValue}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">vs last week</span>
                </div>
              )}
            </div>
            
            {/* Icon container */}
            <div className={`w-16 h-16 ${colorClasses.bg} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
              <Icon className="h-8 w-8 text-white" />
            </div>
          </div>
          
          {/* Bottom accent line */}
          <div className={`absolute bottom-0 left-0 right-0 h-1 ${colorClasses.bg} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
        </div>
      </div>
    </div>
  );
};

export default StatCard; 