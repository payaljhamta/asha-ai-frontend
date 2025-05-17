"use client";

import Header from "@/components/customs/header";
import { Button } from "@/components/ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { cn } from "@/lib/utils";
import Markdown from "react-markdown";

const ChatMessage = ({ message }) => {
  const isBot = message.sender === "bot";

  return !isBot ? (
    <div className={cn("flex flex-row justify-end items-end gap-3 w-full")}>
      <div
        className={cn("p-2 rounded-lg message text-sm", "send bg-neutral-100")}
      >
        {message.text}
      </div>
      <Avatar>
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>
  ) : (
    <div className={cn("flex flex-row justify-start items-end gap-3 w-full")}>
      <Avatar className="z-10">
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <div
        className={cn("p-2 rounded-lg message text-sm", "receive bg-blue-100")}
      >
        <Markdown>{message.text}</Markdown>
      </div>
    </div>
  );
};

function formatTodaysDate() {
  const now = new Date();
  const options = {
    month: 'long',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  return now.toLocaleString('en-US', options);
}

export default function HomeClient() {
  const [sessionId] = useState(uuidv4());
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [followupQuestions, setFollowupQuestions] = useState([]);

  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;

    // Add user message to chat
    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Call API
      const response = await axios.post("/api/chat", {
        question: input,
        session_id: sessionId,
        current_date_time: formatTodaysDate()
      });

      // Add bot response to chat
      const botMessage = {
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
        text: "Sorry, I encountered an error. Please try again later.",
        sender: "bot",
      };
      setMessages((prev) => [...prev, errorMessage]);
      setFollowupQuestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [input, sessionId]);

  const selectFollowupQuestion = useCallback(
    (question) => {
      setInput(question);
      // Optional: auto-send the selected question
      setTimeout(() => {
        sendMessage();
      }, 100);
    },
    [sendMessage]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage();
    }
  };

  return (
    <main className="flex flex-col h-screen bg-gray-50">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-6 overflow-hidden flex flex-col">
        <div className="flex flex-col h-full bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                <Avatar className="size-18">
                  <AvatarFallback>
                    <span className="text-4xl">👩‍💼</span>
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold mb-2">Welcome to Asha!</h2>
                <p className="max-w-md mb-4">
                  I'm here to help you with job opportunities, career events,
                  mentorship programs, and women empowerment resources.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-xl">
                  <SuggestionButton
                    text="Show me job opportunities"
                    onClick={() =>
                      selectFollowupQuestion("Show me job opportunities")
                    }
                  />
                  <SuggestionButton
                    text="Tell me about upcoming events"
                    onClick={() =>
                      selectFollowupQuestion("Tell me about upcoming events")
                    }
                  />
                  <SuggestionButton
                    text="How can I find a mentor?"
                    onClick={() =>
                      selectFollowupQuestion("How can I find a mentor?")
                    }
                  />
                  <SuggestionButton
                    text="Women in leadership resources"
                    onClick={() =>
                      selectFollowupQuestion("Women in leadership resources")
                    }
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2 p-4 w-full h-full overflow-y-auto overflow-x-hidden">
                {messages.map((message, index) => (
                  <ChatMessage key={index} message={message} />
                ))}
                {isLoading && (
                  <div
                    className={cn(
                      "flex flex-row justify-start items-start w-full"
                    )}
                  >
                    <div
                      className={cn(
                        "flex flex-row gap-1 p-2 rounded-lg message text-sm",
                        "receive bg-blue-100"
                      )}
                    >
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                      <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                )}
                {!isLoading && followupQuestions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {followupQuestions.map((question, index) => (
                      <SuggestionButton
                        key={index}
                        text={question}
                        onClick={() => selectFollowupQuestion(question)}
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
            className="border-t border-gray-200 p-4"
          >
            <div className="flex space-x-2">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <Button
                loading={isLoading ? "true" : "false"}
                disabled={!input.trim() || isLoading}
                type="submit"
                variant="outline"
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
          </form>
        </div>
      </div>
    </main>
  );
}

const SuggestionButton = ({ text, onClick }) => (
  <Button variant="ghost" onClick={onClick} className="text-gray-500">
    {text}
  </Button>
);
