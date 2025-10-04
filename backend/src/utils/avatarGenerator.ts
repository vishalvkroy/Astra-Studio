/**
 * Generate a default avatar URL for users
 * Uses DiceBear API for consistent, beautiful avatars
 */

export const generateDefaultAvatar = (firstName: string, lastName: string, email: string): string => {
  // Use email as seed for consistency
  const seed = encodeURIComponent(email);
  
  // Using DiceBear's avataaars style (free and no attribution required)
  // Alternative styles: bottts, identicon, initials, pixel-art, avataaars-neutral
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=00C9A7,845EC2,FFD700,FF6B6B&radius=50`;
};

export const generateInitialsAvatar = (firstName: string, lastName: string): string => {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  const seed = encodeURIComponent(initials);
  
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=00C9A7,845EC2,FFD700,FF6B6B&fontSize=40`;
};

export const getAvatarUrl = (user: { firstName: string; lastName: string; email: string; avatar?: string }): string => {
  // If user has custom avatar, return it
  if (user.avatar && !user.avatar.includes('dicebear')) {
    return user.avatar;
  }
  
  // Otherwise generate a default avatar
  return generateDefaultAvatar(user.firstName, user.lastName, user.email);
};
