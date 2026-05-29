import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Challenge.css';
import FloatingChatbot from '/src/chatbot/FloatingChatbot';

const CHALLENGE_DATA = [
  {
    title: 'Intermediate to Advanced Coding',
    backgroundImage: '/images/IntermediateToAdvanceCoding.png'
  },
  {
    title: 'Basic Digital Literacy',
    backgroundImage: '/images/BasicDigital.png'
  },
  {
    title: 'Coding Fundamentals',
    backgroundImage: '/images/CodingFundamentals.png'
  },
  {
    title: 'Creative Tech Skills',
    backgroundImage: '/images/CreativeTechSkills.png'
  }
];

const Challenge = ({ onNavigate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const navigate = useNavigate();

  const nextSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    const cards = document.querySelectorAll('.compete-card');
    cards.forEach((card, index) => {
      if (index === 0) {
        card.classList.add('fade-out');
        card.style.setProperty('--initial-scale', '0.85');
        card.style.setProperty('--initial-opacity', '0.7');
      } else if (index === 1) {
        card.classList.add('slide-left');
        card.style.setProperty('--initial-scale', '1');
        card.style.setProperty('--initial-opacity', '1');
        card.style.setProperty('--final-scale', '0.85');
        card.style.setProperty('--final-opacity', '0.7');
      } else if (index === 2) {
        card.classList.add('slide-left');
        card.style.setProperty('--initial-scale', '0.85');
        card.style.setProperty('--initial-opacity', '0.7');
        card.style.setProperty('--final-scale', '1');
        card.style.setProperty('--final-opacity', '1');
      }
    });
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % CHALLENGE_DATA.length);
      cards.forEach(card => {
        card.classList.remove('slide-left', 'fade-out', 'fade-in');
        card.style.removeProperty('--initial-scale');
        card.style.removeProperty('--initial-opacity');
        card.style.removeProperty('--final-scale');
        card.style.removeProperty('--final-opacity');
      });
      setIsAnimating(false);
    }, 500);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    const cards = document.querySelectorAll('.compete-card');
    cards.forEach((card, index) => {
      if (index === 0) {
        card.classList.add('slide-right');
        card.style.setProperty('--initial-scale', '0.85');
        card.style.setProperty('--initial-opacity', '0.7');
        card.style.setProperty('--final-scale', '1');
        card.style.setProperty('--final-opacity', '1');
      } else if (index === 1) {
        card.classList.add('slide-right');
        card.style.setProperty('--initial-scale', '1');
        card.style.setProperty('--initial-opacity', '1');
        card.style.setProperty('--final-scale', '0.85');
        card.style.setProperty('--final-opacity', '0.7');
      } else if (index === 2) {
        card.classList.add('fade-out');
        card.style.setProperty('--initial-scale', '0.85');
        card.style.setProperty('--initial-opacity', '0.7');
      }
    });
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + CHALLENGE_DATA.length) % CHALLENGE_DATA.length);
      cards.forEach(card => {
        card.classList.remove('slide-right', 'fade-out', 'fade-in');
        card.style.removeProperty('--initial-scale');
        card.style.removeProperty('--initial-opacity');
        card.style.removeProperty('--final-scale');
        card.style.removeProperty('--final-opacity');
      });
      setIsAnimating(false);
    }, 500);
  };

  const getVisibleCards = () => {
    const cards = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % CHALLENGE_DATA.length;
      cards.push(CHALLENGE_DATA[index]);
    }
    return cards;
  };

  return (
    <div className="compete-root">
      <nav className="compete-navbar">
        <div className="compete-navbar-inner">
          <img src="/images/logo.png" alt="LoopTech Logo" className="compete-logo" />
          <ul className="compete-nav-list">
            <li
              className="compete-nav-item"
              onClick={() => navigate('/home')}
              style={{ cursor: 'pointer' }}
            >
              Learn
            </li>
            <li className="compete-nav-item active">Challenge</li>
            <li
              className="compete-nav-item"
              onClick={() => navigate('/leaderboard')}
              style={{ cursor: 'pointer' }}
            >
              Leaderboard
            </li>
          </ul>
          <div className="compete-profile-menu">
            <img src="/images/homepage/search.png" alt="Search" className="compete-header-icon" />
            <img src="/images/homepage/notification.png" alt="Notifications" className="compete-header-icon" />
            <span className="compete-profile-avatar" />
            <span className="compete-profile-name">Janette</span>
            <span className="compete-profile-caret">▼</span>
          </div>
        </div>
      </nav>

      <div className="compete-content">
        <h1 className="compete-title">Choose your challenge!</h1>
        <p className="compete-subtitle">Pick Your Game and Level Up Your Skills!</p>

        <div className="compete-carousel">
          <button
            className="compete-nav-btn compete-nav-prev"
            onClick={prevSlide}
            disabled={isAnimating}
          >
            <span>‹</span>
          </button>

          <div className={`compete-cards-container ${isAnimating ? 'sliding' : ''}`}>
            {getVisibleCards().map((challenge, index) => (
              <div
                key={`${challenge.title}-${currentIndex}-${index}`}
                className={`compete-card ${index === 1 ? 'center' : ''}`}
                onClick={() => {
                  if (challenge.title === 'Coding Fundamentals' && !isAnimating) {
                    navigate('/CodingFundamentals');
                  }
                }}
              >
                <img
                  src={challenge.backgroundImage}
                  alt={challenge.title}
                  className="compete-card-image"
                />
              </div>
            ))}
          </div>

          <button
            className="compete-nav-btn compete-nav-next"
            onClick={nextSlide}
            disabled={isAnimating}
          >
            <span>›</span>
          </button>
        </div>
      </div>
      <FloatingChatbot />
    </div>
  );
};

export default Challenge;
