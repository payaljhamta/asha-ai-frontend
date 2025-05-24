"use client";

import Header from "@/components/customs/header";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";
import { useDropzone } from "react-dropzone";
import { Upload, Heart, Star, Sparkles, Users, FileText, ThumbsUp, ThumbsDown, MessageSquarePlus, Menu, Settings, Save } from "lucide-react";

const ChatMessage = ({ message, onFeedback, userProfile }) => {
  const isBot = message.sender === "bot";

  return !isBot ? (
    <div className="flex flex-row justify-end items-end gap-3 w-full mb-6">
      <div className="p-3 rounded-2xl text-sm max-w-[75%] bg-gradient-to-r from-rose-50 to-violet-50 border border-rose-200 shadow-sm">
        <div className="break-words">{message.text}</div>
      </div>
      <Avatar className="w-8 h-8 border-2 border-rose-200 flex-shrink-0">
        <AvatarFallback className="bg-gradient-to-r from-rose-400 to-violet-400 text-white text-xs">
          {userProfile?.name?.[0]?.toUpperCase() || 'U'}
        </AvatarFallback>
      </Avatar>
    </div>
  ) : (
    <div className="flex flex-col gap-3 w-full mb-6">
      <div className="flex flex-row justify-start items-end gap-3 w-full">
        <Avatar className="w-8 h-8 border-2 border-violet-300 flex-shrink-0">
          <AvatarFallback className="bg-gradient-to-r from-violet-400 to-rose-400 text-white">
            <Sparkles className="size-3" />
          </AvatarFallback>
        </Avatar>
        <div className="p-3 rounded-2xl text-sm max-w-[80%] bg-gradient-to-r from-violet-50 to-rose-50 border border-violet-200 shadow-sm">
          <div className="break-words">
            <Markdown
              components={{
                a: ({ children, href, ...props }) => (
                  <Button
                    variant={href?.includes('#apply') || href?.includes('#register') ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "mx-1 my-1 h-7 text-xs",
                      href?.includes('#apply') || href?.includes('#register') 
                        ? "bg-gradient-to-r from-rose-400 to-violet-400 hover:from-rose-500 hover:to-violet-500 text-white" 
                        : "border-rose-300 text-rose-700 hover:bg-rose-50"
                    )}
                    onClick={() => window.open(href, '_blank')}
                    {...props}
                  >
                    {children}
                  </Button>
                ),
              }}
            >
              {message.text}
            </Markdown>
          </div>
        </div>
      </div>
      {/* AI-Powered Feedback Mechanisms - Always Visible */}
      <div className="flex items-center gap-1 ml-10 mt-0 p-0">
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-green-600 hover:bg-green-100 hover:border-green-200 border border-transparent px-3 transition-all duration-200"
          onClick={() => onFeedback?.(message.id, 'positive')}
        >
          <ThumbsUp className="size-3 mr-1" />
          Yes, helpful
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-orange-600 hover:bg-orange-100 hover:border-orange-200 border border-transparent px-3 transition-all duration-200"
          onClick={() => onFeedback?.(message.id, 'negative')}
        >
          <ThumbsDown className="size-3 mr-1" />
          Could be better
        </Button>
        
      </div>
    </div>
  );
};


