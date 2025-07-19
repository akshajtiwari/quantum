import React from 'react';
import { QuantumGate } from '../types/quantum';

interface SidebarProps {
  onGateSelect: (gate: QuantumGate) => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ onGateSelect, className = '' }) => {
  const gateCategories = [
    {
      name: 'Single Qubit Gates',
      gates: [
        { name: 'H', label: 'Hadamard', color: 'bg-blue-500' },
        { name: 'X', label: 'Pauli-X', color: 'bg-red-500' },
        { name: 'Y', label: 'Pauli-Y', color: 'bg-green-500' },
        { name: 'Z', label: 'Pauli-Z', color: 'bg-purple-500' },
        { name: 'S', label: 'S Gate', color: 'bg-yellow-500' },
        { name: 'S†', label: 'S Dagger', color: 'bg-yellow-600' },
        { name: 'T', label: 'T Gate', color: 'bg-pink-500' },
        { name: 'T†', label: 'T Dagger', color: 'bg-pink-600' },
      ]
    },
    {
      name: 'Rotation Gates',
      gates: [
        { name: 'RX', label: 'Rotation X', color: 'bg-red-400' },
        { name: 'RY', label: 'Rotation Y', color: 'bg-green-400' },
        { name: 'RZ', label: 'Rotation Z', color: 'bg-purple-400' },
        { name: 'U3', label: 'Universal Gate', color: 'bg-indigo-500' },
      ]
    },
    {
      name: 'Multi-Qubit Gates',
      gates: [
        { name: 'CX', label: 'CNOT', color: 'bg-orange-500' },
        { name: 'CZ', label: 'Controlled-Z', color: 'bg-cyan-500' },
        { name: 'CY', label: 'Controlled-Y', color: 'bg-teal-500' },
        { name: 'SWAP', label: 'SWAP', color: 'bg-gray-500' },
        { name: 'CCX', label: 'Toffoli', color: 'bg-rose-500' },
      ]
    }
  ];

  const handleGateClick = (gateName: string) => {
    const gate: QuantumGate = {
      id: Date.now().toString(),
      name: gateName,
      qubits: [],
      parameters: gateName.startsWith('R') || gateName === 'U3' ? [Math.PI / 2] : undefined
    };
    
    // For single qubit gates, we'll let the user choose the qubit
    // For multi-qubit gates, we'll start the placement process
    if (['CX', 'CZ', 'CY', 'SWAP', 'CCX'].includes(gateName)) {
      // Multi-qubit gate - user will select qubits on canvas
      onGateSelect(gate);
    } else {
      // Single qubit gate - user will select qubit on canvas
      onGateSelect(gate);
    }
  };

  const handleDragStart = (e: React.DragEvent, gateName: string) => {
    const gate: QuantumGate = {
      id: Date.now().toString(),
      name: gateName,
      qubits: [],
      parameters: gateName.startsWith('R') || gateName === 'U3' ? [Math.PI / 2] : undefined
    };
    e.dataTransfer.setData('application/json', JSON.stringify(gate));
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-3 overflow-y-auto ${className}`}>
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">Gate Library</h2>
      
      {gateCategories.map((category) => (
        <div key={category.name} className="mb-4">
          <h3 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
            {category.name}
          </h3>
          <div className="grid grid-cols-2 gap-1.5">
            {category.gates.map((gate) => (
              <button
                key={gate.name}
                onClick={() => handleGateClick(gate.name)}
                draggable
                onDragStart={(e) => handleDragStart(e, gate.name)}
                className={`${gate.color} text-white p-2 rounded-lg font-medium text-xs hover:opacity-90 transition-opacity shadow-sm hover:shadow-md transform hover:scale-105 transition-transform`}
                title={gate.label}
              >
                {gate.name}
              </button>
            ))}
          </div>
        </div>
      ))}
      
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-2">
          Quick Tips
        </h3>
        <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-0.5">
          <li>• Drag or click gates to add them to the circuit</li>
          <li>• Multi-qubit gates require control and target selection</li>
          <li>• Use H gates to create superposition</li>
          <li>• CX gates create entanglement</li>
          <li>• Rotation gates have adjustable parameters</li>
        </ul>
      </div>
    </div>
  );
};