import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";
import FloatingChatbot from '/src/chatbot/FloatingChatbot';
import speakerIcon from '/images/speaker-icon.png'; // You may need to add this image

const DigitalLiteracyHome = () => {
  const navigate = useNavigate();

  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');

  const translations = {
    en: {
      moduleTitle: "Internet Basics",
      moduleNumber: "Module 1",
      sectionTitle: "The Internet in Our Daily Lives",
      paragraph1: "The internet connects millions of devices around the world.",
      paragraph2: "In the Philippines, we use the internet for:",
      list: [
        "Messaging (Messenger, Viber)",
        "Watching videos (YouTube, TikTok)",
        "Online shopping (Shopee, Lazada)",
        "Paying bills (GCash, Maya)"
      ],
      didYouKnowTitle: "Did You Know?",
      didYouKnowText: "According to We Are Social, the Philippines spends around 9 hours a day online—one of the highest in the world!",
      videoTitle: "Watch This Video: “Introduction to Internet Safety”",
      transcript: "Transcript",
      quickCheckTitle: "🗂 Quick Check",
      quickCheckInstruction: "After watching the video, answer the questions below:",
      questions: [
        {
          question: "What is a safe way to use the Internet?",
          options: [
            "Sharing my password with anyone",
            "Clicking every link I see",
            "Logging out after using a shared computer"
          ]
        },
        {
          question: "Why should you be careful when using public WiFi?",
          options: [
            "Because it makes my phone heavy",
            "Because someone might steal my personal information",
            "Because public WiFi can make my battery die fast"
          ]
        },
        {
          question: "Which one is an example of a public WiFi?",
          options: [
            "Your own home WiFi with a password",
            "The WiFi at the mall",
            "The WiFi in your neighbor's house"
          ]
        }
      ],
      submit: "Submit",
      nextSection: "Smart Searching & Fake News →"
    },
    fil: {
      moduleTitle: "Mga Batayan ng Internet",
      moduleNumber: "Modyul 1",
      sectionTitle: "Ang Internet sa Ating Pang-araw-araw na Buhay",
      paragraph1: "Ang internet ay nagdudugtong ng milyun-milyong mga device sa buong mundo.",
      paragraph2: "Sa Pilipinas, ginagamit natin ang internet para sa:",
      list: [
        "Pagmemensahe (Messenger, Viber)",
        "Panonood ng video (YouTube, TikTok)",
        "Online shopping (Shopee, Lazada)",
        "Pagbabayad ng bills (GCash, Maya)"
      ],
      didYouKnowTitle: "Alam Mo Ba?",
      didYouKnowText: (
  <>
    Ayon sa We Are Social, humigit-kumulang 9 na oras bawat araw ang ginugugol ng mga Pilipino sa internet—
    <br />
    isa sa pinakamataas sa buong mundo!
  </>
),
      videoTitle: "Panuorin ang Video: “Panimula sa Kaligtasan sa Internet”",
      transcript: "Transcript",
      quickCheckTitle: "🗂 Mabilisang Pagsusuri",
      quickCheckInstruction: "Pagkatapos manood ng video, sagutin ang mga tanong sa ibaba:",
      questions: [
        {
          question: "Ano ang ligtas na paraan ng paggamit ng Internet?",
          options: [
            "Ibinabahagi ang aking password kahit kanino",
            "Ikiniklik ang bawat link na aking nakikita",
            "Nagla-log out pagkatapos gumamit ng shared computer"
          ]
        },
        {
          question: "Bakit dapat mag-ingat kapag gumagamit ng public WiFi?",
          options: [
            "Dahil bumibigat ang aking cellphone",
            "Dahil maaaring nakawin ang aking personal na impormasyon",
            "Dahil mabilis maubos ang baterya ng public WiFi"
          ]
        },
        {
          question: "Alin ang halimbawa ng public WiFi?",
          options: [
            "Sariling WiFi sa bahay na may password",
            "Ang WiFi sa mall",
            "Ang WiFi sa bahay ng kapitbahay"
          ]
        }
      ],
      submit: "Isumite",
      nextSection: "Smart Searching & Fake News →"
    }
  };

  const langCode = selectedLanguage === 'Filipino' ? 'fil' : 'en';
  const t = translations[langCode];

  const handleSpeakClick = () => {
    if ('speechSynthesis' in window) {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        return;
      }
      // Gather the main content to read
      const textToRead = [
        t.moduleTitle,
        t.moduleNumber,
        t.sectionTitle,
        t.paragraph1,
        t.paragraph2,
        ...(t.list || []),
        t.didYouKnowTitle,
        typeof t.didYouKnowText === 'string' ? t.didYouKnowText : '',
      ].join('. ');
      window.speechSynthesis.cancel(); // Stop any current speech
      const utterance = new window.SpeechSynthesisUtterance(textToRead);
      utterance.lang = langCode === 'fil' ? 'fil-PH' : 'en-US';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Sorry, your browser does not support text-to-speech.');
    }
  };

  return (
    <div className="font-poppins text-gray-800">
      {/* Fixed Header */}
      <header className="home-navbar home-navbar-sticky">
        <div className="home-navbar-inner">
          <img src="/images/logo.png" alt="LoopTech Logo" className="home-logo" />
          <ul className="home-nav-list">
            <li className="home-nav-item" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>Learn</li>
            <li className="home-nav-item active">Challenge</li>
            <li className="home-nav-item" onClick={() => navigate('/leaderboard')} style={{ cursor: 'pointer' }}>Leaderboard</li>
          </ul>
          <div className="home-profile-menu" style={{ position: 'relative' }}>
            <img src="/images/homepage/search.png" alt="Search" className="home-header-icon" />
            <img src="/images/homepage/notification.png" alt="Notifications" className="home-header-icon" />
            <img src="/images/homepage/avatar.png" alt="Avatar" className="home-profile-avatar" />
            <span className="home-profile-name">Janette</span>
            <span className="home-profile-caret" style={{ cursor: 'pointer', color: '#ea580c' }}>▼</span>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="pt-12 px-4 sm:px-8 md:px-12 pb-10 bg-white min-h-screen">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT CONTENT */}
          <div className="w-full lg:flex-1" style={{ marginLeft: '5vw' }}>
            <div className="flex items-center mb-5">
              <button
                onClick={() => navigate("/CourseDetail")}
                className="icon-btn"
              >
                <img
                  src="/images/back-arrow.png"
                  alt="Back"
                  className="w-5 h-5 mr-3"
                />
              </button>
              <span className="text-sm font-semibold text-gray-500">
                Basic Digital Literacy
              </span>
            </div>

            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold pb-2">
                {t.moduleTitle}
              </h1>
              <button className="icon-btn">
                <img
                  src="/images/download-icon.png"
                  alt="Download this Module"
                  className="w-6 h-6 object-contain pb-2"
                />
              </button>
              <button className="icon-btn" onClick={handleSpeakClick} aria-label="Read this section aloud">
                <img src={speakerIcon} alt="Read aloud" className="w-6 h-6 object-contain pb-2" />
              </button>
            </div>
            
            <p className="text-xs md:text-sm text-gray-500 font-semibold pb-4">
              {t.moduleNumber}
            </p>

            <button
              className="icon-btn"
              onClick={() => setShowLanguageModal(true)}
            >
              <img
                src="/images/translate-icon.png"
                alt="Translate this Module"
                className="w-40 md:w-56 h-10 object-contain"
              />
            </button>

            <section className="mb-10 pt-5">
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="/images/booklet-icon.png"
                  alt="Book Icon"
                  className="w-5 h-5 md:w-6 md:h-6 object-contain"
                />
                <h2 className="text-lg md:text-xl font-semibold">
                  {t.sectionTitle}
                </h2>
              </div>
              <p className="pb-4">
                {t.paragraph1}
              </p>
              <p className="pb-3">
                {t.paragraph2}
              </p>
              <ul className="list-disc ml-10 space-y-1 text-sm">
                {t.list.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>

              <div className="mt-6 bg-orange-50 border-l-4 border-orange-500 p-4 rounded">
                <p className="text-orange-600 font-bold mb-1">
                  {t.didYouKnowTitle}
                </p>
                <p className="text-xs md:text-sm">
                  {t.didYouKnowText}
                </p>
              </div>
            </section>

            <section className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <img
                  src="/images/video-icon.png"
                  alt="Video Icon"
                  className="w-5 h-5 md:w-6 md:h-6 object-contain"
                />
                <h2 className="text-lg md:text-xl font-semibold">
                  {t.videoTitle}
                </h2>
              </div>

              <div className="w-full aspect-video rounded overflow-hidden">
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/yrln8nyVBLU?si=163jMartQ7qtnHJP"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="mt-4">
  <h2 className="font-bold text-lg md:text-xl text-black">
    Transcript
  </h2>
  <p className="font-semibold text-gray-500 md:text-xs md:text-base mt-1">
    Follow along using the transcript.
  </p>

  <button className="mt-4 bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold py-2 px-4 rounded">
    Show Transcript
  </button>

</div>

            </section>

            {/* Quick Check Section */}
            <section>
              <h2 className="text-lg md:text-xl font-semibold mb-4">
                {t.quickCheckTitle}
              </h2>
              <p className="mb-6 text-xs md:text-sm">
                {t.quickCheckInstruction}
              </p>

              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  className="mb-8 border-t border-gray-200 pt-4"
                >
                  <p className="font-semibold mb-2 text-sm md:text-base">
                    {t.questions[num - 1].question}
                  </p>
                  <div className="space-y-2 mb-3">
                    {t.questions[num - 1].options.map((option, i) => (
                      <label
                        key={i}
                        className="block text-xs md:text-sm"
                      >
                        <input type="radio" name={`q${num}`} className="mr-2" />
                        {option}
                      </label>
                    ))}
                  </div>
                  <button className="bg-gray-700 hover:bg-gray-800 text-white text-xs md:text-sm px-4 py-2 rounded">
                    {t.submit}
                  </button>
                </div>
              ))}

              <div className="text-right text-orange-600 font-semibold cursor-pointer text-xs md:text-sm">
                {t.nextSection}
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR */}
          <aside className="sticky top-24 right-0 w-64 md:w-90 h-[calc(100vh-7rem)] overflow-y-auto bg-gray-50 p-5 shadow-lg z-50 border border-gray-200 rounded-lg self-start">
            <h3 className="text-base md:text-lg font-bold pb-3">
              Basic Digital Literacy
            </h3>
            <p className="text-[12px] md:text-xs text-gray-500 font-semibold pb-3">
              Course Outline:
            </p>
            <ul className="space-y-2 text-xs md:text-sm">
              {[
                "📄 Internet Basics",
                "📄 The Internet in Our Daily Lives",
                "📄 Introduction to Internet Safety",
                "📝 Quick Check",
                "📄 Smart Searching & Fake News",
                "📄 How to Search Like a Pro",
                "📄 How to Spot Fake News",
                "📄 Checking Websites & Sources",
                "📝 Quick Check",
                "📄 Online Scams and Privacy",
                "📄 Common Online Scams",
                "📄 Protecting Your Privacy",
                "📄 Stay Safe Online",
                "📝 Quick Check",
                "📄 Being a Responsible Netizen",
                "📄 Netiquette Basics",
                "📄 What is Your Digital Footprint?",
                "📝 Quick Check",
                "📄 Practical Digital Life Skills",
                "📄 Online Communication Tools",
                "📄 Paying Bills Online",
                "📄 How to Pay Bills Using GCash",
                "📄 Safe Online Shopping",
                "📄 Travel with Apps",
                "📄 Google Maps for jeep routes",
                "📝 Quick Check",
              ].map((item, index) => {
                const mainTopicIndices = [
                  0, 4, 9, 14, 18
                ];
                const isMainTopic = mainTopicIndices.includes(index);
                return (
                  <li
                    key={index}
                    className={`rounded px-3 py-2 cursor-pointer ${
                      !isMainTopic ? "ml-8" : ""
                    } ${
                      index === 0
                        ? "bg-orange-100 font-semibold"
                        : "hover:bg-gray-100"
                    }`}
                  >
                    {item}
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </main>

      {/* Language Modal */}
      {showLanguageModal && (
  <div
    className="fixed inset-0 bg-black/25 flex items-center justify-center z-50"
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
        {['English (US)', 'Filipino', 'Cebuano', 'Ilocano', 'Hiligaynon'].map((lang) => (
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

      <FloatingChatbot />
    </div>
  );
};

export default DigitalLiteracyHome;
