/**
 * Decode JWT token without verification (for client-side use)
 * Note: This only decodes the token, it doesn't verify the signature.
 * The backend should always verify tokens on the server side.
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    
    // JWT tokens have 3 parts separated by dots: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    // Decode the payload (second part)
    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    
    return decoded;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Get current user info from token and localStorage
 */
export const getCurrentUser = () => {
  const token = localStorage.getItem('authToken');
  const email = localStorage.getItem('adminEmail');
  
  if (!token) return null;
  
  const decoded = decodeToken(token);
  if (!decoded) return null;
  
  return {
    name: decoded.user_name || 'Admin',
    email: email || 'admin@livease.com',
    userId: decoded.user_id,
    profilePic: decoded.profile_pic,
    accountType: decoded.account_type
  };
};


