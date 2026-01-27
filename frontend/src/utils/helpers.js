import { format, parseISO } from 'date-fns';

export const formatDate = (date, formatString = 'MMM dd, yyyy HH:mm') => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatString);
  } catch (error) {
    return 'Invalid Date';
  }
};

export const formatCoordinates = (lat, lng, decimals = 4) => {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return 'N/A';
  }
  return `${lat.toFixed(decimals)}, ${lng.toFixed(decimals)}`;
};

export const formatSpeed = (speed) => {
  if (speed === null || speed === undefined) return 'N/A';
  return `${speed.toFixed(1)} kn`;
};

export const formatDistance = (distance) => {
  if (distance === null || distance === undefined) return 'N/A';
  return `${distance.toFixed(1)} nm`;
};

export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const debounce = (func, wait = 300) => {
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