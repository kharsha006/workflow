import React from 'react';

const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = '480px' }) => {
  if (!isOpen) return null;

  return (
    <div className={`modal-backdrop ${isOpen ? 'open' : ''}`}>
      <div className="modal" style={{ maxWidth }}>
        <div className="modal-hdr">
          <div>
            <div className="modal-title">{title}</div>
            {subtitle && <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>{subtitle}</div>}
          </div>
          <button className="modal-close" onClick={onClose}>
            <i className="fas fa-xmark"></i>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;
