const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');

console.log('🔍 Testing Firebase Connection...');
console.log('Project ID:', serviceAccount.project_id);
console.log('Storage Bucket:', process.env.FIREBASE_STORAGE_BUCKET);

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });

  const db = admin.firestore();
  const bucket = admin.storage().bucket();

  console.log('✅ Firebase Admin SDK initialized successfully');

  // Test Firestore connection
  console.log('🔍 Testing Firestore connection...');
  db.collection('test').doc('test').get()
    .then((doc) => {
      console.log('✅ Firestore connection successful');
      console.log('Document exists:', doc.exists);
    })
    .catch((error) => {
      console.log('❌ Firestore error:', error.code, error.message);
      if (error.code === 'NOT_FOUND') {
        console.log('💡 This usually means Firestore Database is not enabled');
        console.log('💡 Go to Firebase Console → Firestore Database → Get Started');
      }
    });

  // Test Storage connection
  console.log('🔍 Testing Storage connection...');
  bucket.exists()
    .then(([exists]) => {
      console.log('✅ Storage connection successful');
      console.log('Bucket exists:', exists);
    })
    .catch((error) => {
      console.log('❌ Storage error:', error.code, error.message);
      if (error.code === 'NOT_FOUND') {
        console.log('💡 This usually means Storage is not enabled');
        console.log('💡 Go to Firebase Console → Storage → Get Started');
      }
    });

} catch (error) {
  console.log('❌ Firebase initialization error:', error.message);
}
