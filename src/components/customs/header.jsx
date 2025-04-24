import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CirclePlus } from "lucide-react";

const Header = () => {
  return (
    <header className="bg-primary text-white py-4 shadow-md w-full">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex flex-row justify-start items-center w-full gap-2">
          <Avatar>
            <AvatarFallback className="text-black ">A</AvatarFallback>
          </Avatar>
          <h1 className="text-xl font-bold">Asha</h1>
          <p className="hidden md:block text-sm opacity-75">
            AI Assistant for JobsForHer
          </p>
        </div>
        <div className="flex space-x-4">
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
