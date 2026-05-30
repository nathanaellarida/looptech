import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { runInSandbox } from './sandboxRunner';
import { getYjsSignaling, createRoomId } from './collab';
import * as Y from 'yjs';
import Editor from "@monaco-editor/react";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import angryGif from './../../images/emotions/angry.gif';
import disgustGif from './../../images/emotions/disgust.gif';
import fearGif from './../../images/emotions/fear.gif';
import happyGif from './../../images/emotions/happy.gif';
import neutralGif from './../../images/emotions/neutral.gif';
import sadGif from './../../images/emotions/sad.gif';
import surpriseGif from './../../images/emotions/surprise.gif';

function CameraPreview({ camOn, stream, detectedEmotion, emotionGifs }) {
  const [expanded, setExpanded] = useState(false);
  const videoRef = useRef(null);

  emotionGifs = {
    Angry: angryGif,
    Disgust: disgustGif,
    Fear: fearGif,
    Happy: happyGif,
    Neutral: neutralGif,
    Sad: sadGif,
    Surprise: surpriseGif,
  };

  // Whenever camOn AND you have a stream prop, attach it.
  useEffect(() => {
    if (camOn && stream && videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {/* ignore */});
    }
  }, [camOn, stream, expanded]);

  if (!camOn) return null;

  // One single video element, reused for both views:
  const videoEl = (
    <video
      ref={videoRef}
      id={'local-video'}
      autoPlay
      playsInline
      muted
      onClick={() => setExpanded(true)}
      style={{
        width: '100%', height: '100%',
        background: '#000',
        borderRadius: expanded ? 8 : 4,
        cursor: expanded ? 'default' : 'pointer',
      }}
    />
  );

  // FULL‑SCREEN MODAL
  if (expanded) {
    return (
      <div style={{
        position: 'fixed', top: 0, left: 0,
        width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1000,
      }}>
        <button
          onClick={() => setExpanded(false)}
          style={{
            position: 'absolute', top: 16, right: 16,
            fontSize: 32, color: '#fff',
            background: 'transparent', border: 'none', cursor: 'pointer',
          }}
        >×</button>

        <div style={{ position: 'relative', width: '80vw', height: '80vh' }}>
          {videoEl}
          {detectedEmotion && emotionGifs[detectedEmotion] && (
            <img
              src={emotionGifs[detectedEmotion]}
              alt={detectedEmotion}
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
                width: 80,
                height: 80,
                objectFit: 'contain',
                zIndex: 2000,
                pointerEvents: 'none',       // let clicks through to the video
              }}
            />
            )}
        </div>
      </div>
    );
  }

  // THUMBNAIL VIEW
  return (
    <div className={"items-center border-t-amber-600 flex h-25 justify-center relative py-2 px-4"}>
      <div className={"relative w-36 h-22.5"}>
        {videoEl}
        <canvas id="emotion-canvas" style={{ display: 'none' }} />
        {detectedEmotion && emotionGifs[detectedEmotion] && (
          <img
            src={emotionGifs[detectedEmotion]}
            alt={detectedEmotion}
            style={{ position: 'absolute', top: 5, right: 8, width: 60, height: 60, objectFit: 'contain', zIndex: 2000, }}
          />
        )}
      </div>
    </div>
  );
}

