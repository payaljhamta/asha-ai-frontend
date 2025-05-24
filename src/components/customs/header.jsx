import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CirclePlus } from 'lucide-react';

const Header = () => {
  const [currentAvatarIndex, setCurrentAvatarIndex] = useState(0);
  
  const avatarOptions = [
    '👩‍💼', // Woman office worker
    '👩‍💻', // Woman technologist
    '👩‍🎓', // Woman student/graduate
    '👩‍⚕️', // Woman health worker
    '👩‍🏫', // Woman teacher
    '👩‍⚖️', // Woman judge
    '👩‍🔬', // Woman scientist
    '👩‍🎨', // Woman artist
  ];

  const handIcons = ['👋', '🤝', '💪', '👍', '✋'];

  const cycleAvatar = () => {
    setCurrentAvatarIndex((prev) => (prev + 1) % avatarOptions.length);
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center gap-3">
        <div className="flex flex-row justify-start items-center w-full gap-2">
          <div className="flex items-center gap-2">
            <Avatar 
              className="border-2 border-white/30 cursor-pointer hover:scale-105 transition-transform"
              onClick={cycleAvatar}
            >
              <AvatarFallback className="bg-white/20 text-white text-xl backdrop-blur">
                {avatarOptions[currentAvatarIndex]}
              </AvatarFallback>
            </Avatar>
            
            {/* Additional smaller avatars showing variety */}
            <div className="hidden sm:flex gap-1">
              {avatarOptions.slice(0, 3).map((avatar, index) => (
                <div 
                  key={index}
                  className="w-6 h-6 rounded-full bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-xs cursor-pointer hover:bg-white/20 transition-colors"
                  onClick={() => setCurrentAvatarIndex(index)}
                >
                  {avatar}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Asha - AI Career Assistant 🚀</h1>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-white/90 text-sm">Empowering careers through intelligent guidance</p>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-4 items-center">
          
          
          <Button variant="secondary" onClick={() => window.location.reload()}>
            <CirclePlus className="h-4 w-4 me-1" />
            New Chat
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;