import React from 'react';
import { useLocation, Link } from 'wouter';
import { Home, User, PlusCircle, Search, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export default function Navigation() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  if (!user) return null;
  
  const handleLogout = () => {
    logoutMutation.mutate();
  };
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Search, label: 'Search', path: '/search' },
    { icon: PlusCircle, label: 'Add', path: '/create' },
    { icon: User, label: 'Profile', path: `/profile/${user.id}` },
  ];
  
  return (
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
                className={`flex flex-col items-center p-2 ${isActive ? 'text-[#FF5E3A]' : 'text-gray-500'}`}
              >
                <item.icon size={24} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
          
          <button 
            onClick={handleLogout}
            className="flex flex-col items-center p-2 text-gray-500"
          >
            <LogOut size={24} />
            <span className="text-xs mt-1">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
