// src/services/contentDelivery.js
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import { lazyLoad } from '../utils/performance';

class ContentDeliveryService {
  constructor() {
    this.cache = new Map();
  }

  async getVideoStreamUrl(videoPath, quality = '720p') {
    const cacheKey = `${videoPath}_${quality}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const videoRef = ref(storage, `videos/${quality}/${videoPath}`);
      const url = await getDownloadURL(videoRef);
      
      this.cache.set(cacheKey, url);
      return url;
    } catch (error) {
      console.error('Video stream error:', error);
      throw error;
    }
  }

  async preloadContent(contentUrls) {
    return Promise.all(
      contentUrls.map(url => 
        new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = url;
        })
      )
    );
  }

  optimizeForNetwork(networkType) {
    const qualityMap = {
      '4g': '1080p',
      '3g': '720p',
      '2g': '480p',
      'slow-2g': '360p'
    };

    return qualityMap[networkType] || '720p';
  }
}

export default new ContentDeliveryService();
