// Performance monitoring utility
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static start(label: string): void {
    this.timers.set(label, performance.now());
  }

  static end(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`No timer found for label: ${label}`);
      return 0;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    this.timers.delete(label);

    if (process.env.NODE_ENV === "development") {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  static async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }
}

// Database query performance logger
export function logQueryPerformance(query: string, duration: number) {
  if (process.env.NODE_ENV === "development" && duration > 100) {
    console.warn(`🐌 Slow query detected (${duration.toFixed(2)}ms): ${query}`);
  }
}
