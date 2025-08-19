// src/services/analytics.js
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getPerformance, trace } from 'firebase/performance';

class AnalyticsService {
  constructor() {
    this.analytics = getAnalytics();
    this.performance = getPerformance();
  }

  trackEvent(eventName, params = {}) {
    logEvent(this.analytics, eventName, {
      platform: 'web',
      timestamp: Date.now(),
      ...params
    });
  }

  startTrace(traceName) {
    const t = trace(this.performance, traceName);
    t.start();
    return t;
  }

  trackCourseEngagement(courseId, section, timeSpent) {
    this.trackEvent('course_engagement', {
      course_id: courseId,
      section,
      time_spent: timeSpent,
      user_id: this.getUserId()
    });
  }

  trackPaymentEvent(planType, amount, currency) {
    this.trackEvent('payment_processed', {
      plan_type: planType,
      amount,
      currency,
      user_id: this.getUserId()
    });
  }
}

export default new AnalyticsService();
