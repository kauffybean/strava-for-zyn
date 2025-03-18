import React from 'react';
import { Route, Switch, Router } from 'wouter';
import { ProtectedRoute } from './lib/protected-route';
import { Toaster } from './components/ui/toaster';
import Navigation from './components/navigation';
import { useAuth } from './hooks/use-auth';

// Pages
import HomePage from './pages/home-page';
import AuthPage from './pages/auth-page';
import NotFound from './pages/not-found';
import ProfilePage from './pages/profile-page';
import CreatePostPage from './pages/create-post-page';

function App() {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-background font-sans text-primary">
      <Router>
        <Switch>
          <Route path="/auth" component={AuthPage} />
          <ProtectedRoute path="/" component={HomePage} />
          <ProtectedRoute path="/profile/:id" component={ProfilePage} />
          <ProtectedRoute path="/create" component={CreatePostPage} />
          <Route component={NotFound} />
        </Switch>
      </Router>
      {user && <Navigation />}
      <Toaster />
    </div>
  );
}

export default App;
