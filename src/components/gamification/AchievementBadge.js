// src/components/gamification/AchievementBadges.js
import React, { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import analytics from '../../services/analytics';

const AchievementBadges = () => {
  const [badges, setBadges] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'achievements'),
      where('earned', '==', true)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const badgesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setBadges(badgesData);
      
      // Track badge unlocks
      badgesData.forEach(badge => {
        if (badge.newlyEarned) {
          analytics.trackEvent('badge_earned', {
            badge_id: badge.id,
            badge_name: badge.name,
            category: badge.category
          });
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="achievement-badges">
      <h3>Your Achievements</h3>
      <div className="badges-grid">
        {badges.map(badge => (
          <div key={badge.id} className="badge-item" title={badge.description}>
            <div className="badge-icon">
              <img src={`/badges/${badge.id}.svg`} alt={badge.name} />
              {badge.newlyEarned && <span className="badge-new">New!</span>}
            </div>
            <span className="badge-name">{badge.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchievementBadges;
