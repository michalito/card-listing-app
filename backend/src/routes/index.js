const express = require('express');
const router = express.Router();
const whisperController = require('../controllers/whisperController');
const multer = require('multer');
const upload = multer();

// Define routes
router.post('/whisper', upload.single('file'), whisperController.processAudio);
// router.get('/test-audio', whisperController.testAudioFile);

module.exports = router;
