import * as React from 'react';
import { useLocation, Link } from 'wouter';
import { 
  Shield, User, PlusCircle, Search, LogOut, Target, Award, Crosshair, 
  Radar, Map, Flag, Zap, BarChart2
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

// Military-inspired custom icons
const BaseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
    <path d="M12 2L2 9" strokeWidth="1.5"></path>
    <path d="M22 9L12 2" strokeWidth="1.5"></path>
  </svg>
);

const DeployIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" strokeWidth="1.5"></circle>
    <path d="M12 8v8" strokeWidth="2"></path>
    <path d="M8 12h8" strokeWidth="2"></path>
    <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.3"></circle>
  </svg>
);

const IntelIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="8" strokeWidth="1.5"></circle>
    <line x1="12" y1="16" x2="12" y2="16" strokeWidth="3" strokeLinecap="round"></line>
    <line x1="12" y1="8" x2="12" y2="12" strokeWidth="2" strokeLinecap="round"></line>
    <path d="M12 4V2" strokeWidth="1.5"></path>
    <path d="M4 12H2" strokeWidth="1.5"></path>
    <path d="M12 20v2" strokeWidth="1.5"></path>
    <path d="M20 12h2" strokeWidth="1.5"></path>
  </svg>
);

const CommanderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a5 5 0 0 1 5 5v2a5 5 0 0 1-10 0V7a5 5 0 0 1 5-5z" strokeWidth="1.5"></path>
    <path d="M20 21v-2a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v2"></path>
    <path d="M8 10h8" strokeWidth="1.5"></path>
    <path d="M9 7h6" strokeWidth="1.5"></path>
    <path d="M16 7c.33 0 .6.3.6.67v1.66c0 .37-.27.67-.6.67" strokeWidth="1.5"></path>
    <path d="M8 7c-.33 0-.6.3-.6.67v1.66c0 .37.27.67.6.67" strokeWidth="1.5"></path>
  </svg>
);

export default function Navigation() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  if (!user) return null;
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navItems = [
    { icon: BaseIcon, label: 'HQ', path: '/', tooltip: 'Return to Base Camp' },
    { icon: IntelIcon, label: 'Intel', path: '/search', tooltip: 'Reconnaissance Operations' },
    { icon: DeployIcon, label: 'Deploy', path: '/create', tooltip: 'Deploy Nicotine Reinforcements' },
    { icon: CommanderIcon, label: 'Command', path: `/profile/${user.id}`, tooltip: 'Command Center' },
  ];
  
  // Header component with app name and logo
  const Header = () => (
    <div className="fixed top-0 left-0 right-0 ios-header z-10">
      <div className="container mx-auto px-4 py-1 flex justify-between items-center">
        <div className="flex items-center">
          <div className="mr-2 relative">
            <div className="absolute -top-1 -left-1 w-3 h-3 bg-accent rounded-full animate-pulse"></div>
            <Target className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="app-logo text-xl">ZYNFANTRY</h1>
            <p className="text-xs text-muted">Front-line Pouchers</p>
          </div>
        </div>
        <div className="flex items-center">
          <div className="mr-3">
            <BarChart2 size={20} className="text-primary" />
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/5 text-primary hover:bg-primary/10"
            title="Extract from Mission"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
  
  return (
    <>
      <Header />
      <nav className="fixed bottom-0 left-0 right-0 tab-bar z-10">
        <div className="container mx-auto px-4">
          <div className="flex justify-around items-center py-2">
            {navItems.map(item => {
              const isActive = location === item.path || 
                (item.path.startsWith('/profile') && location.startsWith('/profile'));
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                  title={item.tooltip}
                >
                  <div className="relative">
                    {typeof item.icon === 'function' ? <item.icon /> : <item.icon size={22} />}
                    {isActive && (
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"></span>
                    )}
                  </div>
                  <span className="text-xs mt-1 font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </>
  );
}
