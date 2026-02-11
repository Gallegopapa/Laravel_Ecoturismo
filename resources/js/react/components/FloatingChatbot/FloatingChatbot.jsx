import React, { useState, useRef, useEffect } from 'react';
import { faqs } from '../../data/faqs';
import './chatbot.css';

const FloatingChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Hola, soy el asistente de la plataforma. ¿En qué puedo ayudarte?'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const searchFAQs = (query) => {
    const lowerQuery = query.toLowerCase();
    const keywords = lowerQuery.split(/\s+/).filter(word => word.length > 2);

    const scored = faqs.map(faq => {
      const questionLower = faq.question.toLowerCase();
      const answerLower = faq.answer.toLowerCase();

      let score = 0;
      keywords.forEach(keyword => {
        if (questionLower.includes(keyword)) score += 3;
        if (answerLower.includes(keyword)) score += 1;
      });

      return { ...faq, score };
    });

    return scored
      .filter(faq => faq.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Agregar mensaje del usuario
    const userMessage = {
      type: 'user',
      text: inputValue
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Buscar en FAQs
    setTimeout(() => {
      const results = searchFAQs(inputValue);

      if (results.length > 0) {
        const botResponse = {
          type: 'bot',
          text: 'Encontré algunas preguntas que podrían ayudarte:',
          suggestions: results
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        const botResponse = {
          type: 'bot',
          text: 'No encontré información sobre eso. Puedes intentar con otras palabras o contactarnos directamente:'
        };
        setMessages(prev => [...prev, botResponse]);
      }
    }, 300);
  };

  const handleSelectSuggestion = (faq) => {
    const message = {
      type: 'bot',
      text: faq.answer,
      isAnswer: true,
      question: faq.question
    };
    setMessages(prev => [...prev, message]);
  };

  return (
    <div className="floating-chatbot">
      {isOpen && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <h3>Asistente</h3>
            <button
              className="close-btn"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message message-${msg.type}`}>
                {msg.text && <p className="message-text">{msg.text}</p>}
                {msg.suggestions && (
                  <div className="suggestions">
                    {msg.suggestions.map(suggestion => (
                      <button
                        key={suggestion.id}
                        className="suggestion-btn"
                        onClick={() => handleSelectSuggestion(suggestion)}
                        type="button"
                      >
                        {suggestion.question}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form className="chatbot-input-form" onSubmit={handleSendMessage}>
            <input
              type="text"
              className="chatbot-input"
              placeholder="Escribe tu pregunta..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
            <button
              type="submit"
              className="send-btn"
              disabled={!inputValue.trim()}
            >
              ➤
            </button>
          </form>
        </div>
      )}

      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        title="Abrir asistente"
      >
        <span className="icon">💬</span>
      </button>
    </div>
  );
};

export default FloatingChatbot;

