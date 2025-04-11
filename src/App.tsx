import React, { useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.scss";
import { LiveAPIProvider } from "./contexts/LiveAPIContext";
import ControlTray from "./components/control-tray/ControlTray";
import cn from "classnames";

// Pages
import Login from "./components/pages/Login";
import Interview from "./components/pages/Interview";
import InterviewCompleted from "./components/pages/InterviewCompleted";
import AdminDashboard from "./components/pages/AdminDashboard";

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY as string;
if (typeof API_KEY !== "string") {
  throw new Error("Set REACT_APP_GEMINI_API_KEY in .env");
}

const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);

  return (
    <div className="App">
      <LiveAPIProvider url={uri} apiKey={API_KEY}>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/interview" element={
              <div className="streaming-console">
                <main>
                  <Interview />
                  <video
                    className={cn("stream", {
                      hidden: !videoRef.current || !videoStream,
                    })}
                    ref={videoRef}
                    autoPlay
                    playsInline
                  />
                  <ControlTray
                    videoRef={videoRef}
                    supportsVideo={true}
                    onVideoStreamChange={setVideoStream}
            >
              {/* put your own buttons here */}
            </ControlTray>
                </main>
              </div>
            } />
            <Route path="/completed" element={<InterviewCompleted />} />
          </Routes>
        </Router>
      </LiveAPIProvider>
    </div>
  );
};

export default App;
