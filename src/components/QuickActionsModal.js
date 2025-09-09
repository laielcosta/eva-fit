import React from 'react';
import { Search, Scan, Dumbbell, Camera, X } from 'lucide-react';

const QuickActionsModal = ({ isVisible, onClose, onNavigate }) => {
  if (!isVisible) return null;

  const handleAction = (screen) => {
    onNavigate(screen);
    onClose();
  };

  const actions = [
    {
      icon: Search,
      label: 'Buscar Alimento',
      screen: 'search',
      color: 'emerald'
    },
    {
      icon: Scan,
      label: 'Escanear Código',
      screen: 'barcode',
      color: 'emerald'
    },
    {
      icon: Dumbbell,
      label: 'Registrar Ejercicio',
      screen: 'workouts',
      color: 'emerald'
    },
    {
      icon: Camera,
      label: 'Foto de Comida',
      screen: 'assistant',
      color: 'emerald'
    }
  ];

  return (
    <div className="fixed inset-0 z-40 bg-black bg-opacity-50 flex items-end justify-center">
      <div className="bg-white rounded-t-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Acciones Rápidas</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>
        
        <div className="space-y-3">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => handleAction(action.screen)}
              className={`w-full flex items-center space-x-3 p-4 bg-${action.color}-50 hover:bg-${action.color}-100 rounded-lg transition-colors`}
            >
              <action.icon className={`w-6 h-6 text-${action.color}-600`} />
              <span className={`font-medium text-${action.color}-700`}>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickActionsModal;