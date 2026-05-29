import React, { useState } from 'react';
import './Onboarding.css';

const OnboardingLanguageRegion = ({ onNext, onBack }) => {
  const [language, setLanguage] = useState('English (US)');
  const [region, setRegion] = useState('Region VII');

  return (
    <div className="onboarding-bg">
      <div className="onboarding-card animate-fade-in">
        <div className="onboarding-top-row">
          <button className="onboarding-back" onClick={onBack} aria-label="Back">
            <svg viewBox="0 0 32 32"><line x1="24" y1="16" x2="8" y2="16"/><polyline points="14 10 8 16 14 22"/></svg>
          </button>
          <div className="onboarding-progress">
            <div className="onboarding-progress-bar" style={{width: '66%'}} />
          </div>
        </div>
        <h2 className="onboarding-title">What's your language and which region do you live?</h2>
        <p className="onboarding-desc">
          This helps us find you more localized content. We won’t show it on your profile.
        </p>
        <div className="onboarding-field-row">
          <select className="onboarding-input" value={language} onChange={e => setLanguage(e.target.value)}>
            <option>English (US)</option>
            <option>Filipino</option>
            <option>Cebuano</option>
            <option>Ilocano</option>
            <option>Hiligaynon</option>
          </select>
        </div>
        <div className="onboarding-field-row">
          <select className="onboarding-input" value={region} onChange={e => setRegion(e.target.value)}>
            <option>Region I</option>
            <option>Region II</option>
            <option>Region III</option>
            <option>Region IV-A</option>
            <option>Region IV-B</option>
            <option>Region V</option>
            <option>Region VI</option>
            <option>Region VII</option>
            <option>Region VIII</option>
            <option>Region IX</option>
            <option>Region X</option>
            <option>Region XI</option>
            <option>Region XII</option>
            <option>Region XIII</option>
            <option>NCR</option>
            <option>CAR</option>
            <option>BARMM</option>
          </select>
        </div>
        <button className="onboarding-btn" onClick={() => onNext({ language, region })}>Next</button>
      </div>
    </div>
  );
};

export default OnboardingLanguageRegion; 