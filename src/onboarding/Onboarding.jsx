import React, { useState } from 'react';
import OnboardingBirthday from './OnboardingBirthday';
import OnboardingLanguageRegion from './OnboardingLanguageRegion';
import OnboardingInterests from './OnboardingInterests';
import HomePage from '../home/HomePage';

const Onboarding = ({ onFinish }) => {
  const [step, setStep] = useState(0);
  const [birthday, setBirthday] = useState('');
  const [languageRegion, setLanguageRegion] = useState({});
  const [interests, setInterests] = useState([]);
  const [showHome, setShowHome] = useState(false);

  const nextBirthday = (bday) => {
    setBirthday(bday);
    setStep(1);
  };
  const nextLanguage = (langReg) => {
    setLanguageRegion(langReg);
    setStep(2);
  };
  const finishInterests = (selected) => {
    setInterests(selected);
    setShowHome(true);
    if (onFinish) onFinish({ birthday, ...languageRegion, interests: selected });
  };

  if (showHome) {
    return <HomePage interests={interests} />;
  }

  return (
    <>
      {step === 0 && <OnboardingBirthday onNext={nextBirthday} />}
      {step === 1 && <OnboardingLanguageRegion onNext={nextLanguage} onBack={() => setStep(0)} />}
      {step === 2 && <OnboardingInterests onBack={() => setStep(1)} onFinish={finishInterests} />}
    </>
  );
};

//CHANGE

export default Onboarding; 