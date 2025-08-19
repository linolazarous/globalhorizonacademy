// src/components/gamification/Leaderboard.js
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';

const Leaderboard = ({ timeRange = 'weekly' }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const q = query(
      collection(db, 'leaderboard', timeRange, 'scores'),
      orderBy('score', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scores = snapshot.docs.map((doc, index) => ({
        rank: index + 1,
        id: doc.id,
        ...doc.data()
      }));

      setLeaderboard(scores);
      
      // Find user's rank
      const userScore = scores.find(score => score.id === user?.uid);
      setUserRank(userScore || null);
    });

    return unsubscribe;
  }, [timeRange, user]);

  return (
    <div className="leaderboard">
      <h3>Top Learners - {timeRange}</h3>
      
      {userRank && (
        <div className="user-rank">
          <h4>Your Rank: #{userRank.rank}</h4>
          <p>Score: {userRank.score}</p>
        </div>
      )}

      <div className="leaderboard-list">
        {leaderboard.slice(0, 10).map((entry) => (
          <div key={entry.id} className={`leaderboard-entry ${entry.id === user?.uid ? 'current-user' : ''}`}>
            <span className="rank">#{entry.rank}</span>
            <span className="name">{entry.displayName}</span>
            <span className="score">{entry.score} XP</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;
