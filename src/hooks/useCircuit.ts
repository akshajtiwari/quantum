import { useState, useCallback } from 'react';
import { Circuit, QuantumGate } from '../types/quantum';

export const useCircuit = () => {
  const [circuit, setCircuit] = useState<Circuit>({
    gates: [],
    measurements: []
  });
  const [numQubits, setNumQubitsState] = useState(4);

  const addGate = useCallback((gate: QuantumGate) => {
    setCircuit(prev => ({
      ...prev,
      gates: [...prev.gates, { ...gate, id: Date.now().toString() }]
    }));
  }, []);

  const removeGate = useCallback((gateId: string) => {
    setCircuit(prev => ({
      ...prev,
      gates: prev.gates.filter(gate => gate.id !== gateId)
    }));
  }, []);

  const clearCircuit = useCallback(() => {
    setCircuit({
      gates: [],
      measurements: []
    });
  }, []);

  const setNumQubits = useCallback((newNumQubits: number) => {
    setNumQubitsState(newNumQubits);
    // Remove gates that reference qubits beyond the new limit
    setCircuit(prev => ({
      ...prev,
      gates: prev.gates.filter(gate => 
        gate.qubits.every(qubit => qubit < newNumQubits)
      )
    }));
  }, []);
  const exportCircuit = useCallback(() => {
    const dataStr = JSON.stringify(circuit, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `quantum-circuit-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [circuit]);

  const importCircuit = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const importedCircuit = JSON.parse(e.target?.result as string);
            setCircuit(importedCircuit);
          } catch (error) {
            console.error('Error importing circuit:', error);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }, []);

  return {
    circuit,
    addGate,
    removeGate,
    clearCircuit,
    setNumQubits,
    exportCircuit,
    importCircuit
  };
};