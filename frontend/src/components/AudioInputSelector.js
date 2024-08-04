import React, { useState, useEffect } from 'react';
import '../styles/AudioInputSelector.css';

const AudioInputSelector = ({ onChange }) => {
  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(localStorage.getItem('defaultAudioDevice') || '');

  useEffect(() => {
    const getDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      setDevices(audioDevices);

      const defaultDevice = audioDevices.find(device => device.deviceId === selectedDevice) || audioDevices[0];
      if (defaultDevice) {
        setSelectedDevice(defaultDevice.deviceId);
        onChange(defaultDevice.deviceId);
      }
    };

    getDevices();
  }, [onChange, selectedDevice]);

  const handleChange = (event) => {
    const deviceId = event.target.value;
    setSelectedDevice(deviceId);
    localStorage.setItem('defaultAudioDevice', deviceId);
    onChange(deviceId);
  };

  return (
    <div className="audio-input-selector">
      <label>Select Audio Input:</label>
      <select value={selectedDevice} onChange={handleChange}>
        {devices.map(device => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Microphone ${device.deviceId}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AudioInputSelector;
