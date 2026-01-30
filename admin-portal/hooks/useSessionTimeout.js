import { useState, useEffect, useCallback, useRef } from 'react';

const IDLE_TIME = 20 * 60 * 1000; // 20 minutes in milliseconds
const WARNING_TIME = 2 * 60 * 1000; // 2 minutes warning before logout

export function useSessionTimeout() {
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const intervalRef = useRef(null);

  const logout = useCallback(() => {
    // Clear all timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Clear session data
    localStorage.removeItem('admin_token');
    localStorage.removeItem('user');
    
    // Redirect to login
    window.location.href = '/login';
  }, []);

  const extendSession = useCallback(() => {
    setShowWarning(false);
    setTimeLeft(0);
    
    // Clear existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    // Set warning timer (18 minutes)
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true);
      setTimeLeft(WARNING_TIME / 1000);
      
      // Start countdown
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            logout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }, IDLE_TIME - WARNING_TIME);
    
    // Set logout timer (20 minutes)
    timeoutRef.current = setTimeout(logout, IDLE_TIME);
  }, [logout]);

  const resetTimer = useCallback(() => {
    if (!showWarning) {
      extendSession();
    }
  }, [extendSession, showWarning]);

  useEffect(() => {
    // Only start session management if user is authenticated
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    // Start initial timer
    extendSession();

    // Activity events to reset timer
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      // Cleanup
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [extendSession, resetTimer]);

  return {
    showWarning,
    timeLeft,
    extendSession,
    logout
  };
}