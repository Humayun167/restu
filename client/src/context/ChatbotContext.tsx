import { useState, ReactNode, useCallback, useMemo } from 'react';
import { useProducts } from '@/hooks/useProducts';
import { ChatbotService } from '../lib/chatbotService';
import { ChatbotContext, ChatbotContextType, Message } from './chatbotTypes';

interface ChatbotProviderProps {
  children: ReactNode;
}

export const ChatbotProvider = ({ children }: ChatbotProviderProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey! What can I get you today? Just tell me what you're craving and I'll help you find something tasty!",
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { products } = useProducts();
  const chatbotService = useMemo(() => new ChatbotService(), []);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const sendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText.trim(),
      isUser: true,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setIsLoading(true);

    try {
      // Get AI response with product suggestions
      let response;
      try {
        response = await chatbotService.generateResponse(messageText, products);
      } catch (aiError) {
        console.error('AI service failed, using fallback:', aiError);
        // Fallback to simple keyword matching without AI
        response = chatbotService.generateFallbackResponse(messageText, products);
      }
      
      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isUser: false,
        timestamp: new Date(),
        products: response.suggestedProducts,
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      
      // More helpful error messages based on the error type
      let errorText = "Hmm, let me see what I can find for you anyway!";
      
      if (error.message.includes('Failed to generate response')) {
        if (products.length === 0) {
          errorText = "Hold on, still getting our menu ready. Try again in a sec!";
        } else {
          errorText = "Something's acting up on my end, but we've got " + products.length + " tasty dishes available! What are you in the mood for?";
        }
      }
      
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorText,
        isUser: false,
        timestamp: new Date(),
        products: products.length > 0 ? products.slice(0, 3) : [] // Show some products even if AI fails
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setIsLoading(false);
    }
  }, [products, chatbotService]);

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '1',
        text: "Hey! What can I get you today? Just tell me what you're craving and I'll help you find something tasty!",
        isUser: false,
        timestamp: new Date(),
      }
    ]);
  }, []);

  const value: ChatbotContextType = {
    messages,
    isOpen,
    isTyping,
    isLoading,
    toggleChat,
    sendMessage,
    clearChat,
  };

  return (
    <ChatbotContext.Provider value={value}>
      {children}
    </ChatbotContext.Provider>
  );
};