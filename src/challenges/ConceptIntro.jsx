import React from 'react';
import { useNavigate } from 'react-router-dom';
import FloatingChatbot from '/src/chatbot/FloatingChatbot';

const ConceptIntro = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-row bg-white relative">
      {/* Left side - header area */}
      <div className="w-auto flex flex-col gap-10 justify-start px-10 py-8">
        <div className="flex items-center">
          <span
            onClick={() => navigate(-1)}
            className="text-[#333] text-lg font-medium hover:underline cursor-pointer"
          >
            &larr;
          </span>
          <h1 className="ml-4 text-xl font-semibold text-[#333] whitespace-nowrap">
            Variables and Data Types
          </h1>
        </div>
      </div>

      {/* Right side - image with Begin button overlay */}
      <div className="flex-1 overflow-hidden pt-15 flex flex-col justify-center items-center transform">
        <div className="relative w-[1130px] h-[635px]">
          <img
            src="/images/ConceptIntro.png"
            alt="Concept Intro"
            className="w-full h-full object-cover rounded"
          />
          <img
            src="/images/Begin.png"
            alt="Begin"
            className="absolute bottom-30 right-50 w-[140px] cursor-pointer hover:scale-105 transition-transform duration-300"
            onClick={() => navigate("/concept-game")}
          />
        </div>
      </div>
      <FloatingChatbot />
    </div>
  );
};

export default ConceptIntro;
