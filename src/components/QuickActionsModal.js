import React from 'react';
import { Search, Scan, Dumbbell, Camera, X, Activity } from 'lucide-react';
import { STYLES, COLORS, NAVIGATION } from '../services/constants';

const QuickActionsModal = ({ isVisible, onClose, onNavigate }) => {
  if (!isVisible) return null;

  const handleAction = (screen) => {
    onNavigate(screen);
    onClose();
  };

  return (
    <div className={STYLES.modal}>
      <div className={STYLES.modalContent}>
        <div className="flex justify-between items-center">
          <h3 className={`text-lg font-semibold text-${COLORS.text.primary}`}>Acciones Rápidas</h3>
          <button onClick={onClose}>
            <X className={`w-6 h-6 text-${COLORS.text.muted}`} />
          </button>
        </div>
        
        <div className="space-y-3">
          {NAVIGATION.quickActions.map((action, index) => {
            const IconComponent = {
              Search,
              Scan, 
              Dumbbell,
              Camera,
              Activity // ← Añadido
            }[action.icon];
            
            return (
              <button
                key={action.id}
                onClick={() => handleAction(action.screen)}
                className={`w-full flex items-center space-x-3 p-4 bg-${COLORS.primaryShades[50]} hover:bg-${COLORS.primaryShades[100]} rounded-lg transition-colors`}
              >
                <IconComponent className={`w-6 h-6 text-${COLORS.primaryShades[600]}`} />
                <span className={`font-medium text-${COLORS.primaryShades[700]}`}>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsModal;