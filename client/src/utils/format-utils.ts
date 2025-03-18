import { format, formatDistance, formatRelative } from 'date-fns';

/**
 * Format a date as a relative time (e.g., "5 minutes ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

/**
 * Format a date in a standard format (e.g., "Jan 1, 2023")
 */
export function formatDate(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  return format(dateObj, 'MMM d, yyyy');
}

/**
 * Format a time in a standard format (e.g., "3:45 PM")
 */
export function formatTime(date: Date | string | number): string {
  const dateObj = typeof date === 'string' || typeof date === 'number' 
    ? new Date(date) 
    : date;
  return format(dateObj, 'h:mm a');
}

/**
 * Format a duration in minutes to a human-readable format
 */
export function formatDuration(durationInMinutes: number): string {
  if (durationInMinutes < 60) {
    return `${durationInMinutes} min`;
  }
  
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;
  
  if (minutes === 0) {
    return `${hours} hr`;
  }
  
  return `${hours} hr ${minutes} min`;
}

/**
 * Format nicotine strength with 'mg' suffix
 */
export function formatNicotineStrength(strength: number): string {
  return `${strength} mg`;
}
