import React from 'react';
import { Circuit } from '../types/quantum';
import { Wrench, AlertTriangle, CheckCircle, Info, X, Trash2 } from 'lucide-react';

interface CircuitFixerProps {
  circuit: Circuit;
  onGateRemove: (gateId: string) => void;
  onClose: () => void;
}

export const CircuitFixer: React.FC<CircuitFixerProps> = ({ 
  circuit, 
  onGateRemove, 
  onClose 
}) => {
  const analyzeCircuit = () => {
    const issues = [];
    const optimizations = [];
    const info = [];
    
    const gateCount = circuit.gates.length;
    const depth = Math.max(...circuit.gates.map(g => g.position || 0), 0) + 1;
    const gateTypes = circuit.gates.reduce((acc, gate) => {
      acc[gate.name] = (acc[gate.name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Check for empty circuit
    if (gateCount === 0) {
      info.push({
        type: 'info',
        title: 'Empty Circuit',
        description: 'Your circuit is empty. Add some quantum gates to get started!',
        action: 'Add gates from the library'
      });
      return { issues, optimizations, info };
    }
    
    // Check for excessive depth
    if (depth > 20) {
      issues.push({
        type: 'error',
        title: 'High Circuit Depth',
        description: `Circuit depth of ${depth} may cause decoherence on real quantum hardware.`,
        action: 'Consider parallelizing operations or reducing gate count',
        severity: 'high'
      });
    } else if (depth > 10) {
      optimizations.push({
        type: 'warning',
        title: 'Moderate Circuit Depth',
        description: `Circuit depth of ${depth} is getting high. Consider optimization.`,
        action: 'Look for gate cancellations or parallel operations',
        severity: 'medium'
      });
    }
    
    // Check for gate cancellations
    const consecutiveGates = [];
    for (let i = 0; i < circuit.gates.length - 1; i++) {
      const current = circuit.gates[i];
      const next = circuit.gates[i + 1];
      
      if (current.name === next.name && 
          current.qubits.length === 1 && 
          next.qubits.length === 1 &&
          current.qubits[0] === next.qubits[0] &&
          ['X', 'Y', 'Z', 'H'].includes(current.name)) {
        consecutiveGates.push({ current, next, index: i });
      }
    }
    
    if (consecutiveGates.length > 0) {
      optimizations.push({
        type: 'warning',
        title: 'Gate Cancellations Detected',
        description: `Found ${consecutiveGates.length} pairs of gates that cancel each other out.`,
        action: 'Remove redundant gate pairs',
        severity: 'medium',
        fixable: true,
        fix: () => {
          consecutiveGates.forEach(pair => {
            onGateRemove(pair.current.id);
            onGateRemove(pair.next.id);
          });
        }
      });
    }
    
    // Check for excessive Hadamard gates
    if (gateTypes['H'] > 4) {
      optimizations.push({
        type: 'warning',
        title: 'Many Hadamard Gates',
        description: `${gateTypes['H']} Hadamard gates detected. Pairs of H gates cancel out.`,
        action: 'Review H gate placement for potential cancellations',
        severity: 'low'
      });
    }
    
    // Check for missing entanglement in multi-qubit circuits
    const maxQubit = Math.max(...circuit.gates.flatMap(g => g.qubits));
    const hasMultiQubitGates = circuit.gates.some(g => g.qubits.length > 1);
    
    if (maxQubit > 0 && !hasMultiQubitGates) {
      info.push({
        type: 'info',
        title: 'No Entanglement',
        description: 'Circuit uses multiple qubits but has no entangling gates.',
        action: 'Consider adding CX, CZ, or SWAP gates for quantum advantage'
      });
    }
    
    // Check for quantum cost
    const quantumCost = circuit.gates.reduce((cost, gate) => {
      const costMap: Record<string, number> = {
        'H': 1, 'X': 1, 'Y': 1, 'Z': 1, 'S': 1, 'T': 1,
        'RX': 1, 'RY': 1, 'RZ': 1, 'U3': 3,
        'CX': 5, 'CZ': 5, 'CY': 5, 'SWAP': 3, 'CCX': 7
      };
      return cost + (costMap[gate.name] || 1);
    }, 0);
    
    if (quantumCost > 50) {
      issues.push({
        type: 'error',
        title: 'High Quantum Cost',
        description: `Quantum cost of ${quantumCost} is very high for current hardware.`,
        action: 'Reduce gate count or use more efficient gate sequences',
        severity: 'high'
      });
    } else if (quantumCost > 25) {
      optimizations.push({
        type: 'warning',
        title: 'Moderate Quantum Cost',
        description: `Quantum cost of ${quantumCost} may impact fidelity on real hardware.`,
        action: 'Consider gate optimization techniques',
        severity: 'medium'
      });
    }
    
    // Check for algorithm patterns
    const hasHadamard = gateTypes['H'] > 0;
    const hasCNOT = gateTypes['CX'] > 0;
    const hasPhaseGates = gateTypes['S'] > 0 || gateTypes['T'] > 0 || gateTypes['RZ'] > 0;
    
    if (hasHadamard && hasCNOT && !hasPhaseGates) {
      info.push({
        type: 'info',
        title: 'Bell State Pattern',
        description: 'Circuit creates entanglement. Consider adding phase gates for more complex algorithms.',
        action: 'Add RZ, S, or T gates for phase manipulation'
      });
    }
    
    // Performance suggestions
    if (gateCount > 5) {
      info.push({
        type: 'info',
        title: 'Circuit Complexity',
        description: 'Complex circuit detected. Consider testing on simulator before hardware.',
        action: 'Validate results with local simulation first'
      });
    }
    
    return { issues, optimizations, info };
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      case 'info': return Info;
      default: return CheckCircle;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case 'error': return {
        bg: 'bg-red-50 dark:bg-red-900/20',
        border: 'border-red-200 dark:border-red-800',
        text: 'text-red-900 dark:text-red-300',
        icon: 'text-red-600'
      };
      case 'warning': return {
        bg: 'bg-yellow-50 dark:bg-yellow-900/20',
        border: 'border-yellow-200 dark:border-yellow-800',
        text: 'text-yellow-900 dark:text-yellow-300',
        icon: 'text-yellow-600'
      };
      case 'info': return {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        text: 'text-blue-900 dark:text-blue-300',
        icon: 'text-blue-600'
      };
      default: return {
        bg: 'bg-gray-50 dark:bg-gray-900/20',
        border: 'border-gray-200 dark:border-gray-800',
        text: 'text-gray-900 dark:text-gray-300',
        icon: 'text-gray-600'
      };
    }
  };

  const { issues, optimizations, info } = analyzeCircuit();
  const allItems = [...issues, ...optimizations, ...info];

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <Wrench className="w-6 h-6 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Circuit Fixer
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
        <div className="mb-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{issues.length}</div>
              <div className="text-sm text-red-800 dark:text-red-400">Issues</div>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{optimizations.length}</div>
              <div className="text-sm text-yellow-800 dark:text-yellow-400">Optimizations</div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{info.length}</div>
              <div className="text-sm text-blue-800 dark:text-blue-400">Suggestions</div>
            </div>
          </div>
        </div>
        
        {allItems.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
            <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Circuit Looks Great!
            </h4>
            <p className="text-gray-500 dark:text-gray-400">
              No issues or optimizations detected in your quantum circuit.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {allItems.map((item, index) => {
              const Icon = getIcon(item.type);
              const colors = getColors(item.type);
              
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className={`w-5 h-5 mt-0.5 ${colors.icon}`} />
                    <div className="flex-1">
                      <h4 className={`font-medium mb-1 ${colors.text}`}>
                        {item.title}
                      </h4>
                      <p className={`text-sm mb-2 ${colors.text} opacity-80`}>
                        {item.description}
                      </p>
                      <p className={`text-xs ${colors.text} opacity-60`}>
                        💡 {item.action}
                      </p>
                    </div>
                    {(item as any).fixable && (
                      <button
                        onClick={(item as any).fix}
                        className="p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        title="Auto-fix this issue"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};