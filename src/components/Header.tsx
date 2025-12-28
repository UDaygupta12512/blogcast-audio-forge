import React from 'react';
import { Mic, LogOut, User, BarChart3, Home, Compass, PenTool } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar, AvatarFallback } from './ui/avatar';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <header className="border-b border-purple-500/20 backdrop-blur-sm sticky top-0 z-50 glass">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl shadow-lg shadow-purple-500/50">
              <Mic className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Free AI Podcast Generator
            </h1>
          </div>
          
          {user && (
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className={`gap-2 ${location.pathname === '/' ? 'bg-purple-500/20' : ''}`}
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/ai-tools')}
                className={`gap-2 ${location.pathname === '/ai-tools' ? 'bg-purple-500/20' : ''}`}
              >
                <PenTool className="h-4 w-4" />
                <span className="hidden sm:inline">AI Tools</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/discover')}
                className={`gap-2 ${location.pathname === '/discover' ? 'bg-purple-500/20' : ''}`}
              >
                <Compass className="h-4 w-4" />
                <span className="hidden sm:inline">Discover</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/analytics')}
                className={`gap-2 ${location.pathname === '/analytics' ? 'bg-purple-500/20' : ''}`}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </Button>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-purple-500/20">
                    <User className="h-4 w-4 text-purple-400" />
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {user.email}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
