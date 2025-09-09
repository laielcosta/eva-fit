import React from 'react';
import { Home, TrendingUp, MessageCircle, UserCircle } from 'lucide-react';

const BottomNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home', icon: Home, label: 'Inicio' },
    { id: 'progress', icon: TrendingUp, label: 'Progreso' },
    { id: 'assistant', icon: MessageCircle, label: 'EVA' },
    { id: 'profile', icon: UserCircle, label: 'Perfil' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 z-20">
      <div className="flex justify-around">
        {tabs.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
              activeTab === id 
                ? 'text-emerald-600 bg-emerald-50' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs mt-1">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;