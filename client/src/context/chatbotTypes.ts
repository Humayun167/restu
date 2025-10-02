import { createContext } from 'react';

export interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  products?: Product[];
}

interface Product {
  _id: string;
  name: string;
  description: string[];
  price: number;
  offerPrice: number;
  image: string[];
  category: string;
  inStock: boolean;
}

export interface ChatbotContextType {
  messages: Message[];
  isOpen: boolean;
  isTyping: boolean;
  isLoading: boolean;
  toggleChat: () => void;
  sendMessage: (message: string) => Promise<void>;
  clearChat: () => void;
}

export const ChatbotContext = createContext<ChatbotContextType | undefined>(undefined);