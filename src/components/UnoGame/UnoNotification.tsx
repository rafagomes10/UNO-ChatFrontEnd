import React from 'react';

interface UnoNotificationProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const UnoNotification: React.FC<UnoNotificationProps> = ({ message, type, onClose }) => {
  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  return (
    <div className={`relative ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg`}>
      {message}
      <button
        onClick={onClose}
        className="absolute top-1 right-1 text-white hover:text-gray-200 p-1"
      >
        ×
      </button>
    </div>
  );
};

export default UnoNotification;