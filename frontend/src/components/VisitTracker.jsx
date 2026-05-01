import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const VisitTracker = () => {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const trackVisit = async () => {
      try {
        const sessionId = sessionStorage.getItem('sessionId') || 
          (() => {
            const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
            sessionStorage.setItem('sessionId', newId);
            return newId;
          })();

        const deviceType = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
          ? 'mobile' : 'desktop';

        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';
        
        const config = user?.token ? {
          headers: { Authorization: `Bearer ${user.token}` }
        } : {};

        await axios.post(`${API_URL}/api/analytics/track-visit`, {
          deviceType,
          page: location.pathname,
          sessionId,
          action: 'view'
        }, config);
      } catch (error) {
        // Silently fail
      }
    };

    trackVisit();
  }, [location.pathname, user]);

  return null;
};

export default VisitTracker;