const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: '✅ Firebase Backend is working!',
    timestamp: new Date().toISOString(),
    status: 'ready'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Blendpilot Firebase Backend (Test Mode)',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Test Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/test`);
  console.log('\n⚠️  This is a test server without Firebase integration');
  console.log('   Complete Firebase setup to use the full backend');
});
