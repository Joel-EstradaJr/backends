import { NextRequest } from 'next/server';

declare global {
  var process: {
    env: {
      DATABASE_URL?: string;
      JWT_SECRET?: string;
      NODE_ENV?: string;
    };
  };
}
