import React from 'react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-[#FF5E3A] mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-gray-600 mb-6">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link href="/">
          <Button size="lg">
            Return to Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
