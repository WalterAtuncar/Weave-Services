import React from 'react';
import { FloatingChatBot } from './FloatingChatBot';
import { useChat } from '../../../contexts/ChatContext';

export const GlobalChat: React.FC = () => {
  const { isOpen, toggleChat } = useChat();
  return <FloatingChatBot isOpen={isOpen} onToggle={toggleChat} />;
};