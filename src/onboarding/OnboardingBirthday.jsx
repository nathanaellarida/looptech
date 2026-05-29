import React, { useState } from 'react';
import './Onboarding.css';

const OnboardingBirthday = ({ onNext }) => {
  const [birthday, setBirthday] = useState('');

  return (
    <div className="onboarding-bg">
      <div className="onboarding-card animate-fade-in">
        <div className="onboarding-progress">
          <div className="onboarding-progress-bar" style={{width: '33%'}} />
        </div>
        <h2 className="onboarding-title">Enter your birthday</h2>
        <p className="onboarding-desc">
          Your birthdate also helps us provide more personalized recommendations and relevant ads.<br/>
          We won’t share this information without your permission and it won’t be visible on your profile.
        </p>
        <div className="onboarding-field-row">
          <input
            type="date"
            className="onboarding-input"
            value={birthday}
            onChange={e => setBirthday(e.target.value)}
            placeholder="mm/dd/yyyy"
          />
        </div>
        <button className="onboarding-btn" onClick={() => onNext(birthday)} disabled={!birthday}>Next</button>
      </div>
    </div>
  );
};

export default OnboardingBirthday; 