/**
 * Generic RTK Query cache tags used across the application.
 * The previous application carried a large list of business-specific
 * tags (hotels, tours, visa, hajj, etc). Future projects should append
 * new tags here as the new domain requires, keeping generic utility
 * tags at the top.
 */
export const tags = {
  userTag: "userTag",
} as const;
