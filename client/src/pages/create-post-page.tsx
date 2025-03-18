import React from 'react';
import { CreatePostForm } from '@/components/create-post-form';
import Navigation from '@/components/navigation';

export default function CreatePostPage() {
  return (
    <div className="flex flex-col min-h-screen pb-16">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-[#FF5E3A]">Log a Zyn</h1>
        </div>
      </header>
      
      <main className="flex-1 container mx-auto px-4 py-4">
        <CreatePostForm />
      </main>
      
      <Navigation />
    </div>
  );
}
