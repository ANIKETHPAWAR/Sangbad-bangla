/**
 * Authentication Service for Sangbad Bangla Admin Panel
 * Handles both Auth0 JWT tokens and temporary admin credentials
 */

class AuthService {
  constructor() {
    this.tempCredentials = {
      username: 'Sangbadbangla@20252025',
      password: 'SB@20252025'
    };
    this.isUsingTempAuth = false;
  }

  /**
   * Get authentication headers for API requests
   * @param {boolean} forceTemp - Force using temporary credentials
   * @returns {Promise<Object>} Headers object
   */
  async getAuthHeaders(forceTemp = false) {
    try {
      // If forcing temporary auth or if we're already using it
      if (forceTemp || this.isUsingTempAuth) {
        return this.getTempAuthHeaders();
      }

      // Try to get Auth0 token first
      try {
        const { getAccessTokenSilently } = await this.getAuth0Hook();
        const token = await getAccessTokenSilently();
        return {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };
      } catch (error) {
        console.log('Auth0 token not available, using temporary credentials');
        this.isUsingTempAuth = true;
        return this.getTempAuthHeaders();
      }
    } catch (error) {
      console.error('Error getting auth headers:', error);
      // Fallback to temporary credentials
      this.isUsingTempAuth = true;
      return this.getTempAuthHeaders();
    }
  }

  /**
   * Get temporary authentication headers using Basic auth
   * @returns {Object} Headers object
   */
  getTempAuthHeaders() {
    try {
      // Use a more reliable base64 encoding method
      const credentials = `${this.tempCredentials.username}:${this.tempCredentials.password}`;
      let encodedCredentials;
      
      if (typeof btoa !== 'undefined') {
        encodedCredentials = btoa(credentials);
      } else {
        // Fallback for environments without btoa
        encodedCredentials = Buffer.from(credentials).toString('base64');
      }
      
      console.log('Using temporary auth headers with credentials:', this.tempCredentials.username);
      
      return {
        'Authorization': `Basic ${encodedCredentials}`,
        'Content-Type': 'application/json'
      };
    } catch (error) {
      console.error('Error creating temp auth headers:', error);
      // Fallback to simple credentials
      return {
        'Authorization': `Basic ${btoa('Sangbadbangla@20252025:SB@20252025')}`,
        'Content-Type': 'application/json'
      };
    }
  }

  /**
   * Dynamically import Auth0 hook (to avoid SSR issues)
   * @returns {Promise<Object>} Auth0 hook object
   */
  async getAuth0Hook() {
    try {
      const { useAuth0 } = await import('@auth0/auth0-react');
      return useAuth0();
    } catch (error) {
      console.log('Auth0 not available, using temporary credentials');
      throw new Error('Auth0 not available');
    }
  }

  /**
   * Check if user is authenticated (either method)
   * @returns {Promise<boolean>} True if authenticated
   */
  async isAuthenticated() {
    try {
      if (this.isUsingTempAuth) {
        return true; // Temporary credentials are always valid
      }

      const { useAuth0 } = await this.getAuth0Hook();
      const { isAuthenticated } = useAuth0();
      return isAuthenticated;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if user has admin role
   * @returns {Promise<boolean>} True if admin
   */
  async hasAdminRole() {
    try {
      if (this.isUsingTempAuth) {
        return true; // Temporary credentials are always admin
      }

      const { useAuth0 } = await this.getAuth0Hook();
      const { user } = useAuth0();
      return user && user['https://sangbadbangla.com/roles'] && 
             user['https://sangbadbangla.com/roles'].includes('admin');
    } catch (error) {
      return false;
    }
  }

  /**
   * Get user information
   * @returns {Promise<Object>} User object
   */
  async getUser() {
    try {
      if (this.isUsingTempAuth) {
        return {
          sub: 'temp-admin',
          email: 'admin@sangbadbangla.com',
          name: 'Temporary Admin',
          roles: ['admin'],
          authMethod: 'temporary'
        };
      }

      const { useAuth0 } = await this.getAuth0Hook();
      const { user } = useAuth0();
      return user;
    } catch (error) {
      return null;
    }
  }

  /**
   * Switch to temporary authentication
   * @param {string} username - Username to validate
   * @param {string} password - Password to validate
   * @returns {boolean} True if credentials are valid
   */
  useTemporaryAuth(username, password) {
    if (username === this.tempCredentials.username && password === this.tempCredentials.password) {
      this.isUsingTempAuth = true;
      return true;
    }
    return false;
  }

  /**
   * Switch back to Auth0 authentication
   */
  useAuth0() {
    this.isUsingTempAuth = false;
  }
}

// Create singleton instance
const authService = new AuthService();

export default authService;
