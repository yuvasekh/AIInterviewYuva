import React from "react";
import { useNavigate } from "react-router-dom";
import { Altair } from "../altair/Altair";
// import { Altair } from "../components/altair/Altair";

const Interview: React.FC = () => {
  const navigate = useNavigate();

  const completeInterview = () => {
    navigate("/completed");
  };

  return (
    <div className="interview-page">
      <h2>Interview In Progress</h2>
      <Altair />
      {/* <button onClick={completeInterview}>Mark Interview Completed</button> */}
    </div>
  );
};

export default Interview;
