import React from 'react';

const RecordingIndicator = ({ isRecording }) => {
  return (
    <div>
      {isRecording ? (
        <div style={{ color: 'red' }}>Recording...</div>
      ) : (
        <div style={{ color: 'green' }}>Not Recording</div>
      )}
    </div>
  );
};

export default RecordingIndicator;
