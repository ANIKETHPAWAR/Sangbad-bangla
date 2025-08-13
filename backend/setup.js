#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Blendpilot Firebase Backend Setup');
console.log('=====================================\n');

// Check if firebase-service-account.json exists
const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(serviceAccountPath)) {
  console.log('❌ Firebase service account file not found!');
  console.log('\n📋 Setup Steps:');
  console.log('1. Go to Firebase Console: https://console.firebase.google.com/');
  console.log('2. Select your project (or create new one)');
  console.log('3. Go to Project Settings → Service Accounts');
  console.log('4. Click "Generate New Private Key"');
  console.log('5. Download the JSON file');
  console.log('6. Rename it to "firebase-service-account.json"');
  console.log('7. Place it in the backend/ directory');
  console.log('\n⚠️  IMPORTANT: Never commit this file to git!\n');
} else {
  console.log('✅ Firebase service account file found');
}

// Check if .env exists
if (!fs.existsSync(envPath)) {
  console.log('❌ Environment file (.env) not found!');
  console.log('\n📋 Environment Setup:');
  console.log('1. Copy env.example to .env:');
  console.log('   cp env.example .env');
  console.log('\n2. Update the following values in .env:');
  console.log('   - FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com');
  console.log('   - CORS_ORIGIN=http://localhost:3000,http://localhost:5173');
  console.log('\n3. Get your storage bucket from Firebase Console → Storage\n');
} else {
  console.log('✅ Environment file (.env) found');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('❌ Dependencies not installed!');
  console.log('\n📦 Install dependencies:');
  console.log('   npm install\n');
} else {
  console.log('✅ Dependencies installed');
}

// Check if all required files exist
const requiredFiles = [
  'server.js',
  'package.json',
  'README.md'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${file} not found!`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('✅ All required files present');
}

console.log('\n🎯 Next Steps:');
console.log('1. Complete Firebase setup (if not done)');
console.log('2. Configure environment variables');
console.log('3. Install dependencies: npm install');
console.log('4. Start development server: npm run dev');
console.log('\n📚 For detailed instructions, see README.md');
console.log('\n🚀 Happy coding!');
