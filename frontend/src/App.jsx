import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Page Components
import SignIn from './pages/SignIn';
import SectionPage from './pages/SectionPage';

// News Components
import NewsContainer from './components/news/NewsContainer';
import ArticlePage from './components/news/ArticlePage';
import ArticleDetailPage from './components/news/ArticleDetailPage';
import TrendingNewsSidebar from './components/news/TrendingNewsSidebar';


// Simple Cricket News Page Component
const CricketNewsPage = () => {
  return (
    <div className="cricket-news-page">
      <div className="page-header">
        <h1>ক্রিকেট আপডেট</h1>
        <p>সর্বশেষ ক্রিকেট খবর এবং স্কোর</p>
      </div>
      <div className="page-content">
        <div className="main-content">
          <div className="cricket-info">
            <p>ক্রিকেট বিভাগটি আপডেট হচ্ছে। শীঘ্রই নতুন ফিচার আসছে!</p>
          </div>
        </div>
        <TrendingNewsSidebar />
      </div>
    </div>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Router>
      <div className="App">
        <Header onMenuClick={toggleSidebar} />
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<NewsContainer />} />
            <Route path="/all-news" element={<NewsContainer />} />
            <Route path="/article/:articleId" element={<ArticlePage />} />
            <Route path="/section/:sectionName/:numberOfStories" element={<SectionPage />} />
            <Route path="/popular" element={<NewsContainer />} />
            <Route path="/cricket" element={<CricketNewsPage />} />
            <Route path="/bengal-face" element={<NewsContainer />} />
            <Route path="/astrology" element={<NewsContainer />} />
            <Route path="/football" element={<NewsContainer />} />
            <Route path="/bioscope" element={<NewsContainer />} />
            <Route path="/photo-gallery" element={<NewsContainer />} />
            <Route path="/kolkata" element={<NewsContainer />} />
            <Route path="/careers" element={<NewsContainer />} />
            <Route path="/web-stories" element={<NewsContainer />} />
            <Route path="/lifestyle" element={<NewsContainer />} />
            <Route path="/special-report" element={<NewsContainer />} />
            <Route path="/horoscope" element={<NewsContainer />} />
            <Route path="/gold-rate" element={<NewsContainer />} />
            <Route path="/cricket-live" element={<NewsContainer />} />
            <Route path="/category" element={<NewsContainer />} />
            <Route path="/panchpuran" element={<NewsContainer />} />
            <Route path="/trending" element={<NewsContainer />} />
            <Route path="/national" element={<NewsContainer />} />
            <Route path="/tech-talk" element={<NewsContainer />} />
            <Route path="/sports" element={<NewsContainer />} />
            <Route path="/must-see" element={<NewsContainer />} />
            <Route path="/about" element={<NewsContainer />} />
            <Route path="/about-us" element={<NewsContainer />} />
            <Route path="/contact" element={<NewsContainer />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/profile" element={<NewsContainer />} />
            <Route path="/settings" element={<NewsContainer />} />
            <Route path="/help" element={<NewsContainer />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