const UserProfileDialog = ({ isOpen, onClose, userProfile, onSave }) => {
  const [profile, setProfile] = useState(userProfile || {});
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [errorModal, setErrorModal] = useState({ show: false, title: '', message: '' });
  const [successModal, setSuccessModal] = useState({ show: false, title: '', message: '' });


  const handleSave = async () => {
    // Validate password if provided
    if (profile.email && password) {
      if (password !== confirmPassword) {
        setErrorModal({
          show: true,
          title: 'Password Mismatch',
          message: 'Passwords do not match! Please make sure both password fields are identical.'
        });
        return;
      }
      if (password.length < 6) {
        setErrorModal({
          show: true,
          title: 'Password Too Short',
          message: 'Password must be at least 6 characters long for security.'
        });
        return;
      }
    }
    
    if (profile.email && password) {
      profile.password = password;
    }
    
    onSave(profile);
    setIsLoggedIn(true);
    onClose();
  };

  const handleLogin = async () => {
    try {
      if (!loginEmail.trim() || !loginPassword.trim()) {
        setErrorModal({
          show: true,
          title: 'Missing Information',
          message: 'Please enter both email and password to continue.'
        });
        return;
      }

      const response = await axios.post('/api/user-login', {
        email: loginEmail,
        password: loginPassword
      });
      
      if (response.data.success) {
        onSave(response.data.profile, true); // Pass true to indicate login
        setIsLoggedIn(true);
        onClose();
      } else {
        setErrorModal({
          show: true,
          title: 'Login Failed',
          message: 'Invalid email or password. Please check your credentials and try again.'
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        setErrorModal({
          show: true,
          title: 'Invalid Credentials',
          message: 'The email or password you entered is incorrect. Please try again.'
        });
      } else if (error.response?.status === 404) {
        setErrorModal({
          show: true,
          title: 'Account Not Found',
          message: 'No account found with this email address. Please check your email or create a new account.'
        });
      } else {
        setErrorModal({
          show: true,
          title: 'Login Error',
          message: 'Unable to connect to the server. Please check your internet connection and try again.'
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-violet-700">
            {isLoginMode ? 'Login to Your Account' : userProfile ? 'Your Profile' : 'Create Your Profile'}
          </DialogTitle>
          <DialogDescription>
            {isLoginMode 
              ? 'Enter your email to access your saved profile and chat history'
              : userProfile 
                ? 'Manage your profile and session settings'
                : 'Share your details to get personalized recommendations (optional)'
            }
          </DialogDescription>
        </DialogHeader>
        
        {isLoginMode ? (
          // Login Mode
          <div className="space-y-4">
            <div>
              <Label htmlFor="loginEmail">Email Address</Label>
              <Input
                id="loginEmail"
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
            </div>
            <div>
              <Label htmlFor="loginPassword">Password</Label>
              <div className="relative">
                <Input
                  id="loginPassword"
                  type={showPassword ? "text" : "password"}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </Button>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsLoginMode(false)}
                className="flex-1"
              >
                Back to Profile
              </Button>
              <Button 
                onClick={handleLogin}
                disabled={!loginEmail.trim() || !loginPassword.trim()}
                className="bg-gradient-to-r from-rose-400 to-violet-400 flex-1"
              >
                Login
              </Button>
            </div>
          </div>
        ) : (
          // Profile Mode
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={profile.name || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              
              {profile.email && !userProfile && !isLoggedIn && (
                <>
                  <div>
                    <Label htmlFor="password">Password (required for email accounts)</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e?.value)}
                        placeholder="Create a secure password"
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "👁️" : "👁️‍🗨️"}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Minimum 6 characters
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                    />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="skills">Skills</Label>
                <Input
                  id="skills"
                  value={profile.skills || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, skills: e.target.value }))}
                  placeholder="React, Python, Project Management..."
                />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <select
                  id="gender"
                  value={profile.gender || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, gender: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="woman">Woman</option>
                </select>
                <p className="text-xs text-violet-600 mt-1">
                  This platform is designed specifically for women's career empowerment
                </p>
              </div>
              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <select
                  id="experience"
                  value={profile.experience || ''}
                  onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select experience level</option>
                  <option value="entry">Entry Level (0-2 years)</option>
                  <option value="mid">Mid Level (3-5 years)</option>
                  <option value="senior">Senior Level (6+ years)</option>
                  <option value="executive">Executive/Leadership</option>
                </select>
              </div>
            </div>
            
           <DialogFooter className="flex-col gap-2">
              {userProfile && (
                <div className="w-full flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsLoginMode(true)}
                    className="flex-1"
                  >
                    Switch Account
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      localStorage.removeItem('asha_user_profile');
                      window.location.reload();
                    }}
                    className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Exit Session
                  </Button>
                </div>
              )}

              <div className="w-full flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  {userProfile ? 'Cancel' : 'Skip'}
                </Button>
                <Button 
                  onClick={handleSave} 
                  disabled={emailCheckLoading}
                  className="bg-gradient-to-r from-rose-400 to-violet-400 flex-1"
                >
                  {emailCheckLoading ? 'Checking...' : userProfile ? 'Update Profile' : 'Save Profile'}
                </Button>
              </div>

              {!userProfile && (
                <div className="w-full mt-2">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsLoginMode(true)}
                    className="w-full text-violet-600"
                  >
                    Already have an account? Login
                  </Button>
                </div>
              )}
            </DialogFooter>

          </>
        )}
        
        {/* Email Exists Modal */}
        <Dialog open={showEmailExistsModal} onOpenChange={setShowEmailExistsModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-violet-700">Account Already Exists</DialogTitle>
              <DialogDescription>
                An account with this email already exists. Would you like to login instead?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowEmailExistsModal(false)}
                className="flex-1"
              >
                Use Different Email
              </Button>
              <Button 
                onClick={() => {
                  setShowEmailExistsModal(false);
                  setLoginEmail(profile.email);
                  setIsLoginMode(true);
                }}
                className="bg-gradient-to-r from-rose-400 to-violet-400 flex-1"
              >
                Login Instead
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Error Modal */}
        <Dialog open={errorModal.show} onOpenChange={() => setErrorModal({ show: false, title: '', message: '' })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-red-700">{errorModal.title}</DialogTitle>
              <DialogDescription className="text-gray-600">
                {errorModal.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                onClick={() => setErrorModal({ show: false, title: '', message: '' })}
                className="bg-red-500 hover:bg-red-600"
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={successModal.show} onOpenChange={() => setSuccessModal({ show: false, title: '', message: '' })}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-green-700">{successModal.title}</DialogTitle>
              <DialogDescription className="text-gray-600">
                {successModal.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                onClick={() => setSuccessModal({ show: false, title: '', message: '' })}
                className="bg-green-500 hover:bg-green-600"
              >
                OK
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};


export default function HomeClient() {
  const [sessionId] = useState(uuidv4());
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followupQuestions, setFollowupQuestions] = useState([]);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [showChatOptions, setShowChatOptions] = useState(false);
  const [notificationModal, setNotificationModal] = useState({ show: false, title: '', message: '', type: 'success' });

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Focus input utility function
  const focusInput = useCallback(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, []);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendSkillBasedJobRecommendations = useCallback(async (profile) => {
    if (!profile.skills) return;

    setIsLoading(true);

    try {
      const welcomeMessage = `Welcome back, ${profile.name}! Based on your skills (${profile.skills}), let me find some relevant job opportunities for you.`;
      
      // Add personalized welcome message
      const welcomeBotMessage = {
        id: uuidv4(),
        text: welcomeMessage,
        sender: "bot",
      };
      setMessages((prev) => [...prev, welcomeBotMessage]);

      // Prepare request for skill-based job search
      const requestData = {
        question: `Find job opportunities that match my skills: ${profile.skills}. Experience level: ${profile.experience || 'not specified'}. Please show relevant positions.`,
        session_id: sessionId,
        current_date_time: new Date().toISOString(),
        user_profile: profile,
      };

      // Call API for job recommendations
      const response = await axios.post("/api/chat", requestData);

      // Add job recommendations to chat
      const jobMessage = {
        id: uuidv4(),
        text: response.data?.data.message,
        sender: "bot",
      };
      setMessages((prev) => [...prev, jobMessage]);

      // Set follow-up questions if available
      if (response.data?.data?.related_questions) {
        setFollowupQuestions(response.data?.data.related_questions);
      }
    } catch (error) {
      console.error("Error getting job recommendations:", error);
      const errorMessage = {
        id: uuidv4(),
        text: `Welcome back, ${profile.name}! I'm having trouble accessing job recommendations right now, but I'm here to help with your career journey.`,
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Load user profile from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem('asha_user_profile');
    if (savedProfile) {
      const profile = JSON.parse(savedProfile);
      setUserProfile(profile);
      
      // Show skill-based job recommendations for returning users
      if (profile.skills && messages.length === 0) {
        setTimeout(() => {
          sendSkillBasedJobRecommendations(profile);
        }, 1000);
      }
    }
  }, [sendSkillBasedJobRecommendations]);

  // Close chat options when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showChatOptions && !event.target.closest('.chat-options-container')) {
        setShowChatOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showChatOptions]);

  // Auto-save chat for authenticated users
  useEffect(() => {
    if (userProfile?.email && messages.length > 0) {
      try {
        localStorage.setItem(`chat_${sessionId}`, JSON.stringify(messages));
      } catch (error) {
        console.error('Error auto-saving chat:', error);
      }
    }
  }, [messages, userProfile, sessionId]);

  // Initial focus on component mount
  useEffect(() => {
    focusInput();
  }, [focusInput]);

  const handleFeedback = useCallback(async (messageId, feedbackType) => {
    try {
      // Find the message being feedback on
      const feedbackMessage = messages.find(msg => msg.id === messageId);
      const conversationContext = messages.slice(-5).map(msg => `${msg.sender}: ${msg.text}`).join('\n');
      
      // Send feedback to analytics endpoint
      await axios.post("/api/feedback", {
        message_id: messageId,
        feedback_type: feedbackType,
        session_id: sessionId,
        message_text: feedbackMessage?.text,
        conversation_context: conversationContext,
      });

      
      // Show dynamic AI-generated feedback response
      setIsLoading(true);
      
      const feedbackMessages = {
        'positive': "Thank you for the positive feedback!",
        'negative': "I didn't find your answer helpful.",
        'report': "I want to report an issue with your suggestion."
      };
      
      // Send feedback to AI for processing and dynamic response
      const feedbackResponse = await axios.post("/api/chat", {
        message: feedbackMessages[feedbackType],
        session_id: sessionId,
        feedback_context: {
          original_message: feedbackMessage?.text,
          feedback_type: feedbackType,
          conversation_context: conversationContext
        }
      });
      
      // Add AI's dynamic feedback response to chat
      const aiResponseMessage = {
        id: uuidv4(),
        text: feedbackResponse.data?.data?.message || "Thank you for your feedback! I'll use this to improve future responses.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, aiResponseMessage]);
      
    } catch (error) {
      console.error('Error sending feedback:', error);
      
      // Fallback static response if AI feedback fails
      const fallbackMessages = {
        'positive': "Thank you for your positive feedback! 😊",
        'negative': "Thank you for the feedback! I'll work to improve my responses.",
        'report': "Thank you for reporting this. We'll review the response and work to improve."
      };
      
      const fallbackMessage = {
        id: uuidv4(),
        text: fallbackMessages[feedbackType],
        sender: "bot",
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, messages]);

  const sendMessage = useCallback(async (messageText = input) => {
    if (!messageText.trim()) return;

    // Add user message to chat
    const userMessage = { 
      id: uuidv4(),
      text: messageText, 
      sender: "user" 
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare request data with user profile context
      const requestData = {
        question: messageText,
        session_id: sessionId,

        current_date_time: new Date().toISOString(),
        user_profile: userProfile,
      };

      // Call API
      const response = await axios.post("/api/chat", requestData);


      // Add bot response to chat
      const botMessage = {
        id: uuidv4(),
        text: response.data?.data.message,
        sender: "bot",
      };
      setMessages((prev) => [...prev, botMessage]);

      // Set follow-up questions if available
      if (response.data?.data?.related_questions) {
        setFollowupQuestions(response.data?.data.related_questions);
      } else {
        setFollowupQuestions([]);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Add error message
      const errorMessage = {
        id: uuidv4(),
        text: "I apologize, but I'm experiencing technical difficulties. Please try again in a moment, or contact our support team if the issue persists.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setFollowupQuestions([]);
    } finally {
      setIsLoading(false);
      focusInput(); // Restore focus to input after message send
    }
  }, [input, sessionId, userProfile, focusInput]);

  const selectFollowupQuestion = useCallback(
    (question) => {
      setInput(question);
      // Auto-send the selected question
      setTimeout(() => {
        sendMessage(question);
      }, 100);
    },
    [sendMessage]
  );

 
  const handleProfileSave = useCallback(async (profile, isLogin = false) => {
    try {
      const isNewProfile = !userProfile; // Check if this is a new profile
      
      if (profile && Object.keys(profile).length > 0) {
        setUserProfile(profile);
        localStorage.setItem('asha_user_profile', JSON.stringify(profile));
        
        // If user provided email, save to backend for session management (only for new profiles)
        if (profile.email && !isLogin) {
          const response = await axios.post("/api/create-profile", {
            ...profile,
            session_id: sessionId,
          });
          
          if (response.data.success) {
            console.log('Profile saved successfully');
            
            // Auto-save chat history for authenticated users
            if (messages.length > 0) {
              try {
                localStorage.setItem(`chat_${sessionId}`, JSON.stringify(messages));
                console.log('Chat history auto-saved');
              } catch (chatSaveError) {
                console.error('Error auto-saving chat:', chatSaveError);
              }
            }
          }
        }
        
        // Show skill-based job recommendations for new profiles or login with skills
        if ((isNewProfile || isLogin) && profile.skills && messages.length === 0) {
          setTimeout(() => {
            sendSkillBasedJobRecommendations(profile);
          }, 1500);
        }
      }

    } catch (error) {
      console.error('Error saving profile:', error);
      // Still keep the profile locally even if backend save fails
    }
  }, [sessionId, messages, userProfile, sendSkillBasedJobRecommendations]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage();
    }
  };

  return (
    <main className="flex flex-col h-screen bg-gradient-to-br from-violet-50/30 via-rose-50/30 to-white">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-6 overflow-hidden flex flex-col">
        <div className="flex flex-col h-full bg-white/90 backdrop-blur rounded-lg shadow-lg border border-violet-100 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <div className="bg-gradient-to-r from-violet-100/50 to-rose-100/50 p-8 rounded-full mb-6">
                  <Avatar className="size-20 border-4 border-white shadow-lg">
                    <AvatarFallback className="bg-gradient-to-r from-violet-400 to-rose-400 text-white text-2xl">
                      <Sparkles className="size-10" />
                    </AvatarFallback>
                  </Avatar>
                </div>
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-rose-600 to-violet-600 bg-clip-text text-transparent">
                  {userProfile?.name ? `Welcome back, ${userProfile.name}!` : 'Welcome to Asha!'}
                </h2>
                <p className="max-w-md mb-6 text-gray-600">
                  {userProfile?.name 
                    ? `Great to see you again! I'm here to continue supporting your career journey.`
                    : `I'm here to help you discover opportunities, connect with mentors, and advance your professional journey.`
                  }
                </p>
                
                {/* Action buttons */}
                <div className="flex gap-4 mb-6">
                  <Button
                    onClick={() => setShowProfileDialog(true)}
                    className="bg-gradient-to-r from-rose-400 to-violet-400 hover:from-rose-500 hover:to-violet-500"
                  >
                    <Users className="mr-2 size-4" />
                    Set Up Profile
                  </Button>
               
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl">
                  <SuggestionButton
                    text="Resume Tips & Best Practices"
                    icon={<Star className="size-4" />}
                    onClick={() => selectFollowupQuestion("Resume Tips & Best Practices")}
                  />
                  <SuggestionButton
                    text="Discover career events"
                    icon={<Users className="size-4" />}
                    onClick={() => selectFollowupQuestion("What career events are happening this month?")}
                  />
                  <SuggestionButton
                    text="Find a mentor"
                    icon={<Heart className="size-4" />}
                    onClick={() => selectFollowupQuestion("Help me find mentorship opportunities in my field")}
                  />
                  <SuggestionButton
                    text="Leadership resources"
                    icon={<Sparkles className="size-4" />}
                    onClick={() => selectFollowupQuestion("Show me resources for women in leadership")}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col p-6 w-full h-full overflow-y-auto space-y-2">
                {messages.map((message, index) => (
                  <ChatMessage 
                    key={message.id || index} 
                    message={message} 
                    onFeedback={handleFeedback}
                    userProfile={userProfile}
                  />
                ))}
                {isLoading && (
                  <div className="flex flex-row justify-start items-end gap-3 w-full mb-6">
                    <Avatar className="w-8 h-8 border-2 border-violet-300 flex-shrink-0">
                      <AvatarFallback className="bg-gradient-to-r from-violet-400 to-rose-400 text-white">
                        <Sparkles className="size-3" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="p-3 rounded-2xl bg-gradient-to-r from-violet-50 to-rose-50 border border-violet-200 shadow-sm">
                      <div className="flex flex-row gap-1">
                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-rose-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                )}
                {!isLoading && followupQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 ml-11 mb-4">
                    {followupQuestions.map((question, index) => (
                      <SuggestionButton
                        key={index}
                        text={question}
                        onClick={() => selectFollowupQuestion(question)}
                        variant="outline"
                        size="sm"
                      />
                    ))}
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-violet-100 p-4 bg-white/95 backdrop-blur sticky bottom-0"
          >
            <div className="flex gap-3 items-center">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me about jobs, events, mentorship..."
                  disabled={isLoading}
                  className="border-violet-200 focus:border-violet-400 pr-20 h-11 rounded-xl"
                />
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
              

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowChatOptions(!showChatOptions)}
                    className="text-violet-600 hover:bg-violet-50 p-1 h-8 w-8 rounded-lg"
                    title="Chat Options"
                  >
                    <Menu className="size-4" />
                  </Button>
                </div>
              </div>
              <Button
                disabled={!input.trim() || isLoading}
                type="submit"
                className="bg-gradient-to-r from-rose-400 to-violet-400 hover:from-rose-500 hover:to-violet-500 h-11 w-11 rounded-xl"
                size="icon"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.2"
                  stroke="currentColor"
                  className="size-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                  />
                </svg>
              </Button>
            </div>
            
            {/* Chat Options Dropdown */}
            {showChatOptions && (
              <div className="chat-options-container absolute bottom-20 right-4 bg-white rounded-xl shadow-xl border border-violet-200 p-3 min-w-52 z-50">
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowProfileDialog(true);
                      setShowChatOptions(false);
                    }}
                    className="w-full justify-start text-violet-700 hover:bg-violet-50"
                  >
                    <Settings className="mr-2 size-4" />
                    Profile Settings
                  </Button>
                 
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      
      
      <UserProfileDialog
        isOpen={showProfileDialog}
        onClose={() => {
          setShowProfileDialog(false);
          focusInput();
        }}
        userProfile={userProfile}
        onSave={handleProfileSave}
      />

      {/* Notification Modal */}
      <Dialog open={notificationModal.show} onOpenChange={() => setNotificationModal({ show: false, title: '', message: '', type: 'success' })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className={notificationModal.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {notificationModal.title}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {notificationModal.message}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              onClick={() => setNotificationModal({ show: false, title: '', message: '', type: 'success' })}
              className={notificationModal.type === 'success' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}

const SuggestionButton = ({ text, onClick, icon, variant = "ghost", size = "default" }) => (
  <Button 
    variant={variant} 
    onClick={onClick} 
    size={size}
    className={cn(
      "text-violet-600 border-violet-200 hover:bg-violet-50 rounded-lg h-8 text-xs px-3",
      variant === "outline" && "border border-violet-300"
    )}
  >
    {icon && <span className="mr-2">{icon}</span>}
    {text}
  </Button>
);