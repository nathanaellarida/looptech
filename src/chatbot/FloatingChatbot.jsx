// src/components/FloatingChatbot.jsx

import React, { useState } from 'react';

export default function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Floating Icon Button */}
      <div
        onClick={handleToggle}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: isOpen ? '340px' : '20px', // shift left when chatbox is open
          width: '60px',
          height: '60px',
          borderRadius: '30px',
          backgroundColor: '#FFA24B',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 9999,
          transition: 'right 0.3s',
        }}
      >
        <img
          src="/images/loobot.png"
          alt="Chatbot"
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* Chatbot Box */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            width: '320px',
            height: '480px',
            background: 'linear-gradient(to bottom, #FFE3C2, #FFFFFF)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            overflow: 'hidden',
            zIndex: 9998,
            display: 'flex',
            flexDirection: 'column',
          }}
        >

          {/* Chat content */}
          <div
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              overflowY: 'auto',
            }}
          >
            <iframe
              src="/chatbot.html"
              title="LooBot"
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}
