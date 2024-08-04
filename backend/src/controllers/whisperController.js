const axios = require('axios');
const FormData = require('form-data');

exports.processAudio = async (req, res) => {
  try {
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: 'audio.wav',
      contentType: 'audio/wav'
    });
    form.append('model', 'whisper-1');  // Specify the model

    console.log('File Details:', {
      filename: 'audio.wav',
      contentType: 'audio/wav',
      size: req.file.buffer.length,
    });

    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders()
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error with Whisper API:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'An error occurred with the Whisper API' });
  }
};

// exports.testAudioFile = async (req, res) => {
//   try {
//     const sampleFilePath = path.join(__dirname, '..', '..', 'test-files', 'sample.wav'); // Correct the path
//     const form = new FormData();
//     form.append('file', fs.createReadStream(sampleFilePath), 'sample.wav');
//     form.append('model', 'whisper-1');

//     const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', form, {
//       headers: {
//         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//         ...form.getHeaders()
//       }
//     });

//     res.json(response.data);
//   } catch (error) {
//     console.error('Error with Whisper API:', error.response ? error.response.data : error.message);
//     res.status(500).json({ error: 'An error occurred with the Whisper API' });
//   }
// };
