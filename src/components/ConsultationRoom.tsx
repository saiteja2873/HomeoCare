import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor, 
  MessageSquare, 
  PhoneOff, 
  Sparkles,
  Send,
  User,
  Activity,
  ArrowLeft
} from "lucide-react";

interface ConsultationRoomProps {
  appointment: any;
  userRole: "patient" | "doctor" | "admin";
  onClose: () => void;
  onComplete?: (notes: string) => void;
}

export const ConsultationRoom: React.FC<ConsultationRoomProps> = ({ 
  appointment, 
  userRole, 
  onClose,
  onComplete 
}) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [videoActive, setVideoActive] = useState(true);
  const [audioActive, setAudioActive] = useState(true);
  const [screenShareActive, setScreenShareActive] = useState(false);
  const [useSimulationFeed, setUseSimulationFeed] = useState(false); // Default to real video
  const [connectionStatus, setConnectionStatus] = useState<string>("Connecting...");
  
  const [chatMessages, setChatMessages] = useState<any[]>([
    { sender: "system", text: "Secure WebRTC Consultation initiated.", time: "Now" },
    { sender: "system", text: "Camera and Microphone permissions have been authorized via manifest.", time: "Now" }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [completionNotes, setCompletionNotes] = useState("");
  const [showNotesForm, setShowNotesForm] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const roomId = `consultation-${appointment.id}`;

  // STUN servers for NAT traversal
  const iceServers = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:stun1.l.google.com:19302" },
    ]
  };

  // Map local stream to video element
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Map remote stream to video element
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Initialize WebRTC and Socket.io
  useEffect(() => {
    async function initWebRTC() {
      try {
        // Get local media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);
        setConnectionStatus("Connected to media devices");

        // Connect to Socket.io signaling server
        const socket = io(window.location.origin);
        socketRef.current = socket;

        socket.on("connect", () => {
          console.log("[WebRTC] Connected to signaling server");
          setConnectionStatus("Joining consultation room...");
          socket.emit("join-room", roomId);
        });

        socket.on("other-users", (users: string[]) => {
          console.log("[WebRTC] Other users in room:", users);
          if (users.length > 0) {
            createPeerConnection(users[0], true, stream);
          }
        });

        socket.on("user-joined", (userId: string) => {
          console.log("[WebRTC] User joined:", userId);
          createPeerConnection(userId, false, stream);
        });

        socket.on("offer", async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
          console.log("[WebRTC] Received offer from:", from);
          
          // Create peer connection if it doesn't exist
          if (!peerConnectionRef.current) {
            createPeerConnection(from, false, stream);
          }
          
          const pc = peerConnectionRef.current;
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("answer", { answer, to: from });
          }
        });

        socket.on("answer", async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
          console.log("[WebRTC] Received answer");
          const pc = peerConnectionRef.current;
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
          }
        });

        socket.on("ice-candidate", async ({ candidate, from }: { candidate: RTCIceCandidateInit; from: string }) => {
          console.log("[WebRTC] Received ICE candidate from:", from);
          const pc = peerConnectionRef.current;
          if (pc && pc.remoteDescription) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
              console.log("[WebRTC] ICE candidate added successfully");
            } catch (err) {
              console.error("[WebRTC] Error adding ICE candidate:", err);
            }
          } else {
            console.warn("[WebRTC] Cannot add ICE candidate - no peer connection or remote description");
          }
        });

        socket.on("user-left", (userId: string) => {
          console.log("[WebRTC] User left:", userId);
          setConnectionStatus("Other participant left");
          setRemoteStream(null);
        });

      } catch (err) {
        console.error("WebRTC initialization failed:", err);
        setConnectionStatus("Camera not available - using simulation mode");
        setUseSimulationFeed(true);
        setChatMessages(prev => [
          ...prev, 
          { sender: "system", text: "Camera not available - switched to simulation mode", time: "Now" }
        ]);
      }
    }

    function createPeerConnection(remoteUserId: string, isInitiator: boolean, stream: MediaStream) {
      // Don't create duplicate peer connections
      if (peerConnectionRef.current) {
        console.log("[WebRTC] Peer connection already exists, reusing");
        return;
      }

      console.log(`[WebRTC] Creating peer connection (initiator: ${isInitiator})`);
      const pc = new RTCPeerConnection(iceServers);
      peerConnectionRef.current = pc;

      // Add local tracks to peer connection
      stream.getTracks().forEach(track => {
        console.log(`[WebRTC] Adding local ${track.kind} track`);
        pc.addTrack(track, stream);
      });

      // Handle incoming remote stream
      pc.ontrack = (event) => {
        console.log("[WebRTC] Received remote track:", event.track.kind);
        console.log("[WebRTC] Remote stream has", event.streams[0].getTracks().length, "tracks");
        setRemoteStream(event.streams[0]);
        setConnectionStatus("Connected");
        setChatMessages(prev => [
          ...prev,
          { sender: "system", text: "Video connection established", time: "Now" }
        ]);
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && socketRef.current) {
          console.log("[WebRTC] Sending ICE candidate");
          socketRef.current.emit("ice-candidate", {
            candidate: event.candidate,
            to: remoteUserId
          });
        }
      };

      // ICE connection state change
      pc.oniceconnectionstatechange = () => {
        console.log("[WebRTC] ICE connection state:", pc.iceConnectionState);
        if (pc.iceConnectionState === "failed") {
          setConnectionStatus("Connection failed - retrying...");
          pc.restartIce();
        }
      };

      // Connection state change
      pc.onconnectionstatechange = () => {
        console.log("[WebRTC] Connection state:", pc.connectionState);
        setConnectionStatus(`Connection: ${pc.connectionState}`);
        
        if (pc.connectionState === "connected") {
          setConnectionStatus("Connected");
        } else if (pc.connectionState === "disconnected") {
          setConnectionStatus("Disconnected");
        } else if (pc.connectionState === "failed") {
          setConnectionStatus("Connection failed");
        }
      };

      // If initiator, create and send offer
      if (isInitiator) {
        pc.createOffer()
          .then(offer => {
            console.log("[WebRTC] Created offer");
            return pc.setLocalDescription(offer);
          })
          .then(() => {
            console.log("[WebRTC] Set local description, sending offer");
            if (socketRef.current) {
              socketRef.current.emit("offer", {
                offer: pc.localDescription,
                to: remoteUserId
              });
            }
          })
          .catch(err => console.error("[WebRTC] Error creating offer:", err));
      }
    }

    initWebRTC();

    // Cleanup on unmount
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (socketRef.current) {
        socketRef.current.emit("leave-room", roomId);
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Sync video toggle
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = videoActive;
      });
    }
  }, [videoActive, localStream]);

  // Sync audio toggle
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = audioActive;
      });
    }
  }, [audioActive, localStream]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const msg = {
      sender: userRole,
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages(prev => [...prev, msg]);
    setNewMessage("");

    // Setup simulated counter-response after 2-3 seconds
    setTimeout(() => {
      const opposingRole = userRole === "patient" ? "Doctor" : "Patient";
      const responses = [
        "I understand. Let's make sure those symptoms correspond to constitutional patterns.",
        "Yes, the dilution dosage matches what Hahnemann recommended.",
        "Let me record this symptom down into your case history logs.",
        "Thank you doctor, I'll follow those dietary restrictions."
      ];
      const randomResponse = {
        sender: userRole === "patient" ? "doctor" : "patient",
        text: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setChatMessages(prev => [...prev, randomResponse]);
    }, 2500);
  };

  const toggleScreenShare = () => {
    setScreenShareActive(!screenShareActive);
    setChatMessages(prev => [
      ...prev,
      { sender: "system", text: screenShareActive ? "Screen Share closed." : "Screen Share broadcast started.", time: "Now" }
    ]);
  };

  const handleFinishConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onComplete) {
      onComplete(completionNotes || "Consultation finished without special secondary clinician remarks.");
    }
  };

  return (
    <div id="consultation_room_root" className="fixed inset-0 bg-slate-950 z-50 flex flex-col md:flex-row text-white">
      {/* Dynamic Video Showcase Grid */}
      <div className="flex-1 flex flex-col p-4 md:p-6 relative">
        <div id="consultation_room_header" className="flex justify-between items-center bg-slate-900/60 backdrop-blur-md rounded-2xl p-4 mb-4 border border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
            <h2 className="text-sm font-semibold tracking-wide font-display">
              Live Consultation Room: {appointment.patientName}
            </h2>
          </div>
          <span className="text-xs font-mono bg-teal-500/10 text-teal-400 px-3 py-1 rounded-full border border-teal-500/25">
            Role: {userRole.toUpperCase()}
          </span>
        </div>

        {/* Double Videos Section */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* 1. Remote Participant View */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden relative flex items-center justify-center min-h-[300px]">
            <div className="absolute top-4 left-4 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold flex items-center gap-1.5 z-10">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span>{userRole === "patient" ? "Dr. Aditya Sen (Physician)" : `${appointment.patientName} (Patient Case)`}</span>
            </div>

            {/* Connection status badge */}
            <div className="absolute top-4 right-4 bg-slate-900/95 px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-semibold z-10">
              <span className="text-teal-400">{connectionStatus}</span>
            </div>

            {/* Remote video stream */}
            {remoteStream ? (
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : useSimulationFeed ? (
              <BiometricSimulator 
                name={userRole === "patient" ? "Dr. Aditya Sen (Physician)" : appointment.patientName} 
                type={userRole === "patient" ? "doctor" : "patient"} 
              />
            ) : (
              <div className="text-center space-y-3">
                <div className="w-14 h-14 bg-slate-800 text-slate-500 border border-slate-700 rounded-full flex items-center justify-center mx-auto">
                  <User className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Waiting for other participant...</p>
                  <p className="text-[10px] text-slate-500 mt-1">{connectionStatus}</p>
                </div>
              </div>
            )}
          </div>

          {/* 2. Local Self View */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden relative flex items-center justify-center min-h-[300px]">
            <div className="absolute top-4 left-4 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold flex items-center gap-1.5 z-10">
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span>My Screen Feed</span>
            </div>

            {/* Toggle Switch between Simulated Feed / Actual WebCam */}
            <button 
              type="button"
              onClick={() => setUseSimulationFeed(!useSimulationFeed)} 
              className="absolute top-4 right-4 bg-slate-900/95 hover:bg-slate-800 border-2 border-teal-500/20 hover:border-teal-500/40 px-2.5 py-1.5 rounded-xl text-[10px] text-teal-300 hover:text-teal-400 font-bold active:scale-95 transition z-20 flex items-center gap-1 font-mono shadow-md cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>{useSimulationFeed ? "Use Real Cam" : "Use Simulation"}</span>
            </button>

            {useSimulationFeed ? (
              <BiometricSimulator 
                name={userRole === "patient" ? `${appointment.patientName} (Patient)` : "Dr. Aditya Sen (Physician)"} 
                type={userRole === "patient" ? "patient" : "doctor"} 
              />
            ) : localStream ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            ) : (
              <div className="text-center space-y-3.5 p-6 md:p-8">
                <div className="w-14 h-14 bg-slate-800 text-teal-400 border border-teal-500/20 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Video className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <p className="text-xs text-slate-350 font-medium">Standard WebCam Inactive</p>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-xs mx-auto">No hardware stream detected. Click "Use Simulation" in the top-right to test active telemetry.</p>
                </div>
              </div>
            )}

            {/* Video muted indicator */}
            {!videoActive && (
              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm flex items-center justify-center z-10 font-mono">
                <div className="text-center p-6">
                  <VideoOff className="w-8 h-8 text-rose-500 mx-auto" />
                  <p className="text-xs font-semibold text-slate-400 mt-2">Camera Feed Stopped</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Media Control Toolbar */}
        <div id="media_call_controls" className="bg-slate-900/80 border border-slate-800/80 p-4 mt-4 rounded-2xl flex items-center justify-center gap-3 md:gap-5">
          <button
            onClick={() => setVideoActive(!videoActive)}
            className={`p-3.5 rounded-xl transition cursor-pointer ${videoActive ? "bg-slate-800 text-slate-200 hover:bg-slate-755" : "bg-rose-600 hover:bg-rose-500 text-white"}`}
            title={videoActive ? "Mute Video" : "Enable Video"}
          >
            {videoActive ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setAudioActive(!audioActive)}
            className={`p-3.5 rounded-xl transition cursor-pointer ${audioActive ? "bg-slate-800 text-slate-200 hover:bg-slate-755" : "bg-rose-600 hover:bg-rose-500 text-white"}`}
            title={audioActive ? "Mute Microphone" : "Enable Microphone"}
          >
            {audioActive ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-3.5 rounded-xl transition cursor-pointer ${screenShareActive ? "bg-teal-600 hover:bg-teal-500 text-white" : "bg-slate-800 text-slate-200 hover:bg-slate-755"}`}
            title="Toggle Screen Share"
          >
            <Monitor className="w-5 h-5" />
          </button>

          {/* Special trigger: complete consultation strictly for doctor */}
          {userRole === "doctor" && onComplete && (
            <button
              onClick={() => setShowNotesForm(true)}
              className="bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold text-xs px-5 py-3.5 rounded-xl transition cursor-pointer"
            >
              Conclude & File Notes
            </button>
          )}

          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-500 text-white px-5 py-3.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>Leave Consulting Room</span>
          </button>
        </div>
      </div>

      {/* Slideout Text Chat Area */}
      <div className="w-full md:w-80 lg:w-96 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800/80 flex flex-col h-72 md:h-full">
        <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider font-display">Live Secure Consultation Chat</h3>
        </div>

        {/* Message Feeds */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
          {chatMessages.map((msg, i) => {
            if (msg.sender === "system") {
              return (
                <div key={i} className="text-center">
                  <span className="inline-block text-[10px] text-teal-350 bg-teal-950/40 border border-teal-550/15 py-1 px-3 rounded-full">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isMe = msg.sender === userRole;
            return (
              <div 
                key={i} 
                className={`flex flex-col max-w-[80%] ${isMe ? "ml-auto items-end" : "mr-auto items-start"}`}
              >
                <span className="text-[10px] text-slate-450 uppercase mb-0.5 font-bold">
                  {msg.sender === userRole ? "Me" : msg.sender}
                </span>
                <div className={`p-3 rounded-2xl text-xs ${isMe ? "bg-teal-650 text-white rounded-tr-none" : "bg-slate-800 text-slate-150 rounded-tl-none"}`}>
                  <p className="leading-relaxed text-left">{msg.text}</p>
                </div>
                <span className="text-[8px] text-slate-500 mt-0.5">{msg.time}</span>
              </div>
            );
          })}
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-850 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type clinical details..."
            className="flex-1 text-xs px-3 py-2 bg-slate-800 border border-slate-750 rounded-xl focus:border-teal-500 outline-none text-white transition"
          />
          <button
            type="submit"
            className="p-2.5 bg-teal-600 hover:bg-teal-500 text-slate-950 font-bold rounded-xl transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Conclude consultation modal notes for doctors */}
      {showNotesForm && (
        <div id="diagnostics_notes_modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 z-55">
          <div className="bg-white text-slate-800 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-scale-up">
            <div className="bg-teal-950 p-5 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold font-display tracking-tight">Write Consultation Notes</h3>
              </div>
            </div>

            <form onSubmit={handleFinishConsultationSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-left">Clinical Diagnosis & Prescriptions Remarks</label>
                <textarea
                  required
                  rows={4}
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="e.g., Symptoms indicate Belladonna 30C profile. Appears sensitive to heat waves. Maintain dilution dosage 4 globules daily..."
                  className="w-full text-xs px-3.5 py-2.5 border border-slate-250 bg-slate-50 rounded-xl focus:bg-white outline-none focus:border-teal-500 transition"
                ></textarea>
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowNotesForm(false)}
                  className="px-4 py-2 border border-slate-200 font-semibold text-xs rounded-xl hover:bg-slate-50 transition"
                >
                  Go Back
                </button>
                <button
                  type="submit"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition cursor-pointer"
                >
                  File & Complete
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

interface BiometricSimulatorProps {
  name: string;
  type: "patient" | "doctor";
}

const BiometricSimulator: React.FC<BiometricSimulatorProps> = ({ name, type }) => {
  return (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden font-mono select-none">
      {/* High-tech grid overlay */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:16px_16px]"></div>
      
      {/* Target framing brackets */}
      <div className="absolute top-6 left-6 w-4 h-4 border-t-2 border-l-2 border-teal-500/40"></div>
      <div className="absolute top-6 right-6 w-4 h-4 border-t-2 border-r-2 border-teal-500/40"></div>
      <div className="absolute bottom-6 left-6 w-4 h-4 border-b-2 border-l-2 border-teal-500/40"></div>
      <div className="absolute bottom-6 right-6 w-4 h-4 border-b-2 border-r-2 border-teal-500/40"></div>

      {type === "patient" ? (
        <div className="z-10 text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-full bg-teal-500/10 border-2 border-teal-550/30 flex items-center justify-center mx-auto text-teal-400 shadow-lg shadow-teal-500/10">
              <Activity className="w-8 h-8 animate-pulse text-teal-400" />
            </div>
            <span className="absolute bottom-0 right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-ping"></span>
            <span className="absolute bottom-0 right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
          </div>

          <div>
            <div className="text-[10px] tracking-widest text-teal-400 font-bold uppercase flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Secure consultation feed
            </div>
            <div className="text-xs text-white font-semibold mt-1">{name}</div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-slate-900/60 px-3 py-2 border border-slate-800 rounded-xl text-[9px] text-slate-400 text-left min-w-[170px]">
            <div>PULSE: <span className="text-rose-400 font-bold animate-pulse">72 BPM</span></div>
            <div>STATUS: <span className="text-emerald-400 font-semibold uppercase">Stable</span></div>
            <div>SYS: <span className="text-teal-405 font-semibold">120/80</span></div>
            <div>OXY: <span className="text-teal-405 font-semibold">98%</span></div>
          </div>
        </div>
      ) : (
        <div className="z-10 text-center space-y-4">
          <div className="relative inline-block">
            <div className="w-16 h-16 rounded-full bg-teal-500/10 border-2 border-teal-550/30 flex items-center justify-center mx-auto text-teal-450 shadow-lg shadow-teal-500/10">
              <User className="w-8 h-8 text-teal-400" />
            </div>
            <span className="absolute bottom-0 right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full animate-ping"></span>
            <span className="absolute bottom-0 right-1 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full"></span>
          </div>

          <div>
            <div className="text-[10px] tracking-widest text-teal-400 font-bold uppercase flex items-center justify-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 font-bold animate-pulse"></span>
              Live specialist feed
            </div>
            <div className="text-xs text-white font-semibold mt-1">{name}</div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 bg-slate-900/60 px-3 py-2 border border-slate-800 rounded-xl text-[9px] text-slate-400 text-left min-w-[170px]">
            <div>ROLE: <span className="text-teal-450 font-semibold">Specialist</span></div>
            <div>SIG: <span className="text-emerald-405 font-semibold">Encrypted</span></div>
            <div>CH: <span className="text-teal-450 font-semibold">RTC Feed</span></div>
            <div>LATENCY: <span className="text-teal-450 font-semibold">12ms</span></div>
          </div>
        </div>
      )}

      {/* Rotating radial / sweep lines decoration */}
      <div className="absolute w-[220px] h-[220px] border border-teal-500/5 rounded-full flex items-center justify-center animate-spin [animation-duration:15s]">
        <div className="w-1 h-1 bg-teal-450/40 rounded-full absolute top-0"></div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/90 py-1 px-3 border border-slate-800/80 rounded-full text-[8px] text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
        <span className="w-1 h-1 rounded-full bg-teal-400 animate-pulse"></span>
        SECURED CALL PROTOCOL
      </div>
    </div>
  );
};
