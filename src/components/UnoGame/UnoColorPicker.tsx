import React from 'react';
import { UnoCardColor } from '@/types/unoGame';

interface UnoColorPickerProps {
  onColorSelect: (color: UnoCardColor) => void;
  onClose: () => void;
}

const UnoColorPicker: React.FC<UnoColorPickerProps> = ({ onColorSelect, onClose }) => {
  const colors: Exclude<UnoCardColor, null>[] = ['red', 'blue', 'green', 'yellow'];
  
  const getColorClass = (color: Exclude<UnoCardColor, null>) => {
    const colorMap: Record<Exclude<UnoCardColor, null>, string> = {
      red: 'bg-red-500 hover:bg-red-600',
      blue: 'bg-blue-500 hover:bg-blue-600',
      green: 'bg-green-500 hover:bg-green-600',
      yellow: 'bg-yellow-500 hover:bg-yellow-600',
    };
    return colorMap[color];
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-2xl">  {/* Changed from rounded-xl to rounded-lg */}
        <h3 className="text-xl font-bold mb-4 text-center">Escolha uma cor</h3>
        <div className="grid grid-cols-2 gap-4">
          {colors.map(color => (
            <button
              key={color}
              onClick={() => {
                onColorSelect(color);
                onClose();
              }}
              className={`
                w-24 h-24 rounded-lg
                ${getColorClass(color)}
                transform hover:scale-105
                transition-all duration-200
                flex items-center justify-center
                text-white font-bold text-lg
                shadow-md
              `}
            >
              {color.toUpperCase()}
            </button>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-4 w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default UnoColorPicker;