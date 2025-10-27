// src/components/Chatbot.jsx
import React, { useState, useRef, useEffect } from "react";
import styled, { keyframes } from "styled-components";
import { FiCoffee, FiX, FiMic, FiMicOff } from "react-icons/fi";
import Fuse from "fuse.js";

// Animations
const slideUp = keyframes`
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(124, 74, 33, 0.6); }
  70% { box-shadow: 0 0 0 15px rgba(124, 74, 33, 0); }
  100% { box-shadow: 0 0 0 0 rgba(124, 74, 33, 0); }
`;

const typingAnimation = keyframes`
  0% { content: ''; }
  33% { content: '.'; }
  66% { content: '..'; }
  100% { content: '...'; }
`;

// Styles
const ChatbotWrapper = styled.div`
  position: fixed;
  bottom: 20px;
  right: 80px;
  z-index: 1000;
`;

const ChatButton = styled.button`
  background-color: #7c4a21;
  border: none;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 28px;
  cursor: pointer;
  animation: ${pulse} 2s infinite;
  transition: all 0.3s ease-in-out;

  &:hover {
    transform: scale(1.1);
    background-color: #5b3417;
  }
`;

const ChatWindow = styled.div`
  position: absolute;
  bottom: 80px;
  right: 0;
  width: 340px;
  max-height: 420px;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 15px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: ${slideUp} 0.3s ease-out;
`;

const Header = styled.div`
  background: rgba(124, 74, 33, 0.9);
  color: white;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
`;

const Messages = styled.div`
  flex: 1;
  padding: 12px;
  font-size: 14px;
  overflow-y: auto;
  color: #2e2e2e;
  display: flex;
  flex-direction: column;
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 8px 12px;
  margin: 6px 0;
  border-radius: 10px;
  background: ${(props) => (props.isUser ? "#7c4a21" : "#f5f5f5")};
  color: ${(props) => (props.isUser ? "white" : "#2e2e2e")};
  align-self: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
`;

const Typing = styled.div`
  font-size: 12px;
  color: #7c4a21;
  margin-top: 5px;
  &::after {
    content: '...';
    animation: ${typingAnimation} 1.2s infinite;
  }
`;

const InputSection = styled.div`
  display: flex;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
  align-items: center;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: none;
  outline: none;
  background: rgba(255, 255, 255, 0.5);
  color: #2e2e2e;
`;

const SendButton = styled.button`
  background: #7c4a21;
  border: none;
  color: white;
  padding: 10px 12px;
  cursor: pointer;

  &:hover {
    background: #5b3417;
  }
`;

const MicButton = styled.button`
  background: transparent;
  border: none;
  color: ${(props) => (props.isListening ? "#d32f2f" : "#7c4a21")};
  font-size: 20px;
  margin: 0 5px;
  cursor: pointer;
  transition: color 0.3s ease;
`;

const QuickButton = styled.button`
  background: rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(124, 74, 33, 0.5);
  border-radius: 8px;
  padding: 6px 12px;
  margin: 4px;
  cursor: pointer;
  font-size: 13px;

  &:hover {
    background: rgba(124, 74, 33, 0.1);
  }
`;

// FAQ Answers
const faqAnswers = [
  { keywords: ["place an order", "order", "how do i place an order", "how to place an order"], 
    answer: "To place an order, browse our collection and click 'Add to Cart'. When you're ready, proceed to checkout." },
  { keywords: ["payment methods", "payment options", "how do i pay", "what payment methods do you accept"], 
    answer: "We accept credit cards, PayPal, and bank transfers for your convenience." },
  { keywords: ["modify my order", "change order", "edit order"], answer: "Once an order is placed, it cannot be modified. However, you can cancel it and place a new one if needed." },
  { keywords: ["track my order", "track order", "tracking"], answer: "Once your order ships, you’ll receive a tracking number via email to monitor your shipment." },
  { keywords: ["recommend", "best coffee", "suggest", "what to drink"], answer: "Our most-loved drinks: Caramel Cold Brew, Mocha Latte, and Premium Beans Cappuccino." },
  { keywords: ["open", "hours", "timing", "closing"], answer: "We’re open every day from 8AM to 10PM." },
  { keywords: ["cancel", "refund", "return"], answer: "You can cancel before shipment for a full refund. Contact our support team for assistance." },
  { keywords: ["coffee made of", "what is your coffee made of"], answer: "We use only the finest organic coffee beans sourced ethically from sustainable farms." },
  { keywords: ["vegan", "plant-based", "vegan options"], answer: "Yes! We have a range of plant-based milks and vegan pastries available." },
  { keywords: ["wifi", "internet"], answer: "Yes, we offer free high-speed Wi-Fi to all our customers." },
  { keywords: ["outdoor seating", "outside"], answer: "Yes, we have a cozy outdoor seating area for customers to enjoy their coffee." },
  { keywords: ["pets", "dogs", "pet-friendly"], answer: "Yes! We’re a pet-friendly café, and we even offer special treats for dogs." },
  { keywords: ["gift card", "voucher"], answer: "Yes, we have gift cards available in-store and online." },
  { keywords: ["events", "workshops"], answer: "We regularly host coffee-tasting events and barista workshops." },
  { keywords: ["loyalty program", "rewards"], answer: "Yes, join our rewards program and earn points for every purchase." },
];

const fuse = new Fuse(faqAnswers, { keys: ["keywords"], threshold: 0.4 });

// Get bot reply
function getBotReply(question) {
  const q = question.toLowerCase();
  if (["hi", "hello", "hey", "good morning", "good evening"].some((g) => q.includes(g))) {
    return "Hello there! 👋 Welcome to MsCafe. How can I help? (Orders, payments, Wi-Fi, vegan, or coffee recs)";
  }

  const result = fuse.search(q);
  if (result.length > 0) return result[0].item.answer;

  return "Hmm, I’m not sure about that 🤔. You can ask about orders, payments, Wi-Fi, vegan options, pets, or our coffee!";
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi there! ☕ How can I help you today? (Orders, FAQs, Wi-Fi, or coffee suggestions)" },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [suggestionsVisible, setSuggestionsVisible] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      handleSend(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
  }, []);

  
  const speak = (text) => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    synth.speak(utterance);
  };

  const handleSend = (text) => {
    if (!text.trim()) return;
    setSuggestionsVisible(false);
    setMessages((prev) => [...prev, { from: "user", text }]);
    setInput("");
    setTyping(true);

    setTimeout(() => {
      setTyping(false);
      const reply = getBotReply(text);
      setMessages((prev) => [...prev, { from: "bot", text: reply }]);
      speak(reply);
    }, 800);
  };

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition not supported in your browser 😢");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  return (
    <ChatbotWrapper>
      {open && (
        <ChatWindow>
          <Header>
            MsCafe Chat
            <FiX style={{ cursor: "pointer" }} onClick={() => setOpen(false)} />
          </Header>

          <Messages>
            {messages.map((msg, i) => (
              <MessageBubble key={i} isUser={msg.from === "user"}>
                {msg.text}
              </MessageBubble>
            ))}
            {typing && <Typing>typing</Typing>}
            <div ref={messagesEndRef} />

            {suggestionsVisible && (
              <div style={{ marginTop: "10px", display: "flex", flexWrap: "wrap" }}>
                <QuickButton onClick={() => handleSend("place an order")}>How to Place an Order</QuickButton>
                <QuickButton onClick={() => handleSend("payment methods")}>Payment Options</QuickButton>
              </div>
            )}
          </Messages>

          <InputSection>
            <MicButton onClick={handleMicClick} isListening={isListening}>
              {isListening ? <FiMicOff /> : <FiMic />}
            </MicButton>
            <Input
              value={input}
              placeholder="Ask me anything..."
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
            />
            <SendButton onClick={() => handleSend(input)}>Send</SendButton>
          </InputSection>
        </ChatWindow>
      )}
      <ChatButton onClick={() => setOpen(!open)}>
        <FiCoffee />
      </ChatButton>
    </ChatbotWrapper>
  );
}
