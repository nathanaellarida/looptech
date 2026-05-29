import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CourseDetail.css';

const COURSE_DETAIL = {
  title: 'Coding Fundamentals',
  description:
    'Master the basics of coding with hands-on projects and interactive lessons. Learn programming concepts, logic, and problem-solving skills essential for every aspiring coder.',
  content: [
    { title: 'Welcome to Coding', unlocked: true },
    { title: 'Playing with Data', unlocked: false },
    { title: 'Making Choices', unlocked: false },
    { title: 'Looping Fun', unlocked: false },
    { title: 'Let’s Build Something!', unlocked: false },
  ],
};

const CourseDetailCodingFundamentals = () => {
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

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

  return (
    <div className="course-detail-page">
      {/* Top Navigation Bar (matches HomePage) */}
      <nav className="home-navbar home-navbar-sticky">
        <div className="home-navbar-inner">
          <img src="/images/logo.png" alt="LoopTech Logo" className="home-logo" />
          <ul className="home-nav-list">
            <li 
              className={"home-nav-item active"} 
              onClick={() => navigate('/home')}
              style={{ cursor: 'pointer' }}
            >
              Learn
            </li>
            <li 
              className="home-nav-item"
              onClick={() => navigate('/Challenge')}
              style={{ cursor: 'pointer' }}
            >
              Challenge
            </li>
            <li className="home-nav-item" onClick={() => navigate('/leaderboard')} style={{ cursor: 'pointer' }}>Leaderboard</li>
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
                <div className="profile-dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer' }}>
                  <img src="/images/homepage/toggle-off.png" alt="Dark Mode" style={{ width: 32, height: 32 }} />
                  <span>Dark Mode</span>
                </div>
                <div className="profile-dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '18px', cursor: 'pointer' }}>
                  <img src="/images/homepage/language.png" alt="Language" style={{ width: 32, height: 32 }} />
                  <span>Language</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      <div className="course-detail-card">
        {/* Decorative course image, absolutely positioned and overflowing left */}
        <img 
          src="/images/homepage/course-icon-2.png" 
          alt="Course Icon" 
          className="course-detail-card-image" 
        />
        <div className="course-detail-card-inner">
          <div className="course-detail-header">
            <h1 className="course-detail-title">{COURSE_DETAIL.title}</h1>
            <button className="course-detail-fav">
              <img src="/images/course-detail/bookmark.png" alt="Favorite" className="course-detail-fav-icon" />
              Favorite
            </button>
          </div>
          <p className="course-detail-desc">{COURSE_DETAIL.description}</p>
          <div className="course-detail-section-title">Course Content</div>
          <div className="course-detail-content-row">
            {/* Timeline */}
            <div className="course-detail-timeline">
              {COURSE_DETAIL.content.map((item, idx) => (
                <React.Fragment key={item.title}>
                  <div className={`course-detail-timeline-dot${idx === 0 ? ' active' : ''}`}></div>
                  {idx < COURSE_DETAIL.content.length - 1 && <div className="course-detail-timeline-line" />}
                </React.Fragment>
              ))}
            </div>
            {/* Module List */}
            <div className="course-detail-list">
              {COURSE_DETAIL.content.map((item, idx) => (
                <div className="course-detail-list-item" key={item.title}>
                  <span className="course-detail-list-title">{item.title}</span>
                  <span className="course-detail-list-icon-wrap">
                    {item.unlocked ? (
                      <img
                        src="/images/course-detail/play-button.png"
                        alt="Play"
                        className="course-detail-list-icon"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/course/form')}
                      />
                    ) : (
                      <img src="/images/course-detail/locked-icon.png" alt="Locked" className="course-detail-list-icon" />
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailCodingFundamentals; 