// Re-export types from schema for client use
export * from '@shared/schema';

// Client-specific types
export type NavigationItem = {
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
};

export type FormError = {
  type: string;
  message: string;
};
