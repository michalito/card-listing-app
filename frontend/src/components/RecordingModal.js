import React from 'react';
import '../styles/RecordingModal.css';

const RecordingModal = ({ isRecording, onStart, onStop, onClose }) => {
  return (
    <div className="recording-modal">
      <div className="recording-modal-content">
        <h2>{isRecording ? 'Recording...' : 'Ready to Record'}</h2>
        <button onClick={isRecording ? onStop : onStart}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button onClick={onClose} disabled={isRecording}>
          Close
        </button>
      </div>
    </div>
  );
};

export default RecordingModal;
