import * as React from 'react';
import { useState } from 'react';
import { useLocation, Redirect } from 'wouter';
import { Form, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Target, User, Lock, FileText, CheckSquare } from 'lucide-react';

// Military-style check icon
const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row overflow-hidden rounded-ios shadow-card">
        <div className="w-full lg:w-1/2 bg-white p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-2">
              <Target className="h-8 w-8 text-accent mr-2" />
              <h1 className="app-logo text-3xl">ZYNFANTRY</h1>
            </div>
            <p className="text-muted">Front-line Pouchers</p>
          </div>
          
          {isLogin ? (
            <>
              <Card className="border-0 shadow-none">
                <CardHeader className="p-0 space-y-1">
                  <CardTitle className="font-heading text-2xl tracking-wide">LOGIN TO YOUR ACCOUNT</CardTitle>
                </CardHeader>
                <CardContent className="p-0 pt-4">
                  <Form onSubmit={handleLogin} defaultValues={{ username: '', password: '' }}>
                    {(methods) => (
                      <>
                        <FormField
                          name="username"
                          label="USERNAME"
                          methods={methods}
                          rules={{ required: 'Username is required' }}
                        >
                          <Input 
                            placeholder="Enter your username" 
                            fullWidth 
                            leftIcon={<User size={18} />}
                          />
                        </FormField>
                        
                        <FormField
                          name="password"
                          label="PASSWORD"
                          methods={methods}
                          rules={{ required: 'Password is required' }}
                        >
                          <Input 
                            type="password" 
                            placeholder="Enter your password" 
                            fullWidth 
                            leftIcon={<Lock size={18} />}
                          />
                        </FormField>
                        
                        <Button 
                          type="submit" 
                          className="mt-6" 
                          fullWidth
                          isLoading={loginMutation.isLoading}
                        >
                          ACCESS ZYNFANTRY
                        </Button>
                      </>
                    )}
                  </Form>
                </CardContent>
              </Card>
              
              <div className="mt-6 text-center">
                <p className="text-muted">
                  Need to enlist?{' '}
                  <button 
                    className="text-accent font-medium hover:underline" 
                    onClick={() => setIsLogin(false)}
                  >
                    SIGN UP
                  </button>
                </p>
              </div>
            </>
          ) : (
            <>
              <Card className="border-0 shadow-none">
                <CardHeader className="p-0 space-y-1">
                  <CardTitle className="font-heading text-2xl tracking-wide">ENLIST NOW</CardTitle>
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
                          label="USERNAME"
                          methods={methods}
                          rules={{ required: 'Username is required' }}
                        >
                          <Input 
                            placeholder="Choose a username" 
                            fullWidth 
                            leftIcon={<User size={18} />}
                          />
                        </FormField>
                        
                        <FormField
                          name="displayName"
                          label="DISPLAY NAME"
                          methods={methods}
                          rules={{ required: 'Display name is required' }}
                        >
                          <Input 
                            placeholder="Your full name" 
                            fullWidth 
                            leftIcon={<User size={18} />}
                          />
                        </FormField>
                        
                        <FormField
                          name="password"
                          label="PASSWORD"
                          methods={methods}
                          rules={{ 
                            required: 'Password is required',
                            minLength: { value: 6, message: 'Password must be at least 6 characters' }
                          }}
                        >
                          <Input 
                            type="password" 
                            placeholder="Create a password" 
                            fullWidth
                            leftIcon={<Lock size={18} />}
                          />
                        </FormField>
                        
                        <FormField
                          name="bio"
                          label="BIO (OPTIONAL)"
                          methods={methods}
                        >
                          <Input 
                            as="textarea"
                            placeholder="Tell us about yourself" 
                            fullWidth
                            leftIcon={<FileText size={18} />}
                          />
                        </FormField>
                        
                        <Button 
                          type="submit" 
                          variant="accent"
                          className="mt-6" 
                          fullWidth
                          isLoading={registerMutation.isLoading}
                        >
                          DEPLOY ACCOUNT
                        </Button>
                      </>
                    )}
                  </Form>
                </CardContent>
              </Card>
              
              <div className="mt-6 text-center">
                <p className="text-muted">
                  Already enlisted?{' '}
                  <button 
                    className="text-accent font-medium hover:underline" 
                    onClick={() => setIsLogin(true)}
                  >
                    LOGIN
                  </button>
                </p>
              </div>
            </>
          )}
        </div>
        
        <div className="hidden lg:block w-1/2 bg-primary p-12 text-white">
          <div className="h-full flex flex-col justify-center">
            <div className="flex items-center mb-4">
              <Target className="h-10 w-10 mr-2 text-accent" strokeWidth={1.5} />
              <h2 className="text-4xl font-heading font-bold tracking-wide">ZYNFANTRY</h2>
            </div>
            <p className="text-lg mb-8 text-white/80 font-heading">FRONT-LINE POUCHERS</p>
            
            <ul className="space-y-6">
              <li className="flex items-start">
                <div className="bg-accent/20 p-1.5 rounded-full mr-3 mt-0.5">
                  <CheckIcon />
                </div>
                <span className="text-white/90">Track and log your tactical Zyn deployments</span>
              </li>
              <li className="flex items-start">
                <div className="bg-accent/20 p-1.5 rounded-full mr-3 mt-0.5">
                  <CheckIcon />
                </div>
                <span className="text-white/90">Join forces with other pouchers in your unit</span>
              </li>
              <li className="flex items-start">
                <div className="bg-accent/20 p-1.5 rounded-full mr-3 mt-0.5">
                  <CheckIcon />
                </div>
                <span className="text-white/90">Analyze strategic consumption patterns</span>
              </li>
              <li className="flex items-start">
                <div className="bg-accent/20 p-1.5 rounded-full mr-3 mt-0.5">
                  <CheckIcon />
                </div>
                <span className="text-white/90">Send signals and react to your squad's activities</span>
              </li>
            </ul>
            
            <div className="mt-10 pt-6 border-t border-white/10">
              <p className="text-white/70 text-sm italic">"Join the elite pouch forces today and track your missions with precision."</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
