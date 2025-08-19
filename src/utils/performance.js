// src/utils/performance.js
export const lazyLoad = (element, callback) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback();
          observer.unobserve(entry.target);
        }
      });
    });
    
    observer.observe(element);
    return () => observer.unobserve(element);
  } else {
    // Fallback for older browsers
    callback();
  }
};

export const optimizeImage = (src, width, format = 'webp') => {
  if (src.includes('cloudinary')) {
    return src.replace(/upload\/.*\//, `upload/w_${width},f_${format}/`);
  }
  return src;
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};