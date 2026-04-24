import React, { useMemo, useRef, useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import axios from "axios";
import { chatbotQueryAPI } from "../utils/ApiRequest";
import { getAuthHeaders } from "../utils/auth";
import ChatMessage from "./ChatMessage";
import "./chatbot.css";

const initialMessage = {
  role: "bot",
  text: "Hi, I’m the Finora assistant. Ask me about your expenses, categories, or how to use the app.",
};

const starterPrompts = [
  "Show my expenses for March",
  "How much did I spend on food?",
  "What is my total spending this month?",
];

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([initialMessage]);
  const [loading, setLoading] = useState(false);
  const viewportRef = useRef(null);

  const lastBotSuggestions = useMemo(() => {
    const latestBotMessage = [...messages].reverse().find((message) => message.role === "bot");
    return latestBotMessage?.suggestions?.length ? latestBotMessage.suggestions : starterPrompts;
  }, [messages]);

  const appendMessage = (message) => {
    setMessages((current) => [...current, message]);
    setTimeout(() => {
      if (viewportRef.current) {
        viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
      }
    }, 0);
  };

  const submitPrompt = async (prompt) => {
    const trimmedPrompt = prompt.trim();

    if (!trimmedPrompt || loading) {
      return;
    }

    appendMessage({ role: "user", text: trimmedPrompt });
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        chatbotQueryAPI,
        { message: trimmedPrompt },
        { headers: getAuthHeaders() }
      );

      appendMessage({
        role: "bot",
        text: data.answer,
        data: data.data,
        suggestions: data.suggestions,
      });
    } catch (error) {
      appendMessage({
        role: "bot",
        text: error.response?.data?.answer || "I hit a problem while looking that up. Please try again.",
        suggestions: starterPrompts,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await submitPrompt(input);
  };

  return (
    <>
      {isOpen ? (
        <div className="chatbotPanel">
          <div className="chatbotHeader">
            <div>
              <h5>Finora Assistant</h5>
              <span>Expense help and quick summaries</span>
            </div>
            <button
              type="button"
              className="chatbotClose"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="chatbotSuggestions">
            {lastBotSuggestions.map((prompt) => (
              <button
                type="button"
                key={prompt}
                className="suggestionChip"
                onClick={() => submitPrompt(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <div className="chatbotMessages" ref={viewportRef}>
            {messages.map((message, index) => (
              <ChatMessage key={`${message.role}-${index}`} message={message} />
            ))}

            {loading ? (
              <div className="chatLoading">
                <Spinner size="sm" animation="border" />
                <span>Finora is thinking...</span>
              </div>
            ) : null}
          </div>

          <Form onSubmit={handleSubmit} className="chatbotForm">
            <Form.Control
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about spending, categories, or app help..."
              className="chatbotInput"
            />
            <Button type="submit" className="chatbotSend" disabled={loading}>
              <SendIcon fontSize="small" />
            </Button>
          </Form>
        </div>
      ) : null}

      <button
        type="button"
        className="chatbotToggle"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Open chatbot"
      >
        <SmartToyOutlinedIcon />
      </button>
    </>
  );
};

export default ChatbotWidget;
