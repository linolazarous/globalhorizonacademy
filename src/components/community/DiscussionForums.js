// src/components/community/DiscussionForums.js
import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { useWebSocket } from '../../hooks/useWebSocket';
import analytics from '../../services/analytics';

const DiscussionForums = ({ courseId }) => {
  const [threads, setThreads] = useState([]);
  const [newThread, setNewThread] = useState({ title: '', content: '' });
  const { user } = useAuth();
  const { data: onlineUsers } = useWebSocket(`forums/${courseId}/online`);

  useEffect(() => {
    const q = query(
      collection(db, 'courses', courseId, 'discussions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const threadsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setThreads(threadsData);
    });

    return unsubscribe;
  }, [courseId]);

  const createThread = async (e) => {
    e.preventDefault();
    
    if (!newThread.title || !newThread.content) return;

    try {
      await addDoc(collection(db, 'courses', courseId, 'discussions'), {
        title: newThread.title,
        content: newThread.content,
        author: user.displayName,
        authorId: user.uid,
        createdAt: new Date(),
        upvotes: 0,
        replies: 0
      });

      analytics.trackEvent('thread_created', {
        courseId,
        threadTitle: newThread.title
      });

      setNewThread({ title: '', content: '' });
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  return (
    <div className="discussion-forums">
      <div className="forum-header">
        <h2>Course Discussions</h2>
        <span className="online-users">
          {onlineUsers || 0} users online
        </span>
      </div>

      <form onSubmit={createThread} className="new-thread-form">
        <input
          type="text"
          placeholder="Thread title"
          value={newThread.title}
          onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
          required
        />
        <textarea
          placeholder="What would you like to discuss?"
          value={newThread.content}
          onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
          required
        />
        <button type="submit">Create Thread</button>
      </form>

      <div className="threads-list">
        {threads.map(thread => (
          <div key={thread.id} className="thread-item">
            <h3>{thread.title}</h3>
            <p>{thread.content}</p>
            <div className="thread-meta">
              <span>By {thread.author}</span>
              <span>{thread.replies} replies</span>
              <span>{thread.upvotes} upvotes</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DiscussionForums;
