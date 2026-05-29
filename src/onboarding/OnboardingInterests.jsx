import React, { useState } from 'react';
import './Onboarding.css';

const INTERESTS = [
  { label: 'Digital Safety', img: '/images/onboarding/digital-safety.jpg' },
  { label: 'Problem Solving', img: '/images/onboarding/problem-solving.jpg' },
  { label: 'Web Development', img: '/images/onboarding/web-development.jpg' },
  { label: 'App Development', img: '/images/onboarding/app-development.jpg' },
  { label: 'Cybersecurity Basics', img: '/images/onboarding/cybersecurity.jpg' },
  { label: 'Artificial Intelligence', img: '/images/onboarding/artificial-intelligence.jpg' },
  { label: 'Machine Learning', img: '/images/onboarding/machine-learning.jpg' },
  { label: 'Data Science', img: '/images/onboarding/data-science.jpg' },
  { label: 'UI/UX', img: '/images/onboarding/ui-ux.jpg' },
];

const OnboardingInterests = ({ onBack, onFinish }) => {
  const [selected, setSelected] = useState([]);

  const toggleInterest = (label) => {
    setSelected(sel => sel.includes(label)
      ? sel.filter(l => l !== label)
      : sel.length < 5 ? [...sel, label] : sel
    );
  };

  return (
    <div className="onboarding-bg">
      <div className="onboarding-card animate-fade-in">
        <div className="onboarding-top-row">
          <button className="onboarding-back" onClick={onBack} aria-label="Back">
            <svg viewBox="0 0 32 32"><line x1="24" y1="16" x2="8" y2="16"/><polyline points="14 10 8 16 14 22"/></svg>
          </button>
        </div>
        <div className="onboarding-progress">
          <div className="onboarding-progress-bar" style={{width: '100%'}} />
        </div>
        <h2 className="onboarding-title">What are you interested in?</h2>
        <p className="onboarding-desc">This will customize your home feed.</p>
        <div className="onboarding-interests-grid">
          {INTERESTS.map(interest => (
            <div
              key={interest.label}
              className={`onboarding-interest-card${selected.includes(interest.label) ? ' selected' : ''}`}
              onClick={() => toggleInterest(interest.label)}
              style={{backgroundImage: `url('${interest.img}')`, backgroundSize: 'cover', backgroundPosition: 'center'}}
            >
              <span className="onboarding-interest-label">{interest.label}</span>
            </div>
          ))}
        </div>
        <button className="onboarding-btn" disabled={selected.length < 5} onClick={() => onFinish(selected)}>
          {selected.length < 5 ? `Pick ${5 - selected.length} more` : 'Continue'}
        </button>
      </div>
    </div>
  );
};

export default OnboardingInterests; 