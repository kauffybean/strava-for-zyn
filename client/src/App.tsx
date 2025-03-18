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
  
  // Add iOS status bar padding
  React.useEffect(() => {
    // Set meta viewport tag for iOS optimization
    const meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no, maximum-scale=1';
    document.getElementsByTagName('head')[0].appendChild(meta);
    
    // Add iOS status bar color meta tag
    const statusBarMeta = document.createElement('meta');
    statusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
    statusBarMeta.content = 'black-translucent';
    document.getElementsByTagName('head')[0].appendChild(statusBarMeta);
    
    // Add iOS full screen meta tag
    const fullScreenMeta = document.createElement('meta');
    fullScreenMeta.name = 'apple-mobile-web-app-capable';
    fullScreenMeta.content = 'yes';
    document.getElementsByTagName('head')[0].appendChild(fullScreenMeta);
    
    // Set page title
    document.title = 'Zynfantry - Front-line Pouchers';
  }, []);
  
  return (
    <div className="min-h-screen bg-background font-sans text-primary safe-top safe-bottom">
      {/* Military-themed app structure */}
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
