// src/services/security.js
import { rateLimit } from '../../utils/validation';
import analytics from './analytics';

class SecurityService {
  constructor() {
    this.suspiciousActivities = new Map();
  }

  async validateRequest(request, context) {
    // Rate limiting
    const ip = request.headers['client-ip'] || 'unknown';
    const isRateLimited = await rateLimit(ip, 10, 60000); // 10 requests per minute
    
    if (isRateLimited) {
      analytics.trackEvent('rate_limit_exceeded', { ip });
      throw new Error('Rate limit exceeded');
    }

    // Check for suspicious patterns
    this.detectSuspiciousActivity(request, ip);

    return true;
  }

  detectSuspiciousActivity(request, ip) {
    const key = `suspicious_${ip}`;
    const currentCount = this.suspiciousActivities.get(key) || 0;
    
    if (currentCount > 5) {
      analytics.trackEvent('suspicious_activity_blocked', { ip, count: currentCount });
      throw new Error('Suspicious activity detected');
    }

    // Add to suspicious count if certain conditions are met
    if (this.isSuspiciousRequest(request)) {
      this.suspiciousActivities.set(key, currentCount + 1);
      setTimeout(() => {
        this.suspiciousActivities.delete(key);
      }, 3600000); // Clear after 1 hour
    }
  }

  isSuspiciousRequest(request) {
    // Implement your suspicious request detection logic
    return false;
  }

  async sanitizeContent(content) {
    // Implement content sanitization logic
    return content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
}

export default new SecurityService();
