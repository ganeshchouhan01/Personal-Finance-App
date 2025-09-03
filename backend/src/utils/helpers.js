import crypto from 'crypto';
import moment from 'moment';

// Generate random token
export const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// Format currency
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

// Format date
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  return moment(date).format(format);
};

// Calculate date range for period
export const getDateRange = (period = 'month') => {
  const now = moment();
  let startDate, endDate;

  switch (period) {
    case 'today':
      startDate = now.startOf('day');
      endDate = now.endOf('day');
      break;
    case 'week':
      startDate = now.startOf('week');
      endDate = now.endOf('week');
      break;
    case 'month':
      startDate = now.startOf('month');
      endDate = now.endOf('month');
      break;
    case 'quarter':
      startDate = now.startOf('quarter');
      endDate = now.endOf('quarter');
      break;
    case 'year':
      startDate = now.startOf('year');
      endDate = now.endOf('year');
      break;
    case 'last-month':
      startDate = now.subtract(1, 'month').startOf('month');
      endDate = now.subtract(1, 'month').endOf('month');
      break;
    default:
      startDate = now.startOf('month');
      endDate = now.endOf('month');
  }

  return {
    startDate: startDate.toDate(),
    endDate: endDate.toDate(),
    start: startDate.format('YYYY-MM-DD'),
    end: endDate.format('YYYY-MM-DD')
  };
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const isStrongPassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Sanitize input data
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;')
    .replace(/"/g, '&quot;');
};

// Calculate percentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

// Generate unique ID
export const generateUniqueId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}${timestamp}${random}`;
};

// Parse query parameters
export const parseQueryParams = (query) => {
  const parsed = {};
  
  for (const [key, value] of Object.entries(query)) {
    if (value === 'true') parsed[key] = true;
    else if (value === 'false') parsed[key] = false;
    else if (!isNaN(value) && value !== '') parsed[key] = parseFloat(value);
    else if (value) parsed[key] = value;
  }
  
  return parsed;
};

// Log login attempt
export const logLoginAttempt = async (user, ipAddress, userAgent, success) => {
  try {
    const loginRecord = {
      timestamp: new Date(),
      ipAddress,
      userAgent,
      success
    };

    // Add to user's login history (first 100 records)
    user.loginHistory.unshift(loginRecord);
    if (user.loginHistory.length > 100) {
      user.loginHistory = user.loginHistory.slice(0, 100);
    }

    await user.save();
    return true;
  } catch (error) {
    console.error('Error logging login attempt:', error);
    return false;
  }
};

// Get client IP address from request
export const getClientIp = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null);
};

// Delay function
export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Generate slug from text
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Validate URL
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

// Get current timestamp
export const getTimestamp = () => {
  return new Date().toISOString();
};

// Generate random number in range
export const randomInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Truncate text
export const truncate = (text, length = 100, suffix = '...') => {
  if (text.length <= length) return text;
  return text.substring(0, length) + suffix;
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// Remove duplicates from array
export const removeDuplicates = (array) => {
  return [...new Set(array)];
};

// Sort array by key
export const sortBy = (array, key, order = 'asc') => {
  return array.sort((a, b) => {
    let valueA = a[key];
    let valueB = b[key];
    
    if (typeof valueA === 'string') valueA = valueA.toLowerCase();
    if (typeof valueB === 'string') valueB = valueB.toLowerCase();
    
    if (valueA < valueB) return order === 'asc' ? -1 : 1;
    if (valueA > valueB) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

