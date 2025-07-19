import React, { useState, useRef, useEffect } from 'react';
import { Circuit, QuantumGate } from '../types/quantum';
import { Trash2, Settings, Target, Circle } from 'lucide-react';

interface CircuitCanvasProps {
  circuit: Circuit;
  onGateRemove: (gateId: string) => void;
  onGateAdd: (gate: QuantumGate) => void;
  numQubits: number;
  className?: string;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  circuit,
  onGateRemove,
  onGateAdd,
  numQubits,
  className = ''
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedGate, setDraggedGate] = useState<QuantumGate | null>(null);
  const [hoveredPosition, setHoveredPosition] = useState<{ qubit: number; position: number } | null>(null);
  const [selectedGate, setSelectedGate] = useState<string | null>(null);
  const [gateBeingPlaced, setGateBeingPlaced] = useState<QuantumGate | null>(null);
  const [controlQubit, setControlQubit] = useState<number | null>(null);

  const isMultiQubitGate = (gateName: string) => {
    return ['CX', 'CZ', 'CY', 'SWAP', 'CCX'].includes(gateName);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropZoneClick = (qubitIndex: number, position: number) => {
    if (gateBeingPlaced && isMultiQubitGate(gateBeingPlaced.name)) {
      if (controlQubit === null) {
        setControlQubit(qubitIndex);
      } else if (controlQubit !== qubitIndex) {
        const newGate = {
          ...gateBeingPlaced,
          qubits: [controlQubit, qubitIndex],
          position: position
        };
        onGateAdd(newGate);
        setGateBeingPlaced(null);
        setControlQubit(null);
      }
    } else if (draggedGate) {
      if (isMultiQubitGate(draggedGate.name)) {
        setGateBeingPlaced(draggedGate);
        setControlQubit(qubitIndex);
      } else {
        const newGate = {
          ...draggedGate,
          qubits: [qubitIndex],
          position: position
        };
        onGateAdd(newGate);
      }
      setDraggedGate(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Handle drop in specific drop zones
  };

  const handleDragStart = (e: React.DragEvent) => {
    try {
      const gateData = e.dataTransfer.getData('application/json');
      if (gateData) {
        const gate = JSON.parse(gateData);
        setDraggedGate(gate);
      }
    } catch (error) {
      console.error('Error parsing dragged gate data:', error);
    }
  };

  const renderQubitLine = (qubitIndex: number) => {
    const gatesOnQubit = circuit.gates.filter(gate => gate.qubits.includes(qubitIndex));
    const maxPosition = Math.max(...circuit.gates.map(g => g.position || 0), 5);
    
    return (
      <div key={qubitIndex} className="relative flex items-center h-12 mb-1">
        {/* Qubit label */}
        <div className="w-12 flex-shrink-0 text-center">
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            |q{qubitIndex}⟩
          </span>
        </div>
        
        {/* Qubit wire */}
        <div className="flex-1 relative" style={{ minWidth: `${(maxPosition + 2) * 60}px` }}>
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400 dark:bg-gray-500 transform -translate-y-1/2" />
          
          {/* Drop zones for gate placement */}
          {Array.from({ length: maxPosition + 3 }, (_, i) => (
            <div
              key={`drop-zone-${i}`}
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-lg border-2 border-dashed border-transparent hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer z-10"
              style={{ left: `${i * 60 + 30}px` }}
              onDragOver={(e) => {
                e.preventDefault();
                setHoveredPosition({ qubit: qubitIndex, position: i });
              }}
              onDragLeave={() => setHoveredPosition(null)}
              onDrop={(e) => {
                e.preventDefault();
                try {
                  const gateData = e.dataTransfer.getData('application/json');
                  if (gateData) {
                    const gate = JSON.parse(gateData);
                    setDraggedGate(gate);
                    handleDropZoneClick(qubitIndex, i);
                  }
                } catch (error) {
                  console.error('Error parsing dragged gate data:', error);
                }
                setHoveredPosition(null);
              }}
              onClick={() => handleDropZoneClick(qubitIndex, i)}
            />
          ))}
          
          {/* Visual feedback for hovered position */}
          {hoveredPosition && hoveredPosition.qubit === qubitIndex && (
            <div
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-lg border-2 border-blue-400 dark:border-blue-600 opacity-50 pointer-events-none"
              style={{ left: `${hoveredPosition.position * 60 + 30}px` }}
            />
          )}
          
          {/* Clickable positions for multi-qubit gates */}
          {gateBeingPlaced && isMultiQubitGate(gateBeingPlaced.name) && (
            Array.from({ length: maxPosition + 3 }, (_, i) => (
              <div
                key={`multi-gate-${i}`}
                className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-dashed cursor-pointer transition-colors z-20 ${
                  controlQubit === qubitIndex ? 'border-blue-500 bg-blue-100 dark:bg-blue-900' : 'border-gray-300 hover:border-blue-400'
                }`}
                style={{ left: `${i * 60 + 30}px` }}
                onClick={() => handleDropZoneClick(qubitIndex, i)}
              />
            ))
          )}
          
          {/* Gates on this qubit */}
          {gatesOnQubit.map((gate, index) => (
            <div
              key={gate.id}
              className="absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 group z-30"
              style={{ left: `${(gate.position || index) * 60 + 30}px` }}
            >
              <div className="relative">
                <div 
                  className={`w-8 h-8 rounded-lg shadow-md border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:scale-110 transition-transform ${getGateColor(gate.name)} ${
                    selectedGate === gate.id ? 'ring-2 ring-blue-400' : ''
                  }`}
                  onClick={() => setSelectedGate(selectedGate === gate.id ? null : gate.id)}
                >
                  {gate.name}
                </div>
                
                {/* Control/Target indicators for multi-qubit gates */}
                {gate.qubits.length > 1 && gate.qubits[0] === qubitIndex && (
                  <div className="absolute -top-1 -right-1">
                    <Circle className="w-3 h-3 text-blue-600 fill-current" />
                  </div>
                )}
                {gate.qubits.length > 1 && gate.qubits[1] === qubitIndex && gate.name !== 'SWAP' && (
                  <div className="absolute -top-1 -right-1">
                    <Target className="w-3 h-3 text-red-600" />
                  </div>
                )}
                
                {/* Gate controls */}
                <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => onGateRemove(gate.id)}
                    className="w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-2 h-2" />
                  </button>
                </div>
                
                {gate.parameters && (
                  <div className="absolute -bottom-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors">
                      <Settings className="w-2 h-2" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {/* Connection lines for multi-qubit gates */}
          {circuit.gates.filter(gate => gate.qubits.length > 1).map(gate => {
            const minQubit = Math.min(...gate.qubits);
            const maxQubit = Math.max(...gate.qubits);
            if (qubitIndex === minQubit) {
              return (
                <div
                  key={`connection-${gate.id}`}
                  className="absolute bg-gray-400 dark:bg-gray-500"
                  style={{
                    left: `${(gate.position || 0) * 60 + 30}px`,
                    top: '50%',
                    width: '2px',
                    height: `${(maxQubit - minQubit) * 60}px`,
                    transform: 'translateX(-1px)'
                  }}
                />
              );
            }
            return null;
          })}
        </div>
      </div>
    );
  };

  const getGateColor = (gateName: string): string => {
    const colorMap: { [key: string]: string } = {
      'H': 'bg-blue-500',
      'X': 'bg-red-500',
      'Y': 'bg-green-500',
      'Z': 'bg-purple-500',
      'S': 'bg-yellow-500',
      'S†': 'bg-yellow-600',
      'T': 'bg-pink-500',
      'T†': 'bg-pink-600',
      'RX': 'bg-red-400',
      'RY': 'bg-green-400',
      'RZ': 'bg-purple-400',
      'U3': 'bg-indigo-500',
      'CX': 'bg-orange-500',
      'CZ': 'bg-cyan-500',
      'CY': 'bg-teal-500',
      'SWAP': 'bg-gray-500',
      'CCX': 'bg-rose-500'
    };
    return colorMap[gateName] || 'bg-gray-500';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 p-3 overflow-auto ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
          Quantum Circuit
        </h2>
        <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
          <span>Qubits: {numQubits}</span>
          <span>Gates: {circuit.gates.length}</span>
          <span>Depth: {Math.max(...circuit.gates.map(g => g.position || 0), 0) + 1}</span>
        </div>
      </div>
      
      {gateBeingPlaced && isMultiQubitGate(gateBeingPlaced.name) && (
        <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-200">
            {controlQubit === null 
              ? `Click on a qubit to place the control for ${gateBeingPlaced.name} gate`
              : `Control qubit: ${controlQubit}. Click on another qubit to place the target.`
            }
          </p>
          <button
            onClick={() => {
              setGateBeingPlaced(null);
              setControlQubit(null);
            }}
            className="mt-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      )}
      
      <div
        ref={canvasRef}
        className="relative p-2 bg-gray-50 dark:bg-gray-900 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-x-auto"
        style={{ minHeight: `${numQubits * 60 + 60}px` }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={() => setHoveredPosition(null)}
        onDragEnter={handleDragStart}
      >
        {/* Drop zones */}
        {hoveredPosition && (
          <div
            className="absolute w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-lg border-2 border-blue-400 dark:border-blue-600 opacity-50"
            style={{
              left: `${hoveredPosition.position * 60 + 40}px`,
              top: `${hoveredPosition.qubit * 60 + 30}px`
            }}
          />
        )}
        
        {/* Qubit lines */}
        <div className="space-y-2">
          {Array.from({ length: numQubits }, (_, i) => renderQubitLine(i))}
        </div>
        
        {circuit.gates.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">⚛️</div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Drag gates from the library to start building your quantum circuit
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};