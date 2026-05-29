import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CodingFundamentals.css';
import FloatingChatbot from '/src/chatbot/FloatingChatbot';

const challenges = {
  concepts: [
    {
      title: 'Variables and Data Types',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Start',
      actionImage: 'Start.svg',
    },
    {
      title: 'Conditionals',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Start',
      actionImage: 'Start.svg',
    },
    {
      title: 'Loops',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Unlock',
      actionImage: 'Unlock.svg',
    },
    {
      title: 'Functions',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Unlock',
      actionImage: 'Unlock.svg',
    },
  ],
  practicalBasic: [
    {
      title: 'Print Squares',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Start',
      actionImage: 'Start.svg',
    },
    {
      title: 'Palindrome Number',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Unlock',
      actionImage: 'Unlock.svg',
    },
    {
      title: 'Longest Common Prefix',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Start',
      actionImage: 'Start.svg',
    },
    {
      title: 'Valid Parentheses',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Unlock',
      actionImage: 'Unlock.svg',
    },
  ],
  practicalModerate: [
    {
      title: 'Palindromic Substring',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Start',
      actionImage: 'Start.svg',
    },
    {
      title: 'Zigzag Conversion',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Unlock',
      actionImage: 'Unlock.svg',
    },
    {
      title: 'Reverse Integer',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Start',
      actionImage: 'Start.svg',
    },
    {
      title: 'String to Integer',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Unlock',
      actionImage: 'Unlock.svg',
    },
  ],
  practicalAdvanced: [
    {
      title: 'Regular Expression',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Start',
      actionImage: 'Start.svg',
    },
    {
      title: 'Two Sorted Arrays',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Unlock',
      actionImage: 'Unlock.svg',
    },
    {
      title: 'Reverse Nodes',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Unlock',
      actionImage: 'Unlock.svg',
    },
    {
      title: 'Valid Parentheses',
      desc: 'Identify and pick safe websites from screenshots.',
      action: 'Unlock',
      actionImage: 'Unlock.svg',
    },
  ],
};

const Card = ({ title, desc, action, actionImage, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="rounded-3xl p-5 w-full max-w-[300px] h-[180px] mb-4 shadow-md flex flex-col justify-between bg-gradient-to-br from-[#FF7C34] to-[#FFC482] transform origin-bottom transition-transform duration-300 hover:scale-102 cursor-pointer"
    >
      <div>
        <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
        <p className="text-white text-sm">{desc}</p>
      </div>
      <div className="flex justify-end">
        <div
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onClick();
            }
          }}
          className="focus:outline-none focus:ring-2 focus:ring-white rounded"
        >
          <img
            src={`/images/${actionImage}`}
            alt={action}
            className="max-w-full max-h-full transition-transform duration-300 hover:scale-110"
          />
        </div>
      </div>
    </div>
  );
};

const CodingFundamentals = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleModeSelect = (mode) => {
    setShowModal(false);
    if (mode === 'solo') {
      navigate('/coding-solo');
    } else if (mode === 'collab') {
      navigate('/coding-collab');
    } else if (mode === 'compete') {
      navigate('/coding-compete');
    }
  };

  const handleCardClick = (title) => {
    if (title === 'Variables and Data Types') {
      navigate('/concept-intro');
    } else if (title === 'Print Squares') {
      setShowModal(true);
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <nav className="coding-navbar">
        <div className="coding-navbar-inner">
          <img
            src="/images/logo.png"
            alt="LoopTech Logo"
            className="coding-logo"
            onClick={() => navigate('/')}
            style={{ cursor: 'pointer' }}
          />
          <ul className="coding-nav-list">
            <li
              className="coding-nav-item"
              onClick={() => navigate('/home', { state: { view: 'learn' } })}
            >
              Learn
            </li>
            <li
              className="coding-nav-item active"
              onClick={() => navigate('/Challenge')}
            >
              Challenge
            </li>
            <li
              className="coding-nav-item"
              onClick={() => navigate('/Leaderboard')}
            >
              Leaderboard
            </li>
          </ul>
          <div className="coding-profile-menu">
            <img
              src="/images/homepage/search.png"
              alt="Search"
              className="coding-header-icon"
            />
            <img
              src="/images/homepage/notification.png"
              alt="Notifications"
              className="coding-header-icon"
            />
            <span className="coding-profile-avatar" />
            <span className="coding-profile-name">Janette</span>
            <span className="coding-profile-caret">▼</span>
          </div>
        </div>
      </nav>

      <div className="coding-content">
        <h1 className="coding-title">
          Coding Fundamentals
        </h1>
        <p className="coding-description">
          Choose challenges to kickstart your coding fundamentals knowledge.
        </p>

        {/* Coding Concepts */}
        <h2 className="coding-section-title">Coding Concepts</h2>
        <div className="overflow-x-auto scrollbar-hide px-4 py-6">
          <div className="flex gap-6 w-max pb-8">
            {challenges.concepts.map((item, index) => (
              <Card
                key={index}
                title={item.title}
                desc={item.desc}
                action={item.action}
                actionImage={item.actionImage}
                onClick={() => handleCardClick(item.title)}
              />
            ))}
          </div>
        </div>

        {/* Practical Coding - Basic */}
        <h2 className="coding-section-title">Practical Coding</h2>
        <h3 className="text-black text-base font-semibold pb-1">Basic</h3>
        <div className="overflow-x-auto scrollbar-hide px-4 py-6">
          <div className="flex gap-6 w-max pb-8">
            {challenges.practicalBasic.map((item, index) => (
              <Card
                key={index}
                title={item.title}
                desc={item.desc}
                action={item.action}
                actionImage={item.actionImage}
                onClick={() => handleCardClick(item.title)}
              />
            ))}
          </div>
        </div>

        {/* Moderate */}
        <h3 className="text-black text-base font-semibold pb-1">Moderate</h3>
        <div className="overflow-x-auto scrollbar-hide px-4 py-6">
          <div className="flex gap-6 w-max pb-8">
            {challenges.practicalModerate.map((item, index) => (
              <Card
                key={index}
                title={item.title}
                desc={item.desc}
                action={item.action}
                actionImage={item.actionImage}
                onClick={() => handleCardClick(item.title)}
              />
            ))}
          </div>
        </div>

        {/* Advanced */}
        <h3 className="text-black text-base font-semibold pb-1">Advanced</h3>
        <div className="overflow-x-auto scrollbar-hide px-4 py-6">
          <div className="flex gap-6 w-max pb-8">
            {challenges.practicalAdvanced.map((item, index) => (
              <Card
                key={index}
                title={item.title}
                desc={item.desc}
                action={item.action}
                actionImage={item.actionImage}
                onClick={() => handleCardClick(item.title)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Modal overlay */}
      {showModal && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/60 flex justify-center items-center z-50">
          <div className="relative bg-gradient-to-br from-[#D85E09] to-[#FFC482] rounded-3xl p-8 w-[420px] flex flex-col items-center">
            {/* Close button */}
            <img
              src="/images/Close.png"
              alt="Close"
              className="absolute top-4 right-4 w-6 h-6 cursor-pointer hover:scale-110 transition-transform duration-300"
              onClick={() => setShowModal(false)}
            />

            <h2 className="text-3xl font-bold text-black mb-6 text-center">
              Choose your mode:
            </h2>
            <div className="flex flex-col gap-1 w-full items-center">
              <img
                src="/images/Solo.png"
                alt="Solo"
                className="cursor-pointer hover:scale-105 transition-transform duration-300 h-20 w-60"
                onClick={() => handleModeSelect('solo')}
              />
              <img
                src="/images/Collab.png"
                alt="Collab"
                className="cursor-pointer hover:scale-105 transition-transform duration-300 h-20 w-60"
                onClick={() => handleModeSelect('collab')}
              />
              <img
                src="/images/Competeee.png"
                alt="Compete"
                className="cursor-pointer hover:scale-105 transition-transform duration-300 h-20 w-60"
                onClick={() => handleModeSelect('compete')}
              />
            </div>
          </div>
        </div>
      )}
      <FloatingChatbot />
    </>
  );
};

export default CodingFundamentals;
