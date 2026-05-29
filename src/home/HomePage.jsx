import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';
import CourseDetail from './CourseDetail';
import Challenge from '../challenges/Challenge';
import FloatingChatbot from '/src/chatbot/FloatingChatbot';
import Leaderboard from './Leaderboard';

const COURSE_DATA = [
  {
    title: 'Basic Digital Literacy',
    category: 'Digital Literacy',
    icon: '/images/homepage/course-icon-1.png',
  },
  {
    title: 'Coding Fundamentals',
    category: 'Programming',
    icon: '/images/homepage/course-icon-2.png',
  },
  {
    title: 'Internet Safety',
    category: 'Digital Literacy',
    icon: '/images/homepage/course-icon--4.png',
  },
  {
    title: 'Communication Skills',
    category: 'Digital Literacy',
    icon: '/images/homepage/course-icon-5.png',
  },
  {
    title: 'Creative Tech Skills',
    category: 'Digital Literacy',
    icon: '/images/homepage/course-icon-3.png',
  },
  {
    title: 'App Development',
    category: 'Programming',
    icon: '/images/homepage/course-icon-6.png',
  },
  {
    title: 'AI Basics',
    category: 'Programming',
    icon: '/images/homepage/course-icon-7.png',
  },
  {
    title: 'Data Science',
    category: 'Programming',
    icon: '/images/homepage/course-icon-8.png',
  },
  // New Types of Games Offered
  {
    title: 'Puzzle Games',
    category: 'Types of Games Offered',
    icon: '/images/homepage/course-icon-1.png',
  },
  {
    title: 'Trivia Games',
    category: 'Types of Games Offered',
    icon: '/images/homepage/course-icon-2.png',
  },
  {
    title: 'Adventure Games',
    category: 'Types of Games Offered',
    icon: '/images/homepage/course-icon-3.png',
  },
  {
    title: 'Simulation Games',
    category: 'Types of Games Offered',
    icon: '/images/homepage/course-icon-4.png',
  },
];

const SECTIONS = [
  { title: 'Overall Courses', filter: () => true },
  { title: 'Digital Literacy', filter: c => c.category === 'Digital Literacy' },
  { title: 'Programming', filter: c => c.category === 'Programming' },
  { title: 'Types of Games Offered', filter: c => c.category === 'Types of Games Offered' },
];

