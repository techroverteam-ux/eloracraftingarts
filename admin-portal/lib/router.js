import { useState, useEffect } from 'react';

const Router = {
  currentPath: '/',
  listeners: [],
  
  navigate(path) {
    this.currentPath = path;
    window.history.pushState({}, '', path);
    this.listeners.forEach(listener => listener(path));
  },
  
  listen(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }
};

export function useRouter() {
  const [currentPath, setCurrentPath] = useState(Router.currentPath);
  
  useEffect(() => {
    const unlisten = Router.listen(setCurrentPath);
    
    const handlePopState = () => {
      Router.currentPath = window.location.pathname;
      setCurrentPath(window.location.pathname);
    };
    
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      unlisten();
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  return {
    currentPath,
    navigate: Router.navigate
  };
}

export function Link({ href, children, className, onClick }) {
  const handleClick = (e) => {
    e.preventDefault();
    Router.navigate(href);
    onClick?.();
  };
  
  return (
    <a href={href} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}