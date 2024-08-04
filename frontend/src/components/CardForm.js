import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import RecordingIndicator from './RecordingIndicator';
import AudioVisualizer from './AudioVisualizer';
import AudioInputSelector from './AudioInputSelector';
import '../styles/CardForm.css';

const CardForm = ({ addCard }) => {
  const [formData, setFormData] = useState({
    name: '',
    set: '',
    price: '',
    quantity: '',
    isFoil: false,
    condition: '',
    language: '',
    comment: ''
  });

  const [isRecording, setIsRecording] = useState(false);
  const [stream, setStream] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState('');
  const [showAudioControls, setShowAudioControls] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [transcribing, setTranscribing] = useState(false);

  useEffect(() => {
    const getStream = async () => {
      if (selectedDevice) {
        const newStream = await navigator.mediaDevices.getUserMedia({
          audio: { deviceId: selectedDevice }
        });
        setStream(newStream);
      }
    };

    getStream();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDevice]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addCard(formData);
    setFormData({
      name: '',
      set: '',
      price: '',
      quantity: '',
      isFoil: false,
      condition: '',
      language: '',
      comment: ''
    });
  };

  const handleStartRecording = () => {
    if (!stream) return;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = event => {
      audioChunksRef.current.push(event.data);
    };
    mediaRecorder.onstop = handleStopRecording;
    mediaRecorder.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const handleTranscribe = async (audioBlob) => {
    setTranscribing(true);
    const formData = new FormData();
    formData.append('audioData', audioBlob, 'audio.wav');

    try {
      const response = await axios.post('http://localhost:5000/api/whisper', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const transcribedText = response.data.text;
      // Update the form fields with the transcribed text
      const fields = transcribedText.split(', ');
      const newFormData = {};
      fields.forEach(field => {
        const [key, value] = field.split(': ');
        if (key && value) {
          newFormData[key] = value;
        }
      });
      setFormData(newFormData);
    } catch (error) {
      console.error('Error transcribing audio', error);
    } finally {
      setTranscribing(false);
    }
  };

  const handleStopRecordingWithTranscription = async () => {
    handleStopRecording();
    const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
    audioChunksRef.current = [];
    await handleTranscribe(audioBlob);
  };

  const toggleAudioControls = () => {
    setShowAudioControls(!showAudioControls);
  };

  return (
    <div className="card-form-container">
      <button className="toggle-audio-controls-btn" onClick={toggleAudioControls}>Audio Settings</button>
      {showAudioControls && (
        <div className="audio-controls">
          <AudioInputSelector onChange={setSelectedDevice} />
          <button type="button" onClick={isRecording ? handleStopRecording : handleStartRecording}>
            {isRecording ? 'Stop Recording' : 'Speak Input'}
          </button>
          <RecordingIndicator isRecording={isRecording} />
          {stream && <AudioVisualizer stream={stream} />}
        </div>
      )}
      <form onSubmit={handleSubmit} className="card-form">
        <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
        <input type="text" name="set" value={formData.set} onChange={handleChange} placeholder="Set" required />
        <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" required />
        <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required />
        <label>
          Is Foil:
          <input type="checkbox" name="isFoil" checked={formData.isFoil} onChange={handleChange} />
        </label>
        <input type="text" name="condition" value={formData.condition} onChange={handleChange} placeholder="Condition" required />
        <input type="text" name="language" value={formData.language} onChange={handleChange} placeholder="Language" required />
        <textarea name="comment" value={formData.comment} onChange={handleChange} placeholder="Comment" />
        
        <button type="submit">Add Card</button>
      </form>
      <button className="transcribe-btn" onClick={handleStopRecordingWithTranscription}>Transcribe Using Whisper</button>
      {transcribing && <p className="transcribing">Transcribing...</p>}
    </div>
  );
};

export default CardForm;
