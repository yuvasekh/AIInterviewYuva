import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface InterviewResult {
  username: string;
  score: string;
  completed: boolean;
}

const AdminDashboard: React.FC = () => {
  const [interviewResults, setInterviewResults] = useState<InterviewResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInterviewResults = async () => {
      try {
        const response = await axios.get("http://localhost:5000/interviews");

        // Transform API data to match InterviewResult interface
        const mappedResults = response.data.map((item: any) => ({
          username: item.candidateName,
          score: item.interviewScore,
          completed: item.status === "completed",
        }));

        setInterviewResults(mappedResults);
        setLoading(false);
      } catch (err) {
        setError("Failed to load interview results.");
        setLoading(false);
      }
    };

    fetchInterviewResults();
  }, []);

  if (loading) return <div>Loading interview results...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="admin-dashboard" style={{background:'white',height:'100vh'}}>
      <h1>Admin Dashboard</h1>
      <table className="results-table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Score</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {interviewResults.map((result, index) => (
            <tr key={index}>
              <td>{result.username}</td>
              <td>{result.score}</td>
              <td>{result.completed ? 'Completed' : 'In Progress'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDashboard;
