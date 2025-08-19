const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'sangbad-bangla.appspot.com'
});

async function testFirebaseConnection() {
  try {
    console.log('🧪 Testing Firebase Connection...\n');

    // Test Firestore
    console.log('1. Testing Firestore Database...');
    const db = admin.firestore();
    const testDoc = await db.collection('test').doc('connection-test').get();
    console.log('✅ Firestore: Connected successfully');
    
    // Test Storage
    console.log('\n2. Testing Storage Bucket...');
    const bucket = admin.storage().bucket();
    const [files] = await bucket.getFiles({ maxResults: 1 });
    console.log('✅ Storage: Connected successfully');
    console.log(`   Bucket: ${bucket.name}`);
    
    // Test creating a test document
    console.log('\n3. Testing Document Creation...');
    const testData = {
      message: 'Firebase connection test',
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('test').doc('connection-test').set(testData);
    console.log('✅ Document Creation: Success');
    
    // Clean up test document
    await db.collection('test').doc('connection-test').delete();
    console.log('✅ Cleanup: Test document removed');
    
    console.log('\n🎉 All Firebase services are working correctly!');
    console.log('   You can now use the admin panel to create news.');
    
  } catch (error) {
    console.error('\n❌ Firebase Connection Error:');
    console.error('   Error:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('\n💡 Solution: Check your internet connection');
    } else if (error.code === 'PERMISSION_DENIED') {
      console.log('\n💡 Solution: Check Firestore security rules');
    } else if (error.code === 'BUCKET_NOT_FOUND') {
      console.log('\n💡 Solution: Enable Firebase Storage in console');
    }
    
    console.log('\n📋 Required Firebase Setup:');
    console.log('   1. Enable Firestore Database');
    console.log('   2. Enable Storage');
    console.log('   3. Set security rules to allow read/write');
  }
}

testFirebaseConnection().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});

