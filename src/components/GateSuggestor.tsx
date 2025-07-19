import React from 'react';
import { Circuit, QuantumGate } from '../types/quantum';
import { Lightbulb, Plus, X } from 'lucide-react';

interface GateSuggestorProps {
  circuit: Circuit;
  onGateAdd: (gate: QuantumGate) => void;
  numQubits: number;
  onClose: () => void;
}

export const GateSuggestor: React.FC<GateSuggestorProps> = ({ 
  circuit, 
  onGateAdd, 
  numQubits, 
  onClose 
}) => {
  const getSuggestions = () => {
    const suggestions = [];
    
    if (circuit.gates.length === 0) {
      suggestions.push({
        gate: 'H',
        title: 'Start with Superposition',
        reason: 'Create superposition with Hadamard gate - the foundation of quantum algorithms',
        priority: 'high',
        qubits: [0]
      });
      suggestions.push({
        gate: 'X',
        title: 'Initialize to |1⟩',
        reason: 'Flip qubit to |1⟩ state for algorithms that need specific initialization',
        priority: 'medium',
        qubits: [0]
      });
      return suggestions;
    }
    
    const lastGate = circuit.gates[circuit.gates.length - 1];
    const hasHadamard = circuit.gates.some(g => g.name === 'H');
    const hasEntanglement = circuit.gates.some(g => ['CX', 'CZ'].includes(g.name));
    const gateTypes = new Set(circuit.gates.map(g => g.name));
    
    // Suggest entanglement after superposition
    if (hasHadamard && !hasEntanglement && numQubits > 1) {
      suggestions.push({
        gate: 'CX',
        title: 'Create Entanglement',
        reason: 'Add CNOT gate to create entanglement between qubits - enables quantum parallelism',
        priority: 'high',
        qubits: [0, 1]
      });
    }
    
    // Suggest phase gates for more complex algorithms
    if (hasHadamard && !gateTypes.has('RZ')) {
      suggestions.push({
        gate: 'RZ',
        title: 'Add Phase Rotation',
        reason: 'RZ gates add phase information crucial for algorithms like QFT and Grover\'s',
        priority: 'medium',
        qubits: [0],
        parameters: [Math.PI / 4]
      });
    }
    
    // Suggest measurement preparation
    if (circuit.gates.length > 3 && !gateTypes.has('H')) {
      suggestions.push({
        gate: 'H',
        title: 'Prepare for Measurement',
        reason: 'Add Hadamard before measurement to read out superposition states',
        priority: 'medium',
        qubits: [lastGate.qubits[0]]
      });
    }
    
    // Algorithm-specific suggestions
    if (hasHadamard && hasEntanglement) {
      suggestions.push({
        gate: 'Z',
        title: 'Oracle Function',
        reason: 'Z gate can act as oracle in Grover\'s algorithm to mark target states',
        priority: 'low',
        qubits: [1]
      });
    }
    
    // Suggest controlled operations
    if (gateTypes.has('X') && numQubits > 1 && !gateTypes.has('CX')) {
      suggestions.push({
        gate: 'CX',
        title: 'Controlled Operation',
        reason: 'Convert single-qubit operations to controlled operations for more complex logic',
        priority: 'medium',
        qubits: [0, 1]
      });
    }
    
    // Default suggestions if nothing specific applies
    if (suggestions.length === 0) {
      suggestions.push({
        gate: 'RY',
        title: 'Arbitrary Rotation',
        reason: 'RY gates provide arbitrary single-qubit rotations for fine-tuned control',
        priority: 'low',
        qubits: [0],
        parameters: [Math.PI / 3]
      });
      suggestions.push({
        gate: 'S',
        title: 'Phase Gate',
        reason: 'S gate adds π/2 phase shift, useful for quantum Fourier transforms',
        priority: 'low',
        qubits: [0]
      });
    }
    
    return suggestions.slice(0, 4); // Limit to 4 suggestions
  };

  const handleAddGate = (suggestion: any) => {
    const gate: QuantumGate = {
      id: Date.now().toString(),
      name: suggestion.gate,
      qubits: suggestion.qubits,
      parameters: suggestion.parameters
    };
    onGateAdd(gate);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20';
      case 'medium': return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low': return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/20';
    }
  };

  const getPriorityTextColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-green-900 dark:text-green-300';
      case 'medium': return 'text-yellow-900 dark:text-yellow-300';
      case 'low': return 'text-blue-900 dark:text-blue-300';
      default: return 'text-gray-900 dark:text-gray-300';
    }
  };

  const suggestions = getSuggestions();

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Lightbulb className="w-6 h-6 text-yellow-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Gate Suggestor
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Smart suggestions based on your current circuit pattern and quantum algorithm best practices:
        </p>
        
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getPriorityColor(suggestion.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityTextColor(suggestion.priority)} bg-white dark:bg-gray-800`}>
                      {suggestion.gate}
                    </span>
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {suggestion.priority} priority
                    </span>
                  </div>
                  <h4 className={`font-medium mb-1 ${getPriorityTextColor(suggestion.priority)}`}>
                    {suggestion.title}
                  </h4>
                  <p className={`text-sm ${getPriorityTextColor(suggestion.priority)} opacity-80`}>
                    {suggestion.reason}
                  </p>
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Target qubits: {suggestion.qubits.join(', ')}
                    {suggestion.parameters && ` • Parameters: ${suggestion.parameters.map(p => p.toFixed(2)).join(', ')}`}
                  </div>
                </div>
                <button
                  onClick={() => handleAddGate(suggestion)}
                  className="ml-3 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Add this gate"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {suggestions.length === 0 && (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">
              No specific suggestions at the moment. Your circuit looks good!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};