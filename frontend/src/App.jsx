import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import { NewsContainer } from './components/news';
import SignIn from './pages/SignIn';
import { AuthProvider } from './context/AuthContext';
import './App.css';

// Placeholder components for routes
const Home = () => <NewsContainer />;

const CategoryPage = ({ category }) => (
  <div style={{ padding: '20px' }}>
    <h2>{category} বিভাগ</h2>
    <p>এই বিভাগের খবরগুলি এখানে দেখানো হবে।</p>
  </div>
);

const SearchPage = () => (
  <div style={{ padding: '20px' }}>
    <h2>খবর খুঁজুন</h2>
    <p>আপনার খোঁজা খবরগুলি এখানে দেখানো হবে।</p>
  </div>
);

const NotFound = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <h2>পৃষ্ঠা পাওয়া যায়নি</h2>
    <p>আপনি যে পৃষ্ঠাটি খুঁজছেন তা পাওয়া যায়নি।</p>
  </div>
);

function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 200px)' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/all-news" element={<CategoryPage category="সব খবর" />} />
                <Route path="/popular" element={<CategoryPage category="জনপ্রিয়" />} />
                <Route path="/cricket" element={<CategoryPage category="ক্রিকেট" />} />
                <Route path="/bengal-face" element={<CategoryPage category="বাংলার মুখ" />} />
                <Route path="/astrology" element={<CategoryPage category="ভাগ্যলিপি" />} />
                <Route path="/football" element={<CategoryPage category="ফুটবল" />} />
                <Route path="/bioscope" element={<CategoryPage category="বায়োস্কোপ" />} />
                <Route path="/photo-gallery" element={<CategoryPage category="ছবিঘর" />} />
                <Route path="/kolkata" element={<CategoryPage category="কলকাতা" />} />
                <Route path="/careers" element={<CategoryPage category="কর্মখালি" />} />
                <Route path="/web-stories" element={<CategoryPage category="ওয়েবস্টোরি" />} />
                <Route path="/lifestyle" element={<CategoryPage category="টুকিটাকি" />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
