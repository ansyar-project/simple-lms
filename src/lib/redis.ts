import Redis from "ioredis";

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis =
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL!, {
    maxRetriesPerRequest: 3,
  });

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

// Cache key generators
export const CACHE_KEYS = {
  COURSE: (id: string) => `course:${id}`,
  USER_COURSES: (userId: string) => `user:${userId}:courses`,
  COURSE_PROGRESS: (userId: string, courseId: string) =>
    `progress:${userId}:${courseId}`,
  POPULAR_COURSES: "courses:popular",
  USER_NOTIFICATIONS: (userId: string) => `notifications:${userId}`,
};

// Cache TTL values (in seconds)
export const CACHE_TTL = {
  COURSE_CONTENT: 3600, // 1 hour
  USER_DATA: 1800, // 30 minutes
  POPULAR_COURSES: 7200, // 2 hours
  NOTIFICATIONS: 86400, // 24 hours
};
