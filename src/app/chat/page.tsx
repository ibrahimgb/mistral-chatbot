"use client";

import { faBars, faMagnifyingGlass, faPaperPlane, faPlus, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useEffect, useRef, useState } from "react";
import styles from "./chat.module.scss";

type Conversation = {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = "mistral-chat-history";

export default function ChatPage() {
  const models = [
    { label: "Mistral Large", value: "mistral-large-latest" },
    { label: "Mistral Medium", value: "mistral-medium-latest" },
    { label: "Mistral Small", value: "mistral-small-latest" },
    { label: "Mistral Nemo", value: "mistral-nemo-latest" },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [model, setModel] = useState(models[2].value); // default to Mistral Small
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationsRef = useRef<Conversation[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && deleteConfirmId) {
        setDeleteConfirmId(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [deleteConfirmId]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    const loadConversations = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Conversation[];
          setConversations(parsed);
          conversationsRef.current = parsed;
          if (parsed.length > 0) {
            const mostRecent = parsed.sort((a, b) => b.updatedAt - a.updatedAt)[0];
            setCurrentConversationId(mostRecent.id);
            setMessages(mostRecent.messages);
            setModel(mostRecent.model);
          }
        }
      } catch (error) {
        console.error("Error loading conversations:", error);
      }
    };
    loadConversations();
  }, []);

  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      const saveConversation = () => {
        try {
          const title = messages.find(m => m.role === "user")?.content.slice(0, 50) || "New Chat";
          const existing = conversationsRef.current.find(c => c.id === currentConversationId);
          const updated: Conversation = {
            id: currentConversationId,
            title,
            messages,
            model,
            createdAt: existing?.createdAt || Date.now(),
            updatedAt: Date.now(),
          };

          const updatedConversations = conversationsRef.current.filter(c => c.id !== currentConversationId);
          updatedConversations.push(updated);
          updatedConversations.sort((a, b) => b.updatedAt - a.updatedAt);
          
          setConversations(updatedConversations);
          conversationsRef.current = updatedConversations;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedConversations));
        } catch (error) {
          console.error("Error saving conversation:", error);
        }
      };
      saveConversation();
    }
  }, [messages, model, currentConversationId]);

  const createNewConversation = () => {
    const newId = `conv-${Date.now()}`;
    setCurrentConversationId(newId);
    setMessages([]);
    setSearchQuery("");
    setSidebarOpen(false);
  };

  const loadConversation = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversationId(conversation.id);
      setMessages(conversation.messages);
      setModel(conversation.model);
      setSidebarOpen(false);
    }
  };

  const deleteConversation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const confirmDelete = () => {
    if (!deleteConfirmId) return;
    
    const id = deleteConfirmId;
    const updated = conversations.filter(c => c.id !== id);
    setConversations(updated);
    conversationsRef.current = updated;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    
    if (currentConversationId === id) {
      if (updated.length > 0) {
        const mostRecent = updated.sort((a, b) => b.updatedAt - a.updatedAt)[0];
        loadConversation(mostRecent.id);
      } else {
        setCurrentConversationId(null);
        setMessages([]);
      }
    }
    
    setDeleteConfirmId(null);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const filteredConversations = conversations.filter((conv) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    
    // Search in title
    if (conv.title.toLowerCase().includes(query)) return true;
    
    // Search in message content
    return conv.messages.some((msg) =>
      msg.content.toLowerCase().includes(query)
    );
  });

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!currentConversationId) {
      const newId = `conv-${Date.now()}`;
      setCurrentConversationId(newId);
    }

    const userMessage: ChatMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, model }),
      });

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content:
          data?.choices?.[0]?.message?.content || "Response from Mistral",
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={`${styles.chatPageWrapper} ${darkMode ? styles.dark : ""}`}>
      <button className={styles.darkModeBtn} onClick={toggleDarkMode}>
        {darkMode ? "☀️" : "🌙"}
      </button>

      <div className={styles.modelSelector}>
        <div className={styles.modelSelectorIcon}>🤖</div>
        <label className={styles.modelSelectorLabel}>
          <span className={styles.modelSelectorText}>AI Model</span>
          <select 
            value={model} 
            onChange={(e) => setModel(e.target.value)}
            className={styles.modelSelect}
          >
            {models.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Sidebar */}
      <div className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ""}`}>
        <div className={styles.sidebarHeader}>
          <h2>Chat History</h2>
          <button
            className={styles.newChatBtn}
            onClick={createNewConversation}
            title="New Chat"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <FontAwesomeIcon icon={faMagnifyingGlass} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className={styles.clearSearchBtn}
                onClick={() => setSearchQuery("")}
                title="Clear search"
              >
                <FontAwesomeIcon icon={faTimes} />
              </button>
            )}
          </div>
        </div>
        <div className={styles.conversationsList}>
          {conversations.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No conversations yet</p>
              <button onClick={createNewConversation} className={styles.emptyStateBtn}>
                Start New Chat
              </button>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No conversations found</p>
              <button onClick={() => setSearchQuery("")} className={styles.emptyStateBtn}>
                Clear Search
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className={`${styles.conversationItem} ${
                  currentConversationId === conv.id ? styles.active : ""
                }`}
                onClick={() => loadConversation(conv.id)}
              >
                <div className={styles.conversationContent}>
                  <div className={styles.conversationTitle}>{conv.title}</div>
                  <div className={styles.conversationDate}>
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={(e) => deleteConversation(conv.id, e)}
                  title="Delete conversation"
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {deleteConfirmId && (
        <div className={styles.modalOverlay} onClick={cancelDelete}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Delete Conversation</h3>
            <p className={styles.modalMessage}>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
            <div className={styles.modalButtons}>
              <button
                className={styles.modalCancelBtn}
                onClick={cancelDelete}
              >
                Cancel
              </button>
              <button
                className={styles.modalConfirmBtn}
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        className={styles.sidebarToggle}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <FontAwesomeIcon icon={faBars} />
      </button>

      <div className={styles.chatWrapper}>

        {messages.length === 0 && (
          <div className={styles.logoContainer}>
            <div className={styles.mistralLogo}>
              <img 
                src={darkMode ? "/mistral-brand-asset/m-white.svg" : "/mistral-brand-asset/m-black.svg"} 
                alt="Mistral AI Logo" 
                className={styles.logoImage}
              />
            </div>
          </div>
        )}

        <div className={styles.messagesContainer}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.message} ${
                msg.role === "user" ? styles.user : styles.assistant
              }`}
            >
              {msg.role === "assistant" ? (
                <div className={styles.markdown}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className={`${styles.inputContainer} ${messages.length === 0 ? styles.inputContainerCentered : ""}`}>
          <div className={styles.inputWrapper}>
            <img 
              src={darkMode ? "/mistral-brand-asset/m-white.svg" : "/mistral-brand-asset/m-black.svg"} 
              alt="Mistral" 
              className={styles.inputIcon}
            />
            <button className={styles.newChatIconBtn} onClick={createNewConversation} title="New Chat">
              <FontAwesomeIcon icon={faPlus} />
            </button>
            <textarea
              className={styles.chatInput}
              placeholder="Ask Mistral anything"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              rows={1}
            />
            <button
              className={styles.sendButton}
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? "..." : <FontAwesomeIcon icon={faPaperPlane} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
