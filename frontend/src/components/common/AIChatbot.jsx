import React, { useState, useRef, useEffect } from "react";
import {
  improveDescription,
  checkDuplicates,
  analyzeIssuePriority,
} from "../../services/aiService";
import toast from "react-hot-toast";

const AIChatbot = ({ user, existingIssues = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: "bot",
      text: `Hi ${user?.name?.split(" ")[0] || "there"}! 👋 I'm your AI assistant. I can help you with:

• 📝 Writing better issue descriptions
• 🔍 Checking for duplicate issues  
• 📊 Analyzing issue priority
• 💡 Suggesting improvements
• ❓ Answering questions

How can I assist you today?`,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const addMessage = (text, type = "user") => {
    const newMessage = {
      id: Date.now(),
      type,
      text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  const addBotMessage = (text) => {
    setIsTyping(true);
    setTimeout(() => {
      addMessage(text, "bot");
      setIsTyping(false);
    }, 800);
  };

  const handleQuickAction = async (action) => {
    switch (action) {
      case "improve":
        addMessage("How do I improve my issue description?");
        addBotMessage(`I can help make your description more effective! 📝

Here's how:

1️⃣ **Be Specific**: Include exact location, time, and details
2️⃣ **Describe Impact**: Explain who is affected
3️⃣ **Add Context**: Mention how long the issue has existed
4️⃣ **Stay Objective**: Focus on facts, not emotions

💡 **Pro Tip**: Use the "✨ Improve with AI" button when creating an issue - I'll automatically enhance your description!

Want me to help with anything else?`);
        break;

      case "duplicate":
        addMessage("How does duplicate detection work?");
        addBotMessage(`Great question! Here's how I prevent duplicate issues: 🔍

🤖 **AI-Powered Analysis**:
• I compare your title, description, and location
• Check against recent unresolved issues
• Give you a similarity score (0-100%)

⚠️ **What Happens**:
• <60%: Safe to submit ✅
• 60-80%: I'll warn you ⚡
• >80%: Strong duplicate detected 🚫

💡 **Tip**: Instead of creating duplicates, upvote existing issues to boost their priority!

Use the "🔍 Check for Similar Issues" button when reporting.`);
        break;

      case "priority":
        addMessage("What is AI Priority Analysis?");
        addBotMessage(`I analyze each issue to determine its urgency! 📊

**What I Check**:
🔹 Issue severity and impact
🔹 Number of people affected  
🔹 Community engagement (upvotes)
🔹 Location and category

**Priority Levels**:
🔴 **Critical**: Immediate safety concerns
🟠 **High**: Major infrastructure issues
🟡 **Medium**: Standard problems
🟢 **Low**: Minor improvements

💡 Look for the purple "AI Priority" badge on issue cards to see the analysis!`);
        break;

      case "tips":
        addMessage("Give me tips for reporting issues");
        addBotMessage(`Here are my top tips for effective issue reporting! 💡

✅ **DO**:
• Take clear photos from multiple angles
• Include exact address or landmarks
• Report as soon as you notice the problem
• Use specific category (Roads, Water, etc.)

❌ **DON'T**:
• Use vague descriptions like "broken thing"
• Report the same issue multiple times
• Include personal information
• Use offensive language

🎯 **Best Practice**: Follow this format:
"[What] + [Where] + [When] + [Impact]"

Example: "Large pothole on MG Road near City Mall entrance. Present for 2 weeks. Causing vehicle damage and traffic slowdown."

Ready to report an issue?`);
        break;

      default:
        break;
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    addMessage(userMessage);
    setInputText("");
    setIsTyping(true);

    try {
      // Simple keyword-based responses
      const lowerMsg = userMessage.toLowerCase();

      if (
        lowerMsg.includes("hello") ||
        lowerMsg.includes("hi") ||
        lowerMsg.includes("hey")
      ) {
        addBotMessage(
          `Hello! 👋 I'm here to help you report and manage civic issues more effectively. What would you like to know?`,
        );
      } else if (
        lowerMsg.includes("improve") ||
        lowerMsg.includes("description") ||
        lowerMsg.includes("better")
      ) {
        addBotMessage(`I can help improve your issue descriptions! When creating an issue, click the "✨ Improve with AI" button and I'll automatically:

• Make it more clear and specific
• Add relevant details
• Use professional language
• Keep it concise (3-5 sentences)

This helps authorities understand and resolve issues faster! 🚀`);
      } else if (
        lowerMsg.includes("duplicate") ||
        lowerMsg.includes("similar")
      ) {
        addBotMessage(`To check for duplicates, click "🔍 Check for Similar Issues" when creating an issue. I'll scan all recent issues and alert you if something similar already exists.

This helps:
✅ Reduce clutter
✅ Consolidate community support
✅ Speed up resolution

If I find a duplicate, consider upvoting it instead! 👍`);
      } else if (
        lowerMsg.includes("priority") ||
        lowerMsg.includes("urgent") ||
        lowerMsg.includes("important")
      ) {
        addBotMessage(`I analyze issue priority using AI! Look for the purple "AI Priority" badge on issue cards.

I consider:
• Safety concerns
• Number of affected people
• Community engagement
• Infrastructure impact

Critical issues get flagged for immediate attention! 🚨`);
      } else if (lowerMsg.includes("how") || lowerMsg.includes("report")) {
        addBotMessage(`Here's how to report an issue:

1️⃣ Click "Report Issue" button
2️⃣ Choose category (Roads, Water, etc.)
3️⃣ Write clear title and description
4️⃣ Pin location on map
5️⃣ Upload photo (optional)
6️⃣ Use AI tools to improve & check duplicates
7️⃣ Submit!

💡 Pro tip: Use the "✨ Improve with AI" button before submitting!`);
      } else if (lowerMsg.includes("upvote") || lowerMsg.includes("vote")) {
        addBotMessage(`Upvoting helps prioritize important issues! 👍

**How it works**:
• Click the ⬆️ button on any issue
• More upvotes = Higher priority
• Authorities see popular issues first
• You can upvote multiple times

**When to upvote**:
✅ Issue affects you directly
✅ Problem is widespread
✅ Safety concern
✅ Needs urgent attention

Your vote matters! 🗳️`);
      } else if (lowerMsg.includes("status") || lowerMsg.includes("track")) {
        addBotMessage(`Track your issues easily! 📍

**3 Statuses**:
🟡 **Pending**: Just reported, awaiting review
🔵 **In Progress**: Authority is working on it
🟢 **Resolved**: Problem fixed!

View all your issues in "My Issues" section. You'll see:
• Current status
• Timeline of updates
• Upvote count
• Comments from authorities

Stay informed every step of the way! ✨`);
      } else if (lowerMsg.includes("thank") || lowerMsg.includes("thanks")) {
        addBotMessage(`You're welcome! 😊 Happy to help make our city better together.

Need anything else? I'm here 24/7! 🤖`);
      } else if (lowerMsg.includes("bye") || lowerMsg.includes("goodbye")) {
        addBotMessage(
          `Goodbye! Feel free to chat with me anytime you need help. Together, we're building a smarter city! 🏙️✨`,
        );
      } else {
        addBotMessage(`I'm here to help with:

🔹 **Issue Reporting** - How to create effective reports
🔹 **AI Features** - Improve descriptions, check duplicates
🔹 **Priority Analysis** - Understanding issue urgency
🔹 **Status Tracking** - Monitor your reports
🔹 **Tips & Tricks** - Best practices

Try asking something like:
• "How do I report an issue?"
• "What is AI priority?"
• "How to improve my description?"

What would you like to know? 🤔`);
      }
    } catch (error) {
      console.error("Chatbot error:", error);
      addBotMessage(
        `Oops! I encountered an error. Please try again or contact support if the issue persists. 😅`,
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    {
      id: "improve",
      icon: "✨",
      label: "Improve Description",
      action: "improve",
    },
    {
      id: "duplicate",
      icon: "🔍",
      label: "Duplicate Check",
      action: "duplicate",
    },
    {
      id: "priority",
      icon: "📊",
      label: "Priority Analysis",
      action: "priority",
    },
    { id: "tips", icon: "💡", label: "Reporting Tips", action: "tips" },
  ];

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
          isOpen ? "scale-0" : "scale-100"
        }`}
      >
        <div className="relative group">
          {/* Pulse Animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse opacity-75"></div>

          {/* Button */}
          <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 active:scale-95">
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>

            {/* Notification Badge */}
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-bounce">
              AI
            </div>
          </div>
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-scale-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                    />
                  </svg>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-purple-600"></div>
              </div>
              <div>
                <h3 className="font-bold text-lg">AI Assistant</h3>
                <p className="text-xs text-white/80">Always here to help 🤖</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === "user" ? "justify-end" : "justify-start"} animate-slide-up`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === "user"
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 text-white"
                      : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md border border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <p className="text-sm whitespace-pre-line leading-relaxed">
                    {message.text}
                  </p>
                  <p
                    className={`text-xs mt-2 ${message.type === "user" ? "text-white/70" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start animate-slide-up">
                <div className="bg-white dark:bg-gray-800 rounded-2xl px-6 py-4 shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-purple-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 2 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 font-medium">
                Quick Actions:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action.action)}
                    className="flex items-center space-x-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg transition-colors text-xs font-medium"
                  >
                    <span>{action.icon}</span>
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-2xl">
            <div className="flex items-end space-x-2">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                rows="1"
                className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press Enter to send • Shift + Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default AIChatbot;
