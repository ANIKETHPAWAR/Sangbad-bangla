import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Sidebar from './components/layout/Sidebar';

// Page Components
import SignIn from './pages/SignIn';

// News Components
import NewsContainer from './components/news/NewsContainer';
import ArticlePage from './components/news/ArticlePage';
import ArticleDetailPage from './components/news/ArticleDetailPage';
import TrendingNewsSidebar from './components/news/TrendingNewsSidebar';
import CategoryNewsPage from './components/news/CategoryNewsPage';

// Admin Components
import RequireAdmin from './components/admin/RequireAdmin';
import AdminDashboard from './components/admin/AdminDashboard';
import NewsForm from './components/admin/NewsForm';
import TempLogin from './components/admin/TempLogin';
import Advertise from './pages/Advertise';
import StaticPage from './pages/StaticPage';
import { staticPages } from './pages/static/content';


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
            <Route path="/section/:sectionName/:numberOfStories" element={<ArticleDetailPage />} />
            <Route path="/popular" element={<NewsContainer />} />
            <Route path="/cricket" element={<CricketNewsPage />} />
            <Route path="/bengal-face" element={<CategoryNewsPage sectionKey="bengal" title="বাংলার মুখ" />} />
            <Route path="/astrology" element={<CategoryNewsPage sectionKey="astrology" title="ভাগ্যলিপি" />} />
            <Route path="/football" element={<CategoryNewsPage sectionKey="football" title="ফুটবলের মহারণ" />} />
            <Route path="/bioscope" element={<CategoryNewsPage sectionKey="bioscope" title="বায়োস্কোপ" />} />
            <Route path="/photo-gallery" element={<CategoryNewsPage sectionKey="pictures" title="ছবিঘর" />} />
            <Route path="/kolkata" element={<CategoryNewsPage sectionKey="kolkata" title="কলকাতা" />} />
            <Route path="/careers" element={<CategoryNewsPage sectionKey="career" title="কর্মখালি" />} />
            <Route path="/web-stories" element={<CategoryNewsPage sectionKey="web-stories" title="ওয়েবস্টোরি" />} />
            <Route path="/lifestyle" element={<CategoryNewsPage sectionKey="lifestyle" title="টুকিটাকি" />} />
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
            <Route path="/rss" element={<StaticPage title={staticPages.rss.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.rss.html }} /> </StaticPage>} />
            <Route path="/about" element={<StaticPage title={staticPages.about.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.about.html }} /> </StaticPage>} />
            <Route path="/about-us" element={<StaticPage title={staticPages.about.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.about.html }} /> </StaticPage>} />
            <Route path="/contact" element={<StaticPage title={staticPages.contact.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.contact.html }} /> </StaticPage>} />
            <Route path="/privacy" element={<StaticPage title={staticPages.privacy.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.privacy.html }} /> </StaticPage>} />
            <Route path="/terms" element={<StaticPage title={staticPages.terms.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.terms.html }} /> </StaticPage>} />
            <Route path="/sitemap" element={<StaticPage title={staticPages.sitemap.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.sitemap.html }} /> </StaticPage>} />
            <Route path="/archive" element={<StaticPage title={staticPages.archive.title}> <div dangerouslySetInnerHTML={{ __html: staticPages.archive.html }} /> </StaticPage>} />
            <Route path="/advertise" element={<Advertise />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/admin-login" element={<TempLogin />} />
            <Route path="/profile" element={<NewsContainer />} />
            <Route path="/settings" element={<NewsContainer />} />
            <Route path="/help" element={<NewsContainer />} />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            } />
            <Route path="/admin/new" element={
              <RequireAdmin>
                <NewsForm />
              </RequireAdmin>
            } />
            <Route path="/admin/edit/:id" element={
              <RequireAdmin>
                <NewsForm />
              </RequireAdmin>
            } />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
