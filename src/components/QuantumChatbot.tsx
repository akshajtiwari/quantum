import React, { useState } from 'react';
import { Circuit } from '../types/quantum';
import { Bot, Send, X } from 'lucide-react';

interface QuantumChatbotProps {
  circuit: Circuit;
  onClose: () => void;
}

export const QuantumChatbot: React.FC<QuantumChatbotProps> = ({ circuit, onClose }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your quantum computing assistant. Ask me anything about quantum gates, algorithms, or your current circuit!'
    }
  ]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const newMessage = { role: 'user' as const, content: message };
    setChatHistory(prev => [...prev, newMessage]);
    setMessage('');

    // Simulate AI response based on message content
    setTimeout(() => {
      const response = { 
        role: 'assistant' as const, 
        content: getQuantumResponse(message, circuit)
      };
      setChatHistory(prev => [...prev, response]);
    }, 1000);
  };

  const getQuantumResponse = (userMessage: string, circuit: Circuit): string => {
    const msg = userMessage.toLowerCase();
    
    if (msg.includes('hadamard') || msg.includes('h gate')) {
      return "The Hadamard gate creates superposition by transforming |0⟩ to (|0⟩ + |1⟩)/√2 and |1⟩ to (|0⟩ - |1⟩)/√2. It's essential for quantum algorithms like Grover's and Shor's algorithm.";
    }
    
    if (msg.includes('entanglement') || msg.includes('cnot') || msg.includes('cx')) {
      return "CNOT (CX) gates create entanglement between qubits. When applied after a Hadamard gate, they create Bell states - maximally entangled two-qubit states that are fundamental to quantum computing.";
    }
    
    if (msg.includes('circuit') || msg.includes('current')) {
      const gateCount = circuit.gates.length;
      const depth = Math.max(...circuit.gates.map(g => g.position || 0), 0) + 1;
      return `Your current circuit has ${gateCount} gates with depth ${depth}. ${gateCount === 0 ? 'Try adding some gates to get started!' : 'Looking good! You can add more gates or ask me about optimization.'}`;
    }
    
    if (msg.includes('bloch') || msg.includes('sphere')) {
      return "The Bloch sphere is a geometric representation of qubit states. The north pole represents |0⟩, south pole |1⟩, and points on the equator represent superposition states like |+⟩ and |-⟩.";
    }
    
    if (msg.includes('superposition')) {
      return "Superposition allows qubits to exist in multiple states simultaneously. Unlike classical bits that are either 0 or 1, qubits can be in a combination of both states until measured.";
    }
    
    if (msg.includes('measurement') || msg.includes('measure')) {
      return "Quantum measurement collapses the superposition, forcing the qubit into either |0⟩ or |1⟩ with probabilities determined by the quantum amplitudes. This is why quantum algorithms are probabilistic.";
    }
    
    if (msg.includes('algorithm')) {
      return "Popular quantum algorithms include Grover's search (quadratic speedup), Shor's factoring (exponential speedup), and Deutsch-Jozsa (determines if a function is constant or balanced). Each exploits quantum properties differently.";
    }
    
    if (msg.includes('error') || msg.includes('noise')) {
      return "Quantum error correction is crucial because qubits are fragile and lose coherence quickly. Techniques include error correction codes, decoherence mitigation, and careful gate calibration.";
    }
    
    // Default responses for general quantum computing questions
    const responses = [
      "Quantum computing leverages quantum mechanical phenomena like superposition and entanglement to process information in fundamentally new ways.",
      "The key advantage of quantum computers is their ability to explore multiple solution paths simultaneously through superposition.",
      "Quantum gates are reversible operations that manipulate qubit states. Unlike classical logic gates, they preserve information.",
      "Quantum interference allows us to amplify correct answers and cancel out wrong ones, which is how many quantum algorithms achieve speedup.",
      "Decoherence is the enemy of quantum computing - it's why we need error correction and why quantum computers operate at near absolute zero."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Bot className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quantum Chatbot
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about quantum computing..."
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};