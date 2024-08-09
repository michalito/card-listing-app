import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import AudioVisualizer from './components/AudioVisualizer';
import AudioInputSelector from './components/AudioInputSelector';
import './styles/App.css';

const App = () => {
  const [formData, setFormData] = useState({
    name: '',
    set: '',
    price: 1,
    quantity: 1,
    isFoil: false,
    condition: 'NM',
    language: 'English',
    comment: ''
  });

  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [stream, setStream] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(localStorage.getItem('defaultAudioDevice') || '');
  const [defaultSet, setDefaultSet] = useState(localStorage.getItem('defaultSet') || '');
  const [useDefaultSet, setUseDefaultSet] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [currentRecordingField, setCurrentRecordingField] = useState('');
  const [cardList, setCardList] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [transcribing, setTranscribing] = useState(false);

  useEffect(() => {
    if (selectedDevice) {
      navigator.mediaDevices.getUserMedia({ audio: { deviceId: selectedDevice } })
        .then(newStream => setStream(newStream))
        .catch(error => console.error('Error accessing audio device:', error));
    }

    if (defaultSet) {
      setFormData(prevFormData => ({ ...prevFormData, set: defaultSet }));
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [selectedDevice, defaultSet]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editIndex !== null) {
      updateCard(formData, editIndex);
    } else {
      addCard(formData);
    }
    setFormData({
      name: '',
      set: useDefaultSet ? defaultSet : '',
      price: 1,
      quantity: 1,
      isFoil: false,
      condition: 'NM',
      language: 'English',
      comment: ''
    });
    setEditIndex(null);
  };

  const addCard = (card) => {
    setCardList(prevCardList => [card, ...prevCardList]); // Add card to the top
  };

  const updateCard = (card, index) => {
    setCardList(prevCardList => prevCardList.map((c, i) => i === index ? card : c));
  };

  const deleteCard = (index) => {
    setCardList(prevCardList => prevCardList.filter((card, i) => i !== index));
  };

  const editCard = (index) => {
    const cardToEdit = cardList[index];
    setFormData(cardToEdit);
    setEditIndex(index);
  };

  const handleStartRecording = () => {
    if (!stream) {
      console.error('No audio stream available');
      return;
    }

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    audioChunksRef.current = [];
    mediaRecorder.ondataavailable = event => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
        console.log('Audio chunk captured:', event.data);
      }
    };
    mediaRecorder.start();
    setIsRecording(true);
  };

  const handleStopRecording = () => {
    if (!mediaRecorderRef.current) {
      return;
    }

    mediaRecorderRef.current.stop();
    setIsRecording(false);

    // Short delay to ensure all data is captured
    setTimeout(async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      console.log('Created Blob:', audioBlob);

      // Check the blob's type and size
      console.log('Blob Type:', audioBlob.type);
      console.log('Blob Size:', audioBlob.size);

      if (audioBlob.size > 0) {
        await handleTranscribe(audioBlob);
      } else {
        console.error('Audio Blob is empty');
      }
    }, 500); // Adjust delay as needed

    // Clear the audio chunks after blob creation
    audioChunksRef.current = [];
  };

  const handleTranscribe = async (audioBlob) => {
    setTranscribing(true);
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');
    formData.append('model', 'whisper-1');

    try {
      console.log('Audio Blob:', audioBlob);
      const response = await axios.post('http://localhost:5000/api/whisper', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      let transcribedText = response.data.text;
      
      // Remove punctuation from specific fields
      if (currentField === 'name' || currentField === 'set' || currentField === 'language') {
        transcribedText = transcribedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
      }

      if (currentField) {
        setFormData(prevFormData => ({
          ...prevFormData,
          [currentField]: transcribedText
        }));
      }
    } catch (error) {
      console.error('Error transcribing audio:', error);
    } finally {
      setTranscribing(false);
      setCurrentRecordingField('');
    }
  };

  const toggleStreaming = () => {
    setIsStreaming(!isStreaming);
    if (!isStreaming) {
      if (selectedDevice) {
        navigator.mediaDevices.getUserMedia({ audio: { deviceId: selectedDevice } })
          .then(newStream => setStream(newStream))
          .catch(error => console.error('Error accessing audio device:', error));
      }
    } else {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    }
  };

  const handleRecord = (field) => {
    setCurrentField(field);
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
    setCurrentRecordingField(isRecording ? '' : field);
  };

  const handleDefaultSetChange = () => {
    if (useDefaultSet) {
      localStorage.setItem('defaultSet', formData.set);
      setDefaultSet(formData.set);
    } else {
      localStorage.removeItem('defaultSet');
      setDefaultSet('');
    }
  };

  useEffect(() => {
    handleDefaultSetChange();
  }, [useDefaultSet, formData.set]);

  const headers = [
    { label: "Name", key: "name" },
    { label: "Set", key: "set" },
    { label: "Price", key: "price" },
    { label: "Quantity", key: "quantity" },
    { label: "Is Foil", key: "isFoil" },
    { label: "Condition", key: "condition" },
    { label: "Language", key: "language" },
    { label: "Comment", key: "comment" }
  ];

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="navbar-left">
          <h1>Card Manager</h1>
        </div>
        <div className="navbar-center">
          <div className="audio-settings">
            <label>Select Audio Input:</label>
            <AudioInputSelector onChange={setSelectedDevice} />
            <button type="button" className="stream-btn" onClick={toggleStreaming}>
              {isStreaming ? 'Stop Streaming' : 'Start Streaming'}
            </button>
            {stream && isStreaming && <AudioVisualizer stream={stream} />}
          </div>
        </div>
        <div className="navbar-right">
          <CSVLink data={cardList} headers={headers} filename="cards.csv" className="download-csv-btn">
            Download CSV
          </CSVLink>
        </div>
      </nav>
      <div className="content">
        <div className="card-list-container">
          <div className="card-list-header">
            <h2>Card List</h2>
            <p>Number of Cards: {cardList.length}</p>
          </div>
          <table className="card-list">
            <thead>
              <tr>
                <th>Name</th>
                <th>Set</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Is Foil</th>
                <th>Condition</th>
                <th>Language</th>
                <th>Comment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cardList.map((card, index) => (
                <tr key={index}>
                  <td>{card.name}</td>
                  <td>{card.set}</td>
                  <td>{card.price}</td>
                  <td>{card.quantity}</td>
                  <td>{card.isFoil ? 'Yes' : 'No'}</td>
                  <td>{card.condition}</td>
                  <td>{card.language}</td>
                  <td>{card.comment}</td>
                  <td>
                    <button className="edit-btn" onClick={() => editCard(index)}>Edit</button>
                    <button className="delete-btn" onClick={() => deleteCard(index)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form onSubmit={handleSubmit} className="card-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
            <button type="button" className={currentRecordingField === 'name' ? 'recording' : ''} onClick={() => handleRecord('name')}>Record</button>
          </div>
          <div className="form-group">
            <label>Set</label>
            <input type="text" name="set" value={formData.set} onChange={handleChange} placeholder="Set" required />
            <div className="set-controls">
              <div className="default-set">
                <input type="checkbox" checked={useDefaultSet} onChange={() => setUseDefaultSet(!useDefaultSet)} />
                <label>Default</label>
              </div>
              <button type="button" className={currentRecordingField === 'set' ? 'recording' : ''} onClick={() => handleRecord('set')}>Record</button>
            </div>
          </div>
          <div className="form-group">
            <label>Price</label>
            <input type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Price" required />
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required />
          </div>
          <div className="form-group">
            <label>Is Foil</label>
            <input type="checkbox" name="isFoil" checked={formData.isFoil} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Condition</label>
            <select name="condition" value={formData.condition} onChange={handleChange} required>
              <option value="NM">NM</option>
              <option value="EX">EX</option>
              <option value="GD">GD</option>
              <option value="LP">LP</option>
              <option value="PL">PL</option>
              <option value="PO">PO</option>
            </select>
          </div>
          <div className="form-group">
            <label>Language</label>
            <input type="text" name="language" value={formData.language} onChange={handleChange} placeholder="Language" required />
            <button type="button" className={currentRecordingField === 'language' ? 'recording' : ''} onClick={() => handleRecord('language')}>Record</button>
          </div>
          <div className="form-group">
            <label>Comment</label>
            <textarea name="comment" value={formData.comment} onChange={handleChange} placeholder="Comment" />
            <button type="button" className={currentRecordingField === 'comment' ? 'recording' : ''} onClick={() => handleRecord('comment')}>Record</button>
          </div>
          
          <button type="submit">{editIndex !== null ? 'Update Card' : 'Add Card'}</button>
        </form>
      </div>
      {transcribing && <p className="transcribing">Transcribing...</p>}
    </div>
  );
};

export default App;
