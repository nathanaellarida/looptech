import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';
import { 
  MdLightMode, MdArrowBackIos, MdSend, MdDarkMode, MdLink, MdFileCopy,
  MdChevronLeft, MdChevronRight,
} from "react-icons/md";
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import angryGif from './../../images/emotions/angry.gif';
import disgustGif from './../../images/emotions/disgust.gif';
import fearGif from './../../images/emotions/fear.gif';
import happyGif from './../../images/emotions/happy.gif';
import neutralGif from './../../images/emotions/neutral.gif';
import sadGif from './../../images/emotions/sad.gif';
import surpriseGif from './../../images/emotions/surprise.gif';

function getRandomUser() {
  const hue = Math.floor(Math.random() * 360)
  return {
    name: 'User-' + Math.floor(Math.random() * 1000),
    color: `hsla(${hue}, 70%, 80%, 0.6)`,
  }
}

function formatTime(seconds) {
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function makeRandomRoom(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let s = ''
  for (let i = 0; i < length; i++) {
    s += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return s
}

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
    <div style={{ alignItems: 'center', borderTop: '1px solid #db7e00', display: 'flex', height: 100, justifyContent: 'center', position: 'relative', padding: '8px 16px', }}>
      <div style={{ position: 'relative', width: 160, height: 100 }}>
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

const CodingCollab = () => {
  const navigate = useNavigate();

  // Theme state: 'dark' | 'light'
  const [theme, setTheme] = useState('dark')
  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  const editorRef = useRef(null)
  const awarenessRef = useRef(null)
  const decorationsRef = useRef([])
  const widgetsRef = useRef({})

  const [myClientID, setMyClientID] = useState(null)
  
  const [showCollab, setShowCollab] = useState(false)

  const localStreamRef = useRef(null)
  const peersStream = useRef({})
  const wsRef = useRef(null)
  const pcRef = useRef({})
  const [micOn, setMicOn] = useState(false)
  const [camOn, setCamOn] = useState(false)

  const [output, setOutput] = useState('')

  const [fadeClass, setFadeClass] = useState('')

  const [peersStreamMap, setPeersStreamMap] = useState({})

  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  const chatArrayRef = useRef(null)
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')

  const [showProblem, setShowProblem] = useState(true)
  const [showChat, setShowChat] = useState(false)

  const params = new URLSearchParams(window.location.search)
  const [roomId, setRoomId] = useState(params.get('room') || makeRandomRoom())
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [inviteLink, setInviteLink] = useState('')

  const [activeTab, setActiveTab] = useState('title')
  const [currentProblem, setCurrentProblem] = useState(1)

  const [detectedEmotion, setDetectedEmotion] = useState(null);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState("");
  const [bubbleEmotion, setBubbleEmotion] = useState(null);
  const [hintText, setHintText] = useState(null);
  
  const leftPanelWidth = (showProblem || showChat) ? "26%" : "20px";

  // Defining problems data:
  const problems = [
    {
      title: 'Print Squares',
      description: `Write a program that will print the squares of numbers from 1 to a specific number.`,
      testCases: [
        { input: 4,   expected: '1, 4, 9, 16' },
        { input: 6,   expected: '1, 4, 9, 16, 25, 36' },
      ],
      history: [
        { ts: '2025‑07‑14 10:23', result: '✅ Passed' },
        { ts: '2025‑07‑14 09:55', result: '❌ Timeout' },
      ]
    },
  ]

  // In the render, pull out the current problem:
  const problem = problems[currentProblem - 1]

  const emotionGifs = {
    Angry: angryGif,
    Disgust: disgustGif,
    Fear: fearGif,
    Happy: happyGif,
    Neutral: neutralGif,
    Sad: sadGif,
    Surprise: surpriseGif,
  };

  const emotionMessages = {
    Angry: "Hey! Calm down and take a breath. Coding is tough, but you’ve got this!",
    Disgust: "Hmm… something feels off? Let’s figure it out together.",
    Fear: "Feeling nervous? Don’t worry, I’m here to help!",
    Happy: "Awesome! Keep up the great work!",
    Sad: "Feeling blue? Let’s make coding fun again.",
    Surprise: "Wow! That’s unexpected. Keep exploring!"
  };

  // Fade-in on mount
  useEffect(() => setFadeClass('app-fade-in'), [])

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
                const res = await fetch("http://localhost:8000/detect_emotion", {
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

  // After awareness gives us a client ID, init media & signaling
  useEffect(() => {
    if (!myClientID) return
    startLocalStream()
    setupSignaling()
  }, [myClientID])

  // Set timer to count down to 0
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Generate random room if the room name is not 'room'
  useEffect(() => {
    if (!params.get('room')) {
      const newUrl = `${window.location.pathname}?room=${roomId}`
      window.history.replaceState(null, '', newUrl)
    }
  }, [])

  // handler when user submits the invite link
  function joinRoom(e) {
    e.preventDefault()
    let link = inviteLink.trim()
    let url
  
    // 1) If it’s just a bare room ID (no =), treat it as ?room=ID
    if (!link.includes('=') && !link.includes('/')) {
      link = `?room=${link}`
    }
  
    // 2) If it starts with “?”, prepend origin + pathname
    if (link.startsWith('?')) {
      link = window.location.origin + window.location.pathname + link
    }
    // 3) If it doesn’t start with http:// or https://, prepend http://
    else if (!/^https?:\/\//i.test(link)) {
      link = 'http://' + link
    }
  
    // 4) Now try to parse
    try {
      url = new URL(link)
    } catch {
      alert('Please enter a valid URL, query string, or room ID.')
      return
    }
  
    const newRoom = new URLSearchParams(url.search).get('room')
    if (!newRoom) {
      alert('No “room=” parameter found in that link.')
      return
    }
  
    // 5) Navigate to the new room
    window.location.href = `${window.location.pathname}?room=${newRoom}`
  }

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
                setShowProblem(true);
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

  // Editor mount + Yjs binding
  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor
    const doc = new Y.Doc()
    const provider = new WebrtcProvider(roomId, doc)
    const ytext = doc.getText("monaco")
    const awareness = provider.awareness
    awarenessRef.current = awareness

    awareness.setLocalStateField('user', getRandomUser())
    awareness.setLocalStateField('av', { mic: micOn, cam: camOn })
    setMyClientID(awareness.clientID)

    new MonacoBinding(ytext, editor.getModel(), new Set([editor]), awareness)

    // right after you bind Monaco…
    const chatArray = doc.getArray('chat')
    chatArrayRef.current = chatArray

    // initialize local state
    setChatMessages(chatArray.toArray())

    // re‑render whenever chat changes
    chatArray.observe(() => {
      setChatMessages(chatArray.toArray())
    })

    editor.onDidChangeCursorSelection(e => {
      const sel = e.selection
      const start = editor.getModel().getOffsetAt(sel.getStartPosition())
      const end = editor.getModel().getOffsetAt(sel.getEndPosition())
      awareness.setLocalStateField('cursor', { start, end })
    })

    if (!document.getElementById('user-label-style')) { // Inject CSS for user label once
      const style = document.createElement('style')
      style.id = 'user-label-style'
      style.textContent = `
        .remote-selection {
          background-color: rgba(255,255,0,0.2);
        }
        .user-label {
          position: absolute; display: inline-block; white-space: nowrap; padding: 2px 6px; font-size: 11px; color: #fff; border-radius: 4px; pointer-events: none; z-index: 10;
        }
        .user-label::after {
          content: ""; position: absolute; top: 100%; left: 10px; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 5px solid currentColor;
        }
      `
      document.head.appendChild(style)
    }

    function updateDecorations() {
      const states = awareness.getStates()
      const newDecs = []
      const active = new Set()

      states.forEach((state, clientID) => {
        if (clientID === awareness.clientID) return
        const { cursor, user } = state
        if (!cursor || !user) return
        active.add(clientID)
        const startPos = editor.getModel().getPositionAt(cursor.start)
        const endPos = editor.getModel().getPositionAt(cursor.end)
        newDecs.push({
          range: new monaco.Range(
            startPos.lineNumber, startPos.column,
            endPos.lineNumber, endPos.column
          ),
          options: {
            className: 'remote-selection',
            inlineClassName: `user-${clientID}`
          }
        })
        if (!document.getElementById(`style-user-${clientID}`)) {
          const s = document.createElement('style')
          s.id = `style-user-${clientID}`
          s.textContent = `
            .monaco-editor .user-${clientID} { background-color: ${user.color}; }
            .monaco-editor .user-label-${clientID} { background-color: ${user.color}; }
          `
          document.head.appendChild(s)
        }
        const pref = (endPos.lineNumber <= 2)
          ? [monaco.editor.ContentWidgetPositionPreference.BELOW]
          : [monaco.editor.ContentWidgetPositionPreference.ABOVE]
        let widget = widgetsRef.current[clientID]
        if (!widget) {
          const dom = document.createElement('div')
          dom.className = `user-label user-label-${clientID}`
          dom.textContent = user.name
          widget = {
            getId: () => 'label-' + clientID,
            getDomNode: () => dom,
            getPosition: () => ({ position: endPos, preference: pref })
          }
          editor.addContentWidget(widget)
          widgetsRef.current[clientID] = widget
        } else {
          widget.getPosition = () => ({ position: endPos, preference: pref })
          editor.layoutContentWidget(widget)
        }
      })

      Object.keys(widgetsRef.current).forEach(id => {
        if (!active.has(Number(id))) {
          editor.removeContentWidget(widgetsRef.current[id])
          delete widgetsRef.current[id]
        }
      })

      decorationsRef.current = editor.deltaDecorations(decorationsRef.current, newDecs)
    }

    awareness.on('change', updateDecorations)
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

  function setupSignaling() {
    wsRef.current = new WebSocket(`ws://localhost:5174/ws`)

    wsRef.current.onopen = () => {
      wsRef.current.send(
        JSON.stringify({ 
          type: 'join', 
          room: roomId, 
          from: myClientID 
        })
      )
    }

    wsRef.current.onmessage = async evt => {
      let raw = evt.data

      // If we got a Blob (e.g. Vite HMR), try to convert it to text, else ignore
      if (raw instanceof Blob) {
        try {
          raw = await raw.text()
        } catch {
          return  // non‑text blob → skip
        }
      }

      // Only parse if it’s a string
      if (typeof raw !== 'string') return

      let msg
      try {
        msg = JSON.parse(raw)
      } catch {
        console.warn('Ignoring non‑JSON WS message:', raw)
        return
      }

      const { type, from, to, sdp, candidate, peers } = msg

      if (type === 'peers-in-room' && peers) {
        for (const pid of peers) {
          if (pid === myClientID) continue
          const pc = pcRef.current[pid] || createPeerConnection(pid)
          const offer = await pc.createOffer()
          await pc.setLocalDescription(offer)
          wsRef.current.send(JSON.stringify({
            type: 'offer',
            from: myClientID,
            to: pid,
            sdp: pc.localDescription
          }))
        }
        return
      }

      if (type === 'offer' && to === myClientID) {
        const pc = pcRef.current[from] || createPeerConnection(from)
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))
        const answer = await pc.createAnswer()
        await pc.setLocalDescription(answer)
        wsRef.current.send(JSON.stringify({
          type: 'answer',
          from: myClientID,
          to: from,
          sdp: pc.localDescription
        }))
      }
      else if (type === 'answer' && to === myClientID) {
        const pc = pcRef.current[from]
        await pc.setRemoteDescription(new RTCSessionDescription(sdp))
      }
      else if (type === 'ice-candidate' && to === myClientID) {
        const pc = pcRef.current[from]
        await pc.addIceCandidate(new RTCIceCandidate(candidate))
      }
    }
  }

  function createPeerConnection(peerID) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // 1️⃣ Add existing local tracks (if cam is already on)
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track =>
        pc.addTrack(track, localStreamRef.current)
      );
    }

    // whenever we add/remove tracks, the browser re-negotiates with other peers
    pc.onnegotiationneeded = async () => {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        wsRef.current.send(JSON.stringify({
          type: 'offer',
          from: myClientID,
          to: peerID,
          sdp: pc.localDescription
        }));
      } catch (err) {
        console.error('❌ renegotiation error', err);
      }
    };

    pc.onicecandidate = e => {
      if (e.candidate) {
        wsRef.current.send(JSON.stringify({
          type: 'ice-candidate',
          from: myClientID,
          to: peerID,
          candidate: e.candidate
        }));
      }
    };

    // 4️⃣ Collect remote tracks into a MediaStream + React state
    pc.ontrack = e => {
      let stream = peersStream.current[peerID];
      if (!stream) {
        stream = new MediaStream();
        peersStream.current[peerID] = stream;
      }
      stream.addTrack(e.track);
      setPeersStreamMap(prev => ({ ...prev, [peerID]: stream }));
    };

    pcRef.current[peerID] = pc
    return pc
  }

  function handleRun() {
    if (!editorRef.current) return
    const code = editorRef.current.getValue()
    const logs = []
    try {
      const runner = new Function('console', `"use strict";\n${code}`)
      runner({ log: (...args) => logs.push(args.join(' ')), error: (...args) => logs.push('Error:' + args.join(' ')) })
      setOutput(logs.join('\n') || '(no console output)')
    } catch (err) { setOutput('Error:' + err.toString()) }
  }

  function toggleMic() { setMicOn(o => { const n = !o; const s = awarenessRef.current.getLocalState() || {}; awarenessRef.current.setLocalState({ ...s, av: { ...s.av, mic: n } }); return n }) }
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
        const stream = await startLocalStream();           // your helper
        localStreamRef.current = stream;
        startLocalStream(stream);                            // track it
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
      startLocalStream(null);                               // clear it
    }

    setCamOn(next);
  }
  // —— RETURN THESE HTML/CSS VALUES TO THE main.jsx FILE FOR RENDERING ——  
  // RETURN JSX with applied theme
  return (
    <div className={`${fadeClass} ${theme}`} style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff', color: theme === 'dark' ? '#fff' : '#000' }} >
      {/* NAVBAR with theme toggle */}
      <div style={{ height: 45, borderBottom: '1px solid #db7e00', backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f0f0f0', color: theme === 'dark' ? '#fff' : '#000', display: 'flex', alignItems: 'center', padding: '0 20px', fontWeight: 'bold', justifyContent: 'space-between' }}>
        {/* Left side: Back button */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={() => navigate('/CodingFundamentals')} style={{ border: 'none', cursor: 'pointer', backgroundColor: 'transparent', color: '#db7e00', padding: '2px 2px' }} >
            <MdArrowBackIos fontSize={30} />
          </button>
          <h3 style={{ paddingLeft: '8px' }}>Back to Coding Challenges</h3>
        </div>

        {/* Center: Timer */}
        <div style={{ fontSize: '24px', color: '#db7e00' }}> ⏱ {formatTime(timeLeft)} </div>
        {/* Invite button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setShowJoinModal(true)} style={{ background: 'transparent', color: theme === 'dark' ? '#f0f0f0' : '#0f0f0f', border: '2px solid #db7e00', borderRadius: 12, display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px', padding: '4px 12px', }} title="Join Room" >
            <MdLink color='#db7e00' size={24}/>
            <span>Join Room</span>
          </button>
          <button 
            onClick={() => { 
              navigator.clipboard.writeText(window.location.href)
              alert('Invite link copied to clipboard!') 
            }} 
            style={{ backgroundColor: theme === 'dark' ? '#0f0f0f' : '#f0f0f0', color: theme === 'dark' ? '#f0f0f0' : '#0f0f0f', border: '2px solid #db7e00', borderRadius: 12, display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px', padding: '4px 12px', }} 
          >
            <MdFileCopy color='#db7e00' size={24}/>
            <span>Copy Invite Link</span>
          </button>
        </div>
        <div>
          <button onClick={toggleTheme} style={{ backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#db7e00', padding: '2px 6px' }} title="Toggle Light or Dark mode" >
            {theme === 'dark' ? <MdLightMode fontSize={30} /> : <MdDarkMode fontSize={30} />}
          </button>
        </div>
      </div>

       {/* JOIN ROOM MODAL */}
       {showJoinModal && (
        <div style={{ position: 'fixed', top:0, left:0, right:0, bottom:0, background: 'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
          <form onSubmit={joinRoom} style={{ background: theme==='dark'?'#222':'#fff', padding:20, borderRadius:8, minWidth:300, display:'flex', flexDirection:'column', gap:12 }}>
            <h3 style={{ margin:0, color: theme==='dark'?'#fff':'#000' }}>
              Enter Invitation Link
            </h3>
            <input value={inviteLink} onChange={e=>setInviteLink(e.target.value)} placeholder="https://…?room=xyz" style={{ padding:8, borderRadius:4, border:`1px solid ${theme==='dark'? '#555':'#ccc'}`, background: theme==='dark'? '#111':'#fafafa', color: theme==='dark'? '#fff':'#000' }} />
            <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
              <button type="button" onClick={()=>setShowJoinModal(false)} style={{ padding:'6px 12px', background:'transparent', color: theme==='dark'? '#fff':'#000', border:`1px solid ${theme==='dark'? '#fff':'#000'}`, borderRadius:4 }} > 
                Cancel 
              </button>
              <button type="submit" style={{ padding:'6px 12px', background:'#db7e00', color:'#fff', border:'none', borderRadius:4 }} >
                Join
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CONTENT/MIDDLE ROW */}
      <div style={{ display: 'flex', height: 'calc(100% - 45px)' }}>
        {/* LEFT PANEL CONTAINER HOLDING EITHER OR BOTH */}
        {(showProblem || showChat) && (
          <div style={{ borderRight: '1px solid #db7e00', display: 'flex', flexBasis: (showProblem || showChat) ? '25%' : '0%', flexDirection: 'column', overflow: 'hidden', transition: 'flex-basis 0.3s ease-out', }} >
            {/* UPPER HALF: Problem Description */}
            {showProblem && (
              <div style={{ borderBottom: showChat ? '2px solid #db7e00' : 'none', flex: showChat ? 1 : 1, flexDirection: 'column', height: '100%', overflow: 'hidden', }} >
                {/* ─── Tab Headers ─── */}
                <div style={{ display: 'flex', borderBottom: '1px solid #ccc', backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f5f5f5', marginTop: '8px' }}>
                  {['description', 'testcases', 'history'].map(tab => {
                    const labels = {
                      description: 'Description',
                      testcases:   'Test Cases',
                      history:     'Submission',
                    }
                    const isActive = activeTab === tab
                    return (
                      <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '8px 12px', backgroundColor: isActive ? (theme === 'dark' ? '#1e1e1e' : '#fff') : 'transparent', color: theme === 'dark' ? '#fff' : '#000', border: 'none', borderBottom: isActive ? '3px solid #db7e00' : 'none', cursor: 'pointer', fontWeight: isActive ? 'bold' : 'normal' }} >
                        {labels[tab]}
                      </button>
                    )
                  })}
                </div>
                <div style={{ flexGrow: 1, overflowY: 'auto', padding: 15, background: theme === 'dark' ? '#1e1e1e' : '#fff' }}>
                  {activeTab === 'description' && (
                    <>
                      <h2>{problem.title}</h2>
                      <p>{problem.description}</p>
                    </>
                  )}
                  {activeTab === 'testcases' && (
                    <>
                      <h2>Problem {currentProblem} Test Cases</h2>
                      <ul>
                        {problem.testCases.map((tc, i) => (
                          <li key={i}>
                            Input: {JSON.stringify(tc.input)}<br/>Expected: {tc.expected}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {activeTab === 'history' && (
                    <>
                      <h2>Problem {currentProblem} Submission</h2>
                      {problem.history.length === 0
                        ? <p>No submissions yet.</p>
                        : (
                          <table style={{ width:'100%', borderCollapse:'collapse' }}>
                            <thead>
                              <tr>
                                <th style={{ textAlign:'left', padding:8 }}>Time</th>
                                <th style={{ textAlign:'left', padding:8 }}>Result</th>
                              </tr>
                            </thead>
                            <tbody>
                              {problem.history.map((h, i) => (
                                <tr key={i} style={{ borderTop:'1px solid #ccc' }}>
                                  <td style={{ padding:8 }}>{h.ts}</td>
                                  <td style={{ padding:8 }}>{h.result}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )
                      }
                    </>
                  )}
                </div>
              </div>
            )}
            {/* LOWER HALF: Chat */}
            {showChat && (
              <div style={{ display: 'flex', flex: showProblem ? 1 : 1, flexDirection: 'column', height: '100%', overflow: 'hidden', }} >
                {/* Chat header */}
                <div style={{ padding: '8px 16px', borderBottom: '1px solid #db7e00', fontWeight: 'bold', backgroundColor: theme === 'dark' ? '#2e2e2e' : '#f9f9f9' }} >
                  Collaborators' Chat
                </div>
                {/* Messages list */}
                <div style={{ flexGrow: 1, overflowY: 'auto', padding: '8px', borderTop: '2px solid #db7e00', backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff' }} >
                  {chatMessages.length === 0 ? (
                    <div style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>
                      No messages yet
                    </div>
                  ) : (
                    chatMessages.map((msg, i) => {
                      const isMe = msg.sender === myClientID

                      const prevMsg   = chatMessages[i - 1]
                      const sameAsPrev = prevMsg && prevMsg.sender === msg.sender
                    
                      // only show the name for other‑people when it’s the first in a group
                      const showName = !isMe && !sameAsPrev

                      const peerState = awarenessRef.current?.getStates().get(msg.sender)
                      const userName = peerState?.user?.name || 'Unknown'
                      
                      const bgColor = isMe ? '#db7e00' : '#e5e5ea'
                      const textColor = isMe ? '#fff' : '#000'

                      return (
                        <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 6 }} >
                          <div style={{ position: 'relative', maxWidth: '75%' }}>
                            {/* Username label */}
                            {showName && (
                              <div style={{ marginBottom: 2, fontSize: '0.75em', color: theme === 'dark' ? '#ccc' : '#555' }}>
                                {userName}
                              </div>
                            )}

                            {/* Pointer triangle */}
                            {!isMe && (
                              <div style={{ position: 'absolute', top: showName ? 35 : 10, left: -6, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: `6px solid ${bgColor}` }}/>
                            )}
                            {isMe && (
                              <div style={{ position: 'absolute', top: 10, right: -6, width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: `6px solid ${bgColor}` }}/>
                            )}
                            {/* Bubble */}
                            <div style={{ background: bgColor, color: textColor, padding: '8px 12px', borderRadius: 12, borderTopLeftRadius: isMe ? 12 : 0, borderTopRightRadius: isMe ? 0 : 12, wordBreak: 'break-word' }}>
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                {/* Input form at bottom */}
                <form
                  onSubmit={e => {
                    e.preventDefault()
                    if (!chatInput.trim()) return
                    chatArrayRef.current.push([{
                      sender: myClientID,
                      text:   chatInput.trim(),
                      ts:     Date.now()
                    }])
                    setChatInput('')
                  }}
                  style={{ display: 'flex', padding: 8, borderTop: '1px solid #db7e00', backgroundColor: theme === 'dark' ? '#2e2e2e' : '#f9f9f9' }}
                >
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message…" style={{ flexGrow: 1, padding: '8px', borderRadius: 4, border: '2px solid #db7e00', backgroundColor: theme === 'dark' ? '#111' : '#fff', color: theme === 'dark' ? '#f0f0f0' : '#000' }} />
                  <button type="submit" style={{ marginLeft: 8, padding: '6px 12px', backgroundColor: '#db7e00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }} >
                    <MdSend size={20} />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
        {/* BUBBLE CHAT FOR EMOTIONS */}
        {bubbleVisible && (
          <div style={{ position: "absolute", bottom: 250, left: (showProblem || showChat) ? '26%' : '20%', maxWidth: 300, background: "#db7e00", color: "#fff", padding: "12px 16px", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.3)", zIndex: 9999, fontSize: 14, animation: "fadeInBubble 0.3s ease forwards", }} >
            <div style={{ display: "flex", alignItems: "center", gap: 8, }}>
              <img src={emotionGifs[bubbleEmotion]} alt={bubbleEmotion} style={{ width: 40, height: 40, objectFit: "contain" }} />
              <span>{bubbleMessage}</span>
            </div>
            <div style={{ position: "absolute", bottom: -10, left: 20, width: 0, height: 0, borderLeft: "10px solid transparent", borderRight: "10px solid transparent", borderTop: "10px solid #db7e00", }} />
          </div>
        )}
        {/* Editor + Console + Footer */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease-in-out', }}>
          {/* Monaco Editor */}
          <div style={{ flexGrow: 1, minWidth: 0, overflow: 'auto' }}>
            <Editor
              height="100%"
              width="100%"
              theme={theme === 'dark' ? 'vs-dark' : 'light'}
              language="javascript"
              onMount={handleEditorDidMount}
              options={{ minimap: { enabled: false } }}
            />
          </div>
          {/* Editor Buttons */}
          <div style={{ display: 'flex', gap: 12, padding: '8px 16px', borderTop: `1px solid #db7e00`, borderBottom: `1px solid #db7e00`, backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f0f0f0', justifyContent: 'flex-end', }}>
            {/* Toggle next problem */}
            <button style={{ padding: 8, fontWeight: 'bold', backgroundColor: theme === 'dark' ? '#f0f0f0' : '#0f0f0f', color: theme === 'dark' ? '#0f0f0f' : '#f0f0f0', }} >
              Next Problem
            </button>
            {/* Execute code in JavaScript (editor settings) */}
            <button onClick={handleRun} style={{ backgroundColor: theme === 'dark' ? '#ff9000' : '#de8000', color: '#fff', padding: 8, fontWeight: 'bold' }} >
              Run Code
            </button>
          </div>

          {/* Console Output */}
          <div style={{ backgroundColor: theme === 'dark' ? '#111' : '#c0c0c0', color: theme === 'dark' ? '#0f0' : '#060', fontFamily: 'monospace', padding: 12, minHeight: 80, overflowY: 'auto', }}>
            <pre style={{ color: '#db7e00', margin: 0, whiteSpace: 'pre-wrap', opacity: output ? 1 : 1 /* always visible */, transition: 'opacity 0.3s', }}>
              {output || '⟶ Run the code to see output here'}
            </pre>
          </div>

          {/* Console Buttons */}
          <div style={{ display: 'flex', gap: 12, padding: '8px 16px', borderTop: `1px solid #db7e00`, backgroundColor: theme === 'dark' ? '#1e1e1e' : '#f0f0f0', justifyContent: 'flex-end', }}>
            <button onClick={() => setShowProblem(v => !v)} style={{ padding: 8, fontWeight: 'bold', backgroundColor: theme === 'dark' ? '#f0f0f0' : '#0f0f0f', color: theme === 'dark' ? '#0f0f0f' : '#f0f0f0', }} >
              {showProblem ? 'Hide Problem Description' : 'View Problem Description'}
            </button>
            <button onClick={() => setShowChat(c => !c)} style={{ padding: 8, fontWeight: 'bold', backgroundColor: theme === 'dark' ? '#f0f0f0' : '#0f0f0f', color: theme === 'dark' ? '#0f0f0f' : '#f0f0f0', }} >
              {showChat ? 'Hide Chat' : 'View Chat'}
            </button>

            <button onClick={() => setShowCollab(c => !c)} style={{ padding: 8, fontWeight: 'bold', backgroundColor: theme === 'dark' ? '#f0f0f0' : '#0f0f0f', color: theme === 'dark' ? '#0f0f0f' : '#f0f0f0', }} >
              {showCollab ? 'Hide Collaborators' : 'View Collaborators'}
            </button>
            <button style={{ backgroundColor: '#ff9000', color: '##de8000', padding: 8, fontWeight: 'bold' }} >
              Submit Output
            </button>
          </div>
        </div>

        {/* Collaborators Panel */}
        <div style={{ border: `1px solid #db7e00`, display: 'flex', flexBasis: showCollab ? '20%' : '0%', flexDirection: 'column', overflow: 'hidden', transition: 'flex-basis 0.3s', }}>
          <div style={{ padding: 8, paddingLeft: 16, borderBottom: '1px solid #db7e00', fontWeight: 'bold' }}>
            List of Collaborators
          </div>
          {/* Collaborators List with Cameras/Mic statuses and names */}
          <div style={{ display: 'grid', gridTemplateColumns: '160px', gap: 12, overflowY: 'auto', padding: 12, flexGrow: 1, justifyContent: 'center' }} >
            {showCollab && awarenessRef.current &&
              Array.from(awarenessRef.current.getStates().entries())
                .filter(([id, s]) => id !== myClientID && s.user && s.av)
                .map(([clientID, { user, av }]) => (
                  <div key={clientID} style={{ width: 160, height: 100, textAlign: 'center', background: '#222', position: 'relative', borderRadius: 4, overflow: 'hidden' }} >
                    {av.cam && peersStreamMap[clientID] ? (
                      <video ref={el => el && (el.srcObject = peersStreamMap[clientID])} autoPlay playsInline muted={clientID === myClientID} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }} >
                        No Cam
                      </div>
                    )}
                    {/* Username + mic icon beneath */}
                    <div style={{ position: 'absolute', bottom: 4, left: 0, width: '100%', color: '#fff', fontSize: '0.85em', background: 'rgba(0,0,0,0.4)', padding: '2px 0' }}>
                      {user.name} {av.mic ? '🔊' : '🔇'}
                    </div>
                  </div>
                ))
            }
          </div>
          {/* Camera Preview for client user*/}
          <CameraPreview
            camOn={camOn}
            stream={localStreamRef.current}
            detectedEmotion={detectedEmotion}
            emotionGifs={emotionGifs}
          />
          {/* Microphone & Camera buttons */}
          <div style={{ padding: '8px 16px', borderTop: '1px solid #db7e00', display: 'flex', gap: '8px', justifyContent: 'flex-start', }}>
            <button onClick={toggleMic} style={{ backgroundColor: theme === 'dark' ? '#f0f0f0' : '#0f0f0f', color: theme === 'dark' ? '#0f0f0f' : '#f0f0f0', borderRadius: '4px', border: 'none', cursor: 'pointer', padding: '6px 12px', }} >
              {micOn ? '🔊 Mic On' : '🔇 Mic Off'}
            </button>
            <button onClick={toggleCam} style={{ backgroundColor: theme === 'dark' ? '#f0f0f0' : '#0f0f0f', color: theme === 'dark' ? '#0f0f0f' : '#f0f0f0', borderRadius: '4px', border: 'none', cursor: 'pointer', padding: '6px 12px', }} >
              {camOn ? '📷 Cam On' : '📷 Cam Off'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
};

export default CodingCollab;
