const jwt = require('jsonwebtoken');
const { createRemoteJWKSet, jwtVerify } = require('jose');

// Auth0 configuration
const AUTH0_DOMAIN = process.env.AUTH0_DOMAIN || 'your-domain.auth0.com';
const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE || 'https://sangbadbangla.vercel.app';

// Temporary admin credentials (for development/testing)
const TEMP_ADMIN_CREDENTIALS = {
  username: 'Sangbadbangla@20252025',
  password: 'SB@20252025'
};

// JWKS client for Auth0
const JWKS = createRemoteJWKSet(new URL(`https://${AUTH0_DOMAIN}/.well-known/jwks.json`));

/**
 * Middleware to verify authentication (temporary credentials or JWT)
 */
const verifyAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided'
      });
    }

    // Check if it's a Bearer token (JWT)
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      try {
        // Verify JWT with Auth0 JWKS
        const { payload } = await jwtVerify(token, JWKS, {
          issuer: `https://${AUTH0_DOMAIN}/`,
          audience: AUTH0_AUDIENCE
        });

        // Add user info to request
        req.user = {
          sub: payload.sub,
          email: payload.email,
          roles: payload['https://sangbadbangla.com/roles'] || [],
          permissions: payload['https://sangbadbangla.com/permissions'] || [],
          authMethod: 'jwt'
        };

        return next();
      } catch (jwtError) {
        console.log('JWT verification failed, trying temporary credentials...');
        // Continue to temporary credentials check
      }
    }

    // Check if it's Basic auth (temporary credentials)
    if (authHeader.startsWith('Basic ')) {
      const credentials = Buffer.from(authHeader.substring(6), 'base64').toString();
      const [username, password] = credentials.split(':');
      
      if (username === TEMP_ADMIN_CREDENTIALS.username && 
          password === TEMP_ADMIN_CREDENTIALS.password) {
        
        // Add temporary admin user info to request
        req.user = {
          sub: 'temp-admin',
          email: 'admin@sangbadbangla.com',
          roles: ['admin'],
          permissions: ['create:news', 'update:news', 'delete:news', 'read:news'],
          authMethod: 'temporary'
        };

        return next();
      }
    }

    // If neither method worked, return unauthorized
    return res.status(401).json({
      success: false,
      message: 'Invalid authentication credentials'
    });

  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

/**
 * Legacy JWT verification (kept for backward compatibility)
 */
const verifyJWT = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT with Auth0 JWKS
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://${AUTH0_DOMAIN}/`,
      audience: AUTH0_AUDIENCE
    });

    // Add user info to request
    req.user = {
      sub: payload.sub,
      email: payload.email,
      roles: payload['https://sangbadbangla.com/roles'] || [],
      permissions: payload['https://sangbadbangla.com/permissions'] || [],
      authMethod: 'jwt'
    };

    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Middleware to check if user has admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  const hasAdminRole = req.user.roles.includes('admin');
  
  if (!hasAdminRole) {
    return res.status(403).json({
      success: false,
      message: 'Admin role required'
    });
  }

  next();
};

/**
 * Middleware to check if user has specific permission
 */
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const hasPermission = req.user.permissions.includes(permission);
    
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Permission '${permission}' required`
      });
    }

    next();
  };
};

module.exports = {
  verifyAuth,
  verifyJWT,
  requireAdmin,
  requirePermission
};
