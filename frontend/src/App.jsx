import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import Navbar from './components/Navbar';
import Sidebar from './components/layout/Sidebar';
import Footer from './components/layout/Footer';
import { NewsContainer } from './components/news';
import SignIn from './pages/SignIn';

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
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const handleSidebarToggle = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSidebarClose = () => {
    setIsSidebarOpen(false);
  };

  return (
    
      <Router>
        <div className="App">
          <Navbar onSidebarToggle={handleSidebarToggle} />
          <Sidebar isOpen={isSidebarOpen} onClose={handleSidebarClose} />
          <div className="app-layout container">
            <main className="app-main">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/all-news" element={<CategoryPage category="সব খবর" />} />
                <Route path="/popular" element={<CategoryPage category="জনপ্রিয়" />} />
                <Route path="/technology" element={<CategoryPage category="প্রযুক্তি" />} />
                <Route path="/environment" element={<CategoryPage category="পরিবেশ" />} />
                <Route path="/culture" element={<CategoryPage category="সংস্কৃতি" />} />
                <Route path="/education" element={<CategoryPage category="শিক্ষা" />} />
                <Route path="/tourism" element={<CategoryPage category="পর্যটন" />} />
                <Route path="/economy" element={<CategoryPage category="অর্থনীতি" />} />
                <Route path="/health" element={<CategoryPage category="স্বাস্থ্য" />} />
                <Route path="/industry" element={<CategoryPage category="শিল্প" />} />
                <Route path="/agriculture" element={<CategoryPage category="কৃষি" />} />
                <Route path="/art" element={<CategoryPage category="শিল্পকলা" />} />
                <Route path="/science" element={<CategoryPage category="বিজ্ঞান" />} />
                <Route path="/sports" element={<CategoryPage category="খেলাধুলা" />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
          <Footer />
        </div>
      </Router>
   
  );
}

export default App;
