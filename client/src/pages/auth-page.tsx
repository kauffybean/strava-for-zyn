import React, { useState, useEffect } from 'react';
import { useLocation, Redirect } from 'wouter';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { user, loginMutation, registerMutation } = useAuth();
  const [, setLocation] = useLocation();
  
  // If already logged in, redirect to home
  if (user) {
    return <Redirect to="/" />;
  }
  
  const handleLogin = (data: { username: string; password: string }) => {
    loginMutation.mutate(data);
  };
  
  const handleRegister = (data: {
    username: string;
    password: string;
    displayName: string;
    bio?: string;
  }) => {
    registerMutation.mutate(data);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row overflow-hidden rounded-xl shadow-xl">
        <div className="w-full lg:w-1/2 bg-white p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#FF5E3A]">Zynnie</h1>
            <p className="text-gray-600">Track and share your Zyn journey</p>
          </div>
          
          {isLogin ? (
            <>
              <Card className="border-0 shadow-none">
                <CardHeader className="p-0 space-y-1">
                  <CardTitle className="text-2xl">Login</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <Form onSubmit={handleLogin} defaultValues={{ username: '', password: '' }}>
                    {(methods) => (
                      <>
                        <FormField
                          name="username"
                          label="Username"
                          methods={methods}
                          rules={{ required: 'Username is required' }}
                        >
                          <Input placeholder="Enter your username" fullWidth />
                        </FormField>
                        
                        <FormField
                          name="password"
                          label="Password"
                          methods={methods}
                          rules={{ required: 'Password is required' }}
                        >
                          <Input type="password" placeholder="Enter your password" fullWidth />
                        </FormField>
                        
                        <Button 
                          type="submit" 
                          className="mt-6" 
                          fullWidth
                          isLoading={loginMutation.isLoading}
                        >
                          Login
                        </Button>
                      </>
                    )}
                  </Form>
                </CardContent>
              </Card>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button 
                    className="text-[#FF5E3A] font-medium hover:underline" 
                    onClick={() => setIsLogin(false)}
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <Card className="border-0 shadow-none">
                <CardHeader className="p-0 space-y-1">
                  <CardTitle className="text-2xl">Sign Up</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <Form 
                    onSubmit={handleRegister} 
                    defaultValues={{ username: '', password: '', displayName: '', bio: '' }}
                  >
                    {(methods) => (
                      <>
                        <FormField
                          name="username"
                          label="Username"
                          methods={methods}
                          rules={{ required: 'Username is required' }}
                        >
                          <Input placeholder="Choose a username" fullWidth />
                        </FormField>
                        
                        <FormField
                          name="displayName"
                          label="Display Name"
                          methods={methods}
                          rules={{ required: 'Display name is required' }}
                        >
                          <Input placeholder="Your full name" fullWidth />
                        </FormField>
                        
                        <FormField
                          name="password"
                          label="Password"
                          methods={methods}
                          rules={{ 
                            required: 'Password is required',
                            minLength: { value: 6, message: 'Password must be at least 6 characters' }
                          }}
                        >
                          <Input type="password" placeholder="Create a password" fullWidth />
                        </FormField>
                        
                        <FormField
                          name="bio"
                          label="Bio (optional)"
                          methods={methods}
                        >
                          <Input 
                            as="textarea"
                            placeholder="Tell us about yourself" 
                            fullWidth 
                          />
                        </FormField>
                        
                        <Button 
                          type="submit" 
                          className="mt-6" 
                          fullWidth
                          isLoading={registerMutation.isLoading}
                        >
                          Create Account
                        </Button>
                      </>
                    )}
                  </Form>
                </CardContent>
              </Card>
              
              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button 
                    className="text-[#FF5E3A] font-medium hover:underline" 
                    onClick={() => setIsLogin(true)}
                  >
                    Log in
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
        
        <div className="hidden lg:block w-1/2 bg-gradient-to-r from-[#FF5E3A] to-[#FF9500] p-12 text-white">
          <div className="h-full flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-6">Track Your Zyn Journey</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Track and share your Zyn consumption</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Connect with friends and see their activity</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>View detailed analytics about your habits</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 mr-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>React and comment on your friends' posts</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
