import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

interface DecodedToken {
  employeeId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export async function authenticateRequest(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        error: 'Authorization token required',
        status: 401,
        user: null,
        token: null
      };
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return {
        error: 'JWT secret not configured',
        status: 500,
        user: null,
        token: null
      };
    }

    const decoded = jwt.verify(token, jwtSecret) as DecodedToken;
    
    return {
      error: null,
      status: 200,
      user: decoded,
      token
    };
    
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return {
        error: 'Token has expired',
        status: 401,
        user: null,
        token: null
      };
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        error: 'Invalid token',
        status: 401,
        user: null,
        token: null
      };
    }

    return {
      error: 'Authentication failed',
      status: 500,
      user: null,
      token: null
    };
  }
}
