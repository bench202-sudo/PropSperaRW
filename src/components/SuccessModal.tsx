import React from 'react';
import { CheckCircleIcon, ClockIcon } from '@/components/icons/Icons';

interface SuccessModalProps {
  title: string;
  message: string;
  onClose: () => void;
  type?: 'success' | 'pending';
  actionLabel?: string;
  onAction?: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ 
  title, 
  message, 
  onClose,
  type = 'success',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 text-center animate-slide-up">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
          type === 'success' ? 'bg-green-100' : 'bg-amber-100'
        }`}>
          {type === 'success' ? (
            <CheckCircleIcon size={32} className="text-green-600" />
          ) : (
            <ClockIcon size={32} className="text-amber-600" />
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500 mb-6">{message}</p>
        {actionLabel && onAction && (
          <button
            onClick={() => { onAction(); onClose(); }}
            className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors mb-3"
          >
            {actionLabel}
          </button>
        )}
        <button
          onClick={onClose}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
};

export default SuccessModal;
