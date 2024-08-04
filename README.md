## Card Listing Application Documentation

### Overview

The Card Listing application is a web-based platform for managing card entries. Users can add new cards, view the list of cards, transcribe audio input into text, and download the card list as a CSV file. The application is built with React for the frontend and Node.js for the backend, integrating with the Whisper API for audio transcription.

### Repository Structure

```
card-listing-app/
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── models/
│   │   └── server.js
│   ├── tests/
│   ├── test-files/
│   │   └── sample.wav
│   ├── .env.example
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   ├── index.js
│   │   └── styles/
│   ├── tests/
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
│
├── .gitignore
├── docker-compose.yml
└── README.md
```

### Features

1. **Add New Cards**:
   - Users can add new cards by filling out a form with fields such as Name, Set, Price, Quantity, Is Foil, Condition, Language, and Comment.
   - Cards are added to the top of the list.

2. **View Card List**:
   - The card list is displayed on the left side of the screen.
   - The list includes various columns such as Name, Set, Price, Quantity, Is Foil, Condition, Language, and Comment.
   - The number of cards is displayed next to the Card List title.

3. **Audio Transcription**:
   - Users can transcribe audio input into text for specific fields (Name, Set, Language, and Comment).
   - The transcription functionality uses the Whisper API.
   - Punctuation is removed from transcribed text for Name, Set, and Language fields.

4. **Download CSV**:
   - Users can download the card list as a CSV file.
   - The Download CSV button is available in the navbar.

5. **Audio Settings**:
   - Users can select the audio input device and start/stop audio streaming.
   - Audio settings are available in the navbar for easy access.

### Improvements

1. **Error Handling**:
   - Implement more robust error handling for network requests and audio processing.
   - Provide user feedback for errors and loading states.

2. **Form Validation**:
   - Enhance form validation to ensure all fields are correctly filled out before submission.
   - Provide real-time validation feedback to users.

3. **Responsive Design**:
   - Improve the responsive design to ensure the application works well on various screen sizes and devices.
   - Adjust layout and styling for better usability on mobile devices.

4. **Testing**:
   - Add more comprehensive unit and integration tests for both frontend and backend.
   - Ensure all components and functionalities are thoroughly tested.

5. **Performance Optimization**:
   - Optimize performance for large card lists.
   - Implement pagination or infinite scrolling for the card list to improve load times and user experience.