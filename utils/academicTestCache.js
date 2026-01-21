// Simple in-memory cache for academic test questions
// This helps avoid repeated API calls for similar question requests

// Cache structure:
// {
//   "stream:department:subject:confidenceLevel:testFormat": {
//     questions: [...],
//     timestamp: Date.now()
//   }
// }

const questionCache = {};
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Generate a cache key from test parameters
 */
const generateCacheKey = (stream, department, subject, confidenceLevel, testFormat) => {
  return `${stream}:${department}:${subject}:${confidenceLevel}:${testFormat}`;
}

/**
 * Check if questions for the given parameters exist in cache and aren't expired
 */
const getCachedQuestions = (stream, department, subject, confidenceLevel, testFormat) => {
  const key = generateCacheKey(stream, department, subject, confidenceLevel, testFormat);
  const cachedData = questionCache[key];
  
  if (!cachedData) return null;
  
  // Check if cache has expired
  if (Date.now() - cachedData.timestamp > CACHE_EXPIRY) {
    // Remove expired cache
    delete questionCache[key];
    return null;
  }
  
  return cachedData.questions;
}

/**
 * Store questions in cache
 */
const cacheQuestions = (stream, department, subject, confidenceLevel, testFormat, questions) => {
  const key = generateCacheKey(stream, department, subject, confidenceLevel, testFormat);
  
  questionCache[key] = {
    questions,
    timestamp: Date.now()
  };
  
  console.log(`Cached questions for ${key}`);
}

/**
 * Get cache statistics
 */
const getCacheStats = () => {
  const keys = Object.keys(questionCache);
  return {
    size: keys.length,
    keys
  };
}

module.exports = {
  getCachedQuestions,
  cacheQuestions,
  getCacheStats
};
