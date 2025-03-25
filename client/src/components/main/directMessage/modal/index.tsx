import React from 'react';
import './index.css'; // Create this CSS file with the styles below

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;
  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal-content' onClick={e => e.stopPropagation()}>
        <button className='modal-close' onClick={onClose}>
          <i className='fa-solid fa-x'></i>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
