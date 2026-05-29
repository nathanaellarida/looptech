import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { runInSandbox } from './sandboxRunner';
import Editor from "@monaco-editor/react";
import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";
import { MonacoBinding } from "y-monaco";
import { MdSend, MdFileCopy, MdLink } from "react-icons/md";

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

const CodingCompete = () => {
  const navigate = useNavigate();

  const editorRef = useRef(null);
  const awarenessRef = useRef(null);
  const widgetsRef = useRef({});
  const decorationsRef = useRef({});

  const [output, setOutput] = useState('')

  const [activeTab, setActiveTab] = useState('Problem');
  const [selectedLanguage, setSelectedLanguage] = useState('C#');
  const [expandedHints, setExpandedHints] = useState([false, false, false]);
  const [timer, setTimer] = useState(30 * 60); // 30 minutes in seconds

  const languages = ['C#', 'Python', 'JavaScript', 'Java'];

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
  
  const chatArrayRef = useRef(null)
  const peersStream = useRef({})
  const wsRef = useRef(null)
  const pcRef = useRef({})

  const ydocRef = useRef(new Y.Doc());
  const providerRef = useRef(null);
  
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState('')
  
  const params = new URLSearchParams(window.location.search)
  const [myClientID, setMyClientID] = useState(null);
  const [roomId, setRoomId] = useState(params.get('room') || makeRandomRoom())
  const [showJoinModal, setShowJoinModal] = useState(false)
  const [inviteLink, setInviteLink] = useState('')

  // Timer countdown logic
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Format timer to MM:SS
  const formatTime = (seconds) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, '0');
    const sec = String(seconds % 60).padStart(2, '0');
    return `${min}:${sec}`;
  };

  useEffect(() => {
    if (!myClientID) return
    setupSignaling()
  }, [myClientID])

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

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;
    const doc = new Y.Doc(); // a collection of shared objects -> Text
    const provider = new WebrtcProvider(roomId, doc); // room1, room2
    const type = doc.getText("monaco"); // doc { "monaco": "what our IDE is showing" }
    const awareness = provider.awareness;
    awarenessRef.current = awareness;
    
    awareness.setLocalStateField('user', getRandomUser())
    setMyClientID(awareness.clientID)
    // Bind YJS to Monaco 
    new MonacoBinding(ytext, editor.getModel(), new Set([editor]), awareness)
    console.log(provider.awareness);     
    
    // right after you bind Monaco…
    const chatArray = doc.getArray('chat')
    chatArrayRef.current = chatArray

    // initialize local state
    setChatMessages(chatArray.toArray())

    // re‑render whenever chat changes
    chatArray.observe(() => {
      setChatMessages(chatArray.toArray())
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

    pcRef.current[peerID] = pc
    return pc
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

  return (
    <div className="w-screen h-screen bg-[#0D0D0D] text-white flex flex-col overflow-hidden">
      {/* Top Navigation with Timer */}
      <div className="flex items-center justify-between px-8 py-4 h-[64px] relative">
        <span
          onClick={() => navigate('/CodingFundamentals')}
          className="text-[#FF7C34] text-xl font-bold hover:underline cursor-pointer flex items-center gap-2"
        >
          &larr; Back
        </span>

        {/* Timer in the center */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <span className="text-[#FFFFFF] text-2xl font-bold">
            {formatTime(timer)}
          </span>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setShowJoinModal(true)} style={{ backgroundColor: '#0D0D0D', color: '#f0f0f0', border: '2px solid #db7e00', borderRadius: 12, display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px', padding: '8px 12px', }} title="Join Room" >
              <MdLink color='#db7e00' size={24}/>
              <span>Join Room</span>
          </button>
          <button 
            onClick={() => { 
              navigator.clipboard.writeText(window.location.href)
              alert('Invite link copied to clipboard!') 
            }} 
            style={{ backgroundColor: '#0D0D0D', color: '#f0f0f0', border: '2px solid #db7e00', borderRadius: 12, display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '6px', padding: '8px 12px', }} 
          >
            <MdFileCopy color='#db7e00' size={24}/>
            <span>Copy Invite Link</span>
          </button>
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
      </div>

      {/* Panels */}
      <div className="flex flex-1 w-full overflow-hidden gap-1 px-6 pb-2">
        {/* Left Panel with gradient border and rounded corners */}
        <div className="p-[3px] bg-gradient-to-b from-[#FF7C34] to-[#FFC482] rounded-xl w-[330px] flex-shrink-0 flex flex-col h-full">
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
          </div>
        </div>

        {/* Middle Panel with gradient border and rounded corners */}
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
            <div className="flex-1 bg-[#1A1A1A] rounded p-3 mb-4 w-full overflow-auto">
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
              <span className="bg-gradient-to-r from-[#FF7C34] to-[#FFC482] text-white px-10 py-1 rounded-xl text-sm hover:scale-105 transition-transform duration-300 cursor-pointer">
                Next
              </span>
            </div>

            {/* Test against custom input */}
            <div className="bg-[#1A1A1A] p-10 rounded mb-1 w-full">
              <p className="text-gray-400 text-sm">{ output || "Test against custom input" }</p>
            </div>

            {/* Submit Button - right aligned */}
            <div className="flex justify-end w-full mt-4">
              <span className="bg-gradient-to-r from-[#FF7C34] to-[#FFC482] text-white px-7 py-1 rounded-xl text-sm hover:scale-105 transition-transform duration-300 cursor-pointer">
                Submit
              </span>
            </div>
          </div>
        </div>
        {/* Right Panel with gradient border and rounded corners */}
        <div className="p-[2px] bg-gradient-to-b from-[#FF7C34] to-[#FFC482] rounded-xl w-[300px] flex-shrink-0 flex flex-col h-full">
          <div className="flex-shrink-0 flex flex-col px-3 py-1 overflow-y-auto bg-[#0D0D0D] rounded-xl">
            {/* Header */}
            <h4 className="text-3xl font-bold text-white pt-1">
              Chat
              <span className="text-green-500 text-sm ml-2">6 members competing</span>
            </h4>
          </div>
          {/* Messages list */}
          <div style={{ flexGrow: 1, overflowY: 'auto', padding: '8px', borderTop: '2px solid #db7e00', backgroundColor: '#0D0D0D' }} >
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
                const userName = 'Anonymous'
                
                const bgColor = isMe ? '#db7e00' : '#e5e5ea'
                const textColor = isMe ? '#fff' : '#000'

                return (
                  <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: 6 }} >
                    <div style={{ position: 'relative', maxWidth: '75%' }}>
                      {/* Username label */}
                      {showName && (
                        <div style={{ marginBottom: 2, fontSize: '0.75em', color: '#ccc' }}>
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
            style={{ display: 'flex', padding: 8, borderTop: '1px solid #db7e00', backgroundColor: '#2e2e2e' }}
          >
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type a message…" style={{ flexGrow: 1, padding: '8px', borderRadius: 4, border: '2px solid #db7e00', backgroundColor: '#111', color: '#f0f0f0' }} />
            <button type="submit" style={{ marginLeft: 8, padding: '6px 12px', backgroundColor: '#db7e00', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }} >
              <MdSend size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CodingCompete;
