import { useState } from 'react';
import { ChatBot } from '../ChatBot';

export default function ChatBotExample() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="h-screen relative">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">ChatBot Example</h2>
        <p className="text-muted-foreground">The chatbot appears in the bottom-right corner.</p>
      </div>
      <ChatBot
        currentPage="home"
        isOpen={isOpen}
        onToggle={() => setIsOpen(!isOpen)}
      />
    </div>
  );
}