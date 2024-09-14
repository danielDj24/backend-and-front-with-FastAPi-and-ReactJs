import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faTimes } from '@fortawesome/free-solid-svg-icons';

const VideoModal = ({ show, handleClose, videoUrl }) => {
    if (!show) {
        return null;
    }

    return (
        <div className="video-modal-overlay" onClick={handleClose}>
            <div className="video-modal-content" onClick={(e) => e.stopPropagation()}>
                <button className="close-modal-btn" onClick={handleClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <div className="video-container">
                    <iframe
                        width="100%"
                        height="400"
                        src={videoUrl}
                        title="YouTube video player"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default VideoModal;