const CodingSolo = () => {
  const navigate = useNavigate();
  const editorRef = useState(null);

  const [activeTab, setActiveTab] = useState('Problem');
  const [selectedLanguage, setSelectedLanguage] = useState('C#');

  const languages = ['C#', 'Python', 'JavaScript', 'Java'];

  const [output, setOutput] = useState('')

  const [expandedHints, setExpandedHints] = useState([false, false, false]);
  const hintTitles = ['Hint #1', 'Hint #2', 'Hint #3'];
  const hintTexts = [
    'Consider using a loop to iterate from 1 to N.',
    'Square means number times itself (e.g. i * i).',
    'Start your loop at 1 and continue up to N.'
  ];
  const toggleHint = (index) => {
    setExpandedHints((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  const [camOn, setCamOn] = useState(false)
  const localStreamRef = useRef(null)
  const awarenessRef = useRef(null)
  const pcRef = useRef({})
  
  const [detectedEmotion, setDetectedEmotion] = useState(null)
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState("");
  const [bubbleEmotion, setBubbleEmotion] = useState(null);
  const [, setHintText] = useState(null);

  const emotionGifs = {
    Angry: angryGif,
    Disgust: disgustGif,
    Fear: fearGif,
    Happy: happyGif,
    Neutral: neutralGif,
    Sad: sadGif,
    Surprise: surpriseGif,
  }

  const emotionMessages = {
    Angry: "Hey! Calm down and take a breath. Coding is tough, but you’ve got this!",
    Disgust: "Hmm… something feels off? Let’s figure it out together.",
    Fear: "Feeling nervous? Don’t worry, I’m here to help!",
    Happy: "Awesome! Keep up the great work!",
    Sad: "Feeling blue? Let’s make coding fun again.",
    Surprise: "Wow! That’s unexpected. Keep exploring!"
  };

  useEffect(() => {
    if (
      detectedEmotion &&
      detectedEmotion !== "Neutral" &&
      emotionMessages[detectedEmotion]
    ) {
      if (detectedEmotion === "Angry") {
        setBubbleMessage(
          <>
            {emotionMessages.Angry}{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setHintText("💡 Hint placeholder text goes here!");
              }}
              style={{ color: "#fff", textDecoration: "underline" }}
            >
              Click here for a hint!
            </a>
          </>
        );
      } else {
        setBubbleMessage(emotionMessages[detectedEmotion]);
      }

      setBubbleEmotion(detectedEmotion);
      setBubbleVisible(true);

      const timer = setTimeout(() => {
        setBubbleVisible(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [detectedEmotion]);

  useEffect(() => {
    let intervalId;

    if (camOn) {
      intervalId = setInterval(() => {
        const video = document.getElementById("local-video");
        const canvas = document.getElementById("emotion-canvas");

        if (video && canvas) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(async (blob) => {
            if (blob) {
              const formData = new FormData();
              formData.append("file", blob, "frame.jpg");

              try {
                // Relative path: dev is proxied to the FastAPI server, prod is same-origin.
                const res = await fetch("/detect_emotion", {
                  method: "POST",
                  body: formData,
                });

                const json = await res.json();
                if (json.emotion) {
                  setDetectedEmotion(json.emotion);
                }
              } catch (e) {
                console.error("Emotion detection error:", e);
              }
            }
          }, "image/jpeg");
        }
      }, 2000); // every 2 seconds
    }

    return () => {
      clearInterval(intervalId);
    };
  }, [camOn]);

  // Stop all camera/mic tracks when the component unmounts.
  useEffect(() => {
    return () => {
      const stream = localStreamRef.current;
      if (stream) stream.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    };
  }, []);

  function handleEditorDidMount(editor) {
    editorRef.current = editor;
    // Initialize YJS
    const doc = new Y.Doc(); // a collection of shared objects -> Text
    // Use a unique, unguessable room per session (never a shared "test-room")
    // and an intentional, configurable signaling server instead of silently
    // relying on y-webrtc's public default.
    const provider = new WebrtcProvider(createRoomId(), doc, { signaling: getYjsSignaling() });
    const type = doc.getText("monaco"); // doc { "monaco": "what our IDE is showing" }
    // Bind YJS to Monaco 
    new MonacoBinding(type, editorRef.current.getModel(), new Set([editorRef.current]), provider.awareness);
    awarenessRef.current = provider.awareness;
    console.log(provider.awareness);                
  }

  async function handleRun() {
    if (!editorRef.current) return
    const code = editorRef.current.getValue()
    // Executes in a shared sandboxed iframe/worker — never on the app origin.
    const { output: out, error, timedOut } = await runInSandbox(code)
    if (timedOut) {
      setOutput('Error: Execution timed out (possible infinite loop).')
    } else if (error) {
      setOutput((out ? out + '\n' : '') + 'Error: ' + error)
    } else {
      setOutput(out || '(no console output)')
    }
  }

  async function toggleCam() {
    const next = !camOn;
    
    // Update Yjs awareness immediately
    const current = awarenessRef.current.getLocalState() || {};
    awarenessRef.current.setLocalState({
      ...current,
      av: { ...current.av, cam: next }
    });

    if (next) {
      try {
        const stream = await startLocalStream();           // requests camera/mic (explicit user action)
        localStreamRef.current = stream;
        Object.values(pcRef.current).forEach(pc =>
          stream.getTracks().forEach(track => pc.addTrack(track, stream))
        );
      } catch (err) {
        console.error('Cannot start camera:', err);
        return;
      }
    } else {
      const stream = localStreamRef.current;
      if (stream) {
        stream.getTracks().forEach(track => {
          // remove from every connection
          Object.values(pcRef.current).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track === track);
            if (sender) pc.removeTrack(sender);
          });
          track.stop();
        });
      }
      localStreamRef.current = null;
    }

    setCamOn(next);
  }

  function startLocalStream() {
    return navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(stream => {
        localStreamRef.current = stream

        // poll until the <video id="local-video"> exists
        const tryAttach = () => {
          const vid = document.getElementById('local-video')
          if (vid) {
            vid.srcObject = stream
          } else {
            // try again in 100ms
            setTimeout(tryAttach, 100)
          }
        }
        tryAttach()

        return stream
      })
  }

  return (
    <div className="w-screen h-screen bg-[#0D0D0D] text-white flex flex-col overflow-hidden">
      {/* Top Navigation */}
      <div className="flex items-center justify-between px-8 py-4 h-[64px] flex-shrink-0">
        <span
          onClick={() => navigate('/CodingFundamentals')}
          className="text-[#FF7C34] text-xl font-bold hover:underline cursor-pointer flex items-center gap-2"
        >
          &larr; Back
        </span>
        <div className="flex gap-3">
          <span className="text-[#FF7C34]">Prev</span>
          <div className="flex gap-1">
            <div className="w-6 h-2 bg-[#FF7C34] rounded"></div>
            <div className="w-6 h-2 bg-[#FF7C34] rounded"></div>
            <div className="w-6 h-2 bg-[#FF7C34] rounded"></div>
            <div className="w-6 h-2 bg-[#3A3A3A] rounded"></div>
          </div>
          <span className="text-[#FF7C34]">Next</span>
        </div>
      </div>

      {/* Panels */}
      <div className="flex flex-1 w-full overflow-hidden gap-1 px-6 pb-2">
        {/* Left Panel with gradient border and rounded corners */}
        <div className="p-[3px] bg-gradient-to-b from-[#FF7C34] to-[#FFC482] rounded-xl w-[360px] flex-shrink-0 flex flex-col h-full">
          <div className="flex-1 flex flex-col px-6 py-3 overflow-y-auto bg-[#0D0D0D] rounded-xl">
            {/* Tabs */}
            <div className="flex mb-6">
              {['Problem', 'Test Case', 'Submissions'].map((tab) => (
                <span
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-2 text-sm font-semibold cursor-pointer ${
                    activeTab === tab
                      ? 'border-b-2 border-[#FF7C34] text-[#FF7C34]'
                      : 'text-gray-300'
                  }`}
                >
                  {tab}
                </span>
              ))}
            </div>

            {/* Problem Details */}
            <h2 className="text-3xl font-bold text-white pt-1">
              Print Squares{' '}
              <span className="text-green-500 text-sm ml-2">Basic</span>
            </h2>
            <p className="text-gray-300 text-sm pt-3">
              Write a program that utilizes a while loop to print the squares
              of numbers from 1 to N.
            </p>

            <h3 className="text-white font-semibold pt-3 pb-2">Hints</h3>
            <p className="text-gray-400 text-xs pb-2">
              Not sure about your code? Use hints
            </p>
            {hintTitles.map((title, i) => (
              <div key={i} className="mb-2.5">
                <div
                  className="flex justify-between items-center bg-[#1A1A1A] border border-[#FF7C34] px-5 py-1 rounded-3xl cursor-pointer hover:bg-[#2A2A2A]"
                  onClick={() => toggleHint(i)}
                >
                  <span className="text-white">{title}</span>
                  <span className="text-[#FF7C34] text-sm">
                    {expandedHints[i] ? '-' : '+'}
                  </span>
                </div>
                {expandedHints[i] && (
                  <div className="px-3 py-1 text-sm text-gray-300 border border-t-0 border-[#FF7C34] rounded-3xl">
                    {hintTexts[i]}
                  </div>
                )}
              </div>
            ))}
            <div className="grid justify-content-center">
              <button onClick={toggleCam} style={{ backgroundColor: '#f0f0f0', color: '#0f0f0f', borderRadius: '4px', border: 'none', cursor: 'pointer', padding: '6px 12px', }} >
                  { camOn ? 'Turn off Camera' : 'Turn on Camera' }
              </button>
              <p className="text-gray-400 text-xs pt-1">
                The camera stays off until you turn it on. While on, frames are periodically
                sent to the emotion-detection server for analysis.
              </p>
              <CameraPreview
                camOn={camOn}
                stream={localStreamRef.current}
                detectedEmotion={detectedEmotion}
                emotionGifs={emotionGifs}
              />
            </div>
          </div>
        </div>
        {/* BUBBLE CHAT FOR EMOTIONS */}
        {bubbleVisible && (
          <div style={{ position: "absolute", bottom: 250, left: '20%', maxWidth: 300, background: "#db7e00", color: "#fff", padding: "12px 16px", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.3)", zIndex: 9999, fontSize: 14, animation: "fadeInBubble 0.3s ease forwards", }} >
            <div style={{ display: "flex", alignItems: "center", gap: 8, }}>
              <img src={emotionGifs[bubbleEmotion]} alt={bubbleEmotion} style={{ width: 40, height: 40, objectFit: "contain" }} />
              <span>{bubbleMessage}</span>
            </div>
            <div style={{ position: "absolute", bottom: -10, left: 20, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "10px solid #db7e00", }} />
          </div>
        )}

        {/* Right Panel with gradient border and rounded corners */}
        <div className="p-[2px] bg-gradient-to-b from-[#FF7C34] to-[#FFC482] rounded-xl flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 flex flex-col p-4 overflow-y-auto bg-[#0D0D0D] rounded-xl">
            {/* Language Dropdown */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-2 items-center">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="bg-[#1A1A1A] text-[#FF7C34] px-6 py-1 rounded border border-[#FF7C34]"
                >
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3">
                <img
                  src="/images/Undo.png"
                  alt="Undo"
                  className="w-6 h-6 cursor-pointer hover:scale-110 transition"
                  onClick={() => console.log('Undo clicked')}
                />
                <img
                  src="/images/Settings.png"
                  alt="Settings"
                  className="w-6 h-6 cursor-pointer hover:scale-110 transition"
                  onClick={() => console.log('Settings clicked')}
                />
                <img
                  src="/images/ToggleFull.png"
                  alt="Toggle Full Screen"
                  className="w-6 h-6 cursor-pointer hover:scale-110 transition"
                  onClick={() => console.log('Toggle Full Screen clicked')}
                />
              </div>
            </div>

            {/* Code Editor */}
            <div className="flex-1 rounded p-3 mb-4 w-full overflow-auto">
              <Editor
                height="100%"
                width="100%"
                theme="vs-dark"
                language="javascript"
                onMount={handleEditorDidMount}
                options={{ minimap: { enabled: false } }}
              />
            </div>

            {/* Run and Next Buttons - right aligned */}
            <div className="flex justify-end gap-3 mb-4">
              <span onClick={handleRun} className="bg-[#333333] text-white px-6 py-1 rounded-xl text-sm hover:bg-[#444444] cursor-pointer">
                Run
              </span>
              <span className="bg-[#FF7C34] text-white px-10 py-1 rounded-xl text-sm hover:scale-105 transition-transform duration-300 cursor-pointer">
                Next
              </span>
            </div>

            {/* Test against custom input */}
            <div className="bg-[#1A1A1A] p-10 rounded mb-1 w-full">
              <p className="text-gray-400 text-sm">{output || "Test against custom input"}</p>
            </div>

            {/* Submit Button - right aligned */}
            <div className="flex justify-end w-full mt-4">
              <span className="bg-gradient-to-r from-[#FF7C34] to-[#FFC482] text-white px-7 py-1 rounded-xl text-sm hover:scale-105 transition-transform duration-300 cursor-pointer">
                Submit
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodingSolo;