const HomePage = () => {
  const navigate = useNavigate();
  const rowRefs = useRef([]);
  const sectionBlockRefs = useRef([]);
  const courseCardRefs = useRef([]);
  const [showDetail, setShowDetail] = useState(false);
  const [currentView, setCurrentView] = useState('learn');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const profileMenuRef = useRef(null);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');
  const languageOptions = [
    'English (US)',
    'Filipino',
    'Cebuano',
    'Ilocano',
    'Hiligaynon',
  ];
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-up-visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    sectionBlockRefs.current.forEach((el) => el && observer.observe(el));
    courseCardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (currentView !== 'learn') return;
    sectionBlockRefs.current.forEach(el => el && el.classList.remove('fade-up-visible'));
    courseCardRefs.current.forEach(el => el && el.classList.remove('fade-up-visible'));
    const observer = new window.IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-up-visible');
          }
        });
      },
      { threshold: 0.15 }
    );
    sectionBlockRefs.current.forEach((el) => el && observer.observe(el));
    courseCardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [currentView]);

  const translations = {
    en: {
      welcome: 'Welcome back!',
      overallCourses: 'Overall Courses',
      digitalLiteracy: 'Digital Literacy',
      programming: 'Programming',
      typesOfGames: 'Types of Games Offered',
      nav: ['Learn', 'Challenge', 'Leaderboard'],
      courses: [
        'Basic Digital Literacy',
        'Coding Fundamentals',
        'Internet Safety',
        'Communication Skills',
        'Creative Tech Skills',
        'App Development',
        'AI Basics',
        'Data Science',
        'Puzzle Games',
        'Trivia Games',
        'Adventure Games',
        'Simulation Games',
      ],
    },
    fil: {
      welcome: 'Maligayang pagbabalik!',
      overallCourses: 'Kabuuang mga Kurso',
      digitalLiteracy: 'Digital Literacy',
      programming: 'Pagprograma',
      typesOfGames: 'Mga Uri ng Laro na Inaalok',
      nav: ['Matuto', 'Hamon', 'Leaderboard'],
      courses: [
        'Teknolohiyang Digital',
        'Kaalaman sa Pag-coding',
        'Kaligtasan sa Internet',
        'Kasanayan sa Komunikasyon',
        'Creative Tech Skills',
        'Pagbuo ng App',
        'Mga Batayan ng AI',
        'Agham ng Datos',
        'Puzzle na Laro',
        'Trivia na Laro',
        'Pakikipagsapalaran na Laro',
        'Simulation na Laro',
      ],
    },
  };

  const langCode = selectedLanguage === 'Filipino' ? 'fil' : 'en';

  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    }
    if (showProfileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProfileMenu]);

  const scrollRow = (idx, dir) => {
    const row = rowRefs.current[idx];
    if (row) {
      const scrollAmount = row.offsetWidth * 0.8;
      row.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  const handleNavigation = (view) => {
    setCurrentView(view);
    setShowDetail(false);
  };

  if (currentView === 'compete') {
    return <Challenge onNavigate={handleNavigation} />;
  }

  if (currentView === 'leaderboard') {
    return <Leaderboard onNavigate={handleNavigation} />;
  }

  if (showDetail) {
    return <CourseDetail />;
  }

  return (
    <div className={`home-root${darkMode ? ' dark-mode' : ''}`}>
      <nav className="home-navbar home-navbar-sticky">
        <div className="home-navbar-inner">
          <img src="/images/logo.png" alt="LoopTech Logo" className="home-logo" />
          <ul className="home-nav-list">
            <li
              className={`home-nav-item ${currentView === 'learn' ? 'active' : ''}`}
              onClick={() => handleNavigation('learn')}
              style={{ cursor: 'pointer' }}
            >
              {translations[langCode].nav[0]}
            </li>
            <li 
              className={`home-nav-item ${currentView === 'compete' ? 'active' : ''}`}
              onClick={() => handleNavigation('compete')}
              style={{ cursor: 'pointer' }}
            >
              {translations[langCode].nav[1]}
            </li>
            <li 
              className={`home-nav-item ${currentView === 'leaderboard' ? 'active' : ''}`}
              onClick={() => handleNavigation('leaderboard')}
              style={{ cursor: 'pointer' }}
            >
              {translations[langCode].nav[2]}
            </li>
          </ul>
          <div className="home-profile-menu" style={{ position: 'relative' }} ref={profileMenuRef}>
            <img src="/images/homepage/search.png" alt="Search" className="home-header-icon" />
            <img src="/images/homepage/notification.png" alt="Notifications" className="home-header-icon" />
            <img src="/images/homepage/avatar.png" alt="Avatar" className="home-profile-avatar" />
            <span className="home-profile-name">Janette</span>
            <span 
              className="home-profile-caret" 
              style={{ cursor: 'pointer', color: showProfileMenu ? '#ea580c' : undefined }}
              onClick={() => setShowProfileMenu((v) => !v)}
            >
              ▼
            </span>
            {showProfileMenu && (
              <div className="profile-dropdown-menu" style={{
                position: 'absolute',
                top: 'calc(100% + 12px)',
                right: 0,
                background: '#fff',
                borderRadius: '24px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
                padding: '32px 36px',
                zIndex: 100,
                minWidth: '220px',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
              }}>
                <div className="profile-dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer' }}>
                  <img src="/images/homepage/generic-avatar.png" alt="Profile" style={{ width: 32, height: 32, borderRadius: '50%' }} />
                  <span>Profile</span>
                </div>
                <div className="profile-dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer' }}>
                  <img src="/images/homepage/settings.png" alt="Settings" style={{ width: 32, height: 32 }} />
                  <span>Settings</span>
                </div>
                <div className="profile-dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer' }}
                   onClick={() => setDarkMode((d) => !d)}>
                   <img src={darkMode ? "/images/homepage/toggle-on.png" : "/images/homepage/toggle-off.png"} alt="Dark Mode" style={{ width: 32, height: 32 }} />
                   <span>Dark Mode</span>
                 </div>
                <div className="profile-dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer' }}
                  onClick={() => setShowLanguageModal(true)}>
                  <img src="/images/homepage/language.png" alt="Language" style={{ width: 32, height: 32 }} />
                  <span>Language</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      {showLanguageModal && (
        <div
          className="fixed inset-0 bg-black/45 flex items-center justify-center z-[2000]"
          onClick={() => setShowLanguageModal(false)}
        >
          <div
            className="bg-white rounded-[24px] p-9 w-80 shadow-[0_8px_32px_rgba(0,0,0,0.18)] flex flex-col gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-[22px] font-bold text-center text-orange-600 mb-2">
              Choose Language
            </h2>
            <div className="flex flex-col gap-4">
              {languageOptions.map((lang) => (
                <label
                  key={lang}
                  className="flex items-center gap-3 text-[18px] cursor-pointer"
                >
                  <input
                    type="radio"
                    name="language"
                    value={lang}
                    checked={selectedLanguage === lang}
                    onChange={() => setSelectedLanguage(lang)}
                    className="accent-orange-600 w-[18px] h-[18px]"
                  />
                  {lang}
                </label>
              ))}
            </div>
            <button
              onClick={() => setShowLanguageModal(false)}
              className="mt-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-[12px] text-[18px] py-2 w-full"
            >
              Save
            </button>
          </div>
        </div>
      )}

      <div className={`home-content${fadeIn ? ' fade-in' : ''}`}>
        <h1 className="home-welcome">{translations[langCode].welcome}</h1>
        {SECTIONS.map((section, idx) => (
          <div
            key={section.title}
            className="home-section-block fade-up"
            ref={el => (sectionBlockRefs.current[idx] = el)}
          >
            <div className="home-section-header">
              <div className="home-section-title">
                {section.title === 'Overall Courses' ? translations[langCode].overallCourses :
                 section.title === 'Digital Literacy' ? translations[langCode].digitalLiteracy :
                 section.title === 'Programming' ? translations[langCode].programming :
                 section.title === 'Types of Games Offered' ? translations[langCode].typesOfGames :
                 section.title}
              </div>
            </div>
            <div className="home-courses-row" ref={el => rowRefs.current[idx] = el}>
              {COURSE_DATA.filter(section.filter).map((course, i) => (
                <div
                  className="home-course-card fade-up"
                  key={course.title}
                  ref={el => {
                    if (!courseCardRefs.current) courseCardRefs.current = [];
                    courseCardRefs.current[idx * 10 + i] = el;
                  }}
                >
                  <div className="home-course-icon-wrap">
                    <img src={course.icon} alt={course.title} className="home-course-icon" />
                  </div>
                  <div className="home-course-card-top"></div>
                  <div className="home-course-card-bottom">
                    <div className="home-course-title">
                      {translations[langCode].courses[
                        COURSE_DATA.findIndex(c => c.title === course.title)
                      ] || course.title}
                    </div>
                  </div>
                  <button
                    className="home-course-play"
                    onClick={
                      course.title === 'Basic Digital Literacy'
                        ? () => setShowDetail(true)
                        : course.title === 'Coding Fundamentals'
                          ? () => navigate('/course/coding-fundamentals-detail')
                          : undefined
                    }
                  >
                    <img src="/images/homepage/play-button.png" alt="Play" className="home-play-icon" />
                  </button>
                </div>
              ))}
            </div>
            <div className="home-courses-scroll-btns">
              <div className="home-courses-icons-left">
                <img src="/images/homepage/bookmark.png" alt="Bookmark" className="home-courses-icon-btn" />
                <img src="/images/homepage/history.png" alt="History" className="home-courses-icon-btn" />
              </div>
              <div style={{ flex: 1 }} />
              <button className="home-courses-scroll-btn left" onClick={() => scrollRow(idx, -1)}>
                <img src="/images/homepage/arrow-left.png" alt="Left" />
              </button>
              <button className="home-courses-scroll-btn right" onClick={() => scrollRow(idx, 1)}>
                <img src="/images/homepage/arrow-right.png" alt="Right" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <FloatingChatbot />
    </div>
  );
};

export default HomePage;
