import { generateToken, verifyToken, type JWTPayload } from '../../lib/jwt';
import jwt from 'jsonwebtoken';

describe('JWT Library', () => {
  const testPayload: JWTPayload = {
    userId: '1',
    email: 'test@test.com',
    role: 'admin',
  };

  describe('Token Generation', () => {
    it('should generate a valid JWT token', () => {
      const token = generateToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate different tokens for different users', () => {
      const token1 = generateToken(testPayload);
      const token2 = generateToken({ ...testPayload, userId: '2' });
      expect(token1).not.toBe(token2);
    });

    it('should include correct payload data', () => {
      const token = generateToken(testPayload);
      const decoded = jwt.decode(token) as any;
      
      expect(decoded.userId).toBe(testPayload.userId);
      expect(decoded.email).toBe(testPayload.email);
      expect(decoded.role).toBe(testPayload.role);
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
    });

    it('should work with editor role', () => {
      const editorPayload: JWTPayload = {
        userId: '2',
        email: 'editor@test.com',
        role: 'editor',
      };
      const token = generateToken(editorPayload);
      const decoded = verifyToken(token);
      
      expect(decoded?.role).toBe('editor');
    });
  });

  describe('Token Verification', () => {
    it('should verify a valid token', () => {
      const token = generateToken(testPayload);
      const decoded = verifyToken(token);
      
      expect(decoded).toBeDefined();
      expect(decoded?.userId).toBe(testPayload.userId);
      expect(decoded?.email).toBe(testPayload.email);
      expect(decoded?.role).toBe(testPayload.role);
    });

    it('should return null for invalid token format', () => {
      const decoded = verifyToken('invalid-token');
      expect(decoded).toBeNull();
    });

    it('should return null for empty token', () => {
      const decoded = verifyToken('');
      expect(decoded).toBeNull();
    });

    it('should return null for malformed JWT', () => {
      const decoded = verifyToken('header.payload');
      expect(decoded).toBeNull();
    });

    it('should return null for token with wrong signature', () => {
      const wrongToken = jwt.sign(testPayload, 'wrong-secret', { expiresIn: '1h' });
      const decoded = verifyToken(wrongToken);
      expect(decoded).toBeNull();
    });

    it('should return null for expired token', () => {
      const expiredToken = jwt.sign(testPayload, process.env.JWT_SECRET || 'your-secret-key-change-in-production', { 
        expiresIn: '-1s' // Already expired
      });
      const decoded = verifyToken(expiredToken);
      expect(decoded).toBeNull();
    });
  });
});
