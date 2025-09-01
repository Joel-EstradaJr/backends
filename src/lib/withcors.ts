import { NextRequest, NextResponse } from 'next/server';

type CorsHandler<T> = (request: NextRequest) => Promise<T>;

export function withCors<T>(handler: CorsHandler<T>) {
  return async (request: NextRequest): Promise<T> => {
    const response = await handler(request);
    
    // Add CORS headers if response is a NextResponse
    if (response instanceof NextResponse) {
      response.headers.set('Access-Control-Allow-Origin', '*');
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    
    return response;
  };
}
