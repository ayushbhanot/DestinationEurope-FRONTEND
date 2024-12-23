import React from 'react';
import './Popup.css';

const Popup = ({ isVisible, onClose, children }) => {
    if (!isVisible) return null;

    return (
        <div className="popup-overlay">
            <div className="popup-container">
                <div className="popup-content">{children}</div>
                <button
                    className="popup-exit-button"
                    onClick={onClose}
                >
                    Exit
                </button>
            </div>
        </div>
    );
};

export default Popup;
