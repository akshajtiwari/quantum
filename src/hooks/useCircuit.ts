import { useState, useCallback } from 'react';
import { Circuit, QuantumGate, CircuitBackup, CustomGate } from '../types/quantum';

export const useCircuit = () => {
  const [circuit, setCircuit] = useState<Circuit>({
    gates: [],
    measurements: []
  });
  const [numQubits, setNumQubitsState] = useState(4);
  const [selectedGates, setSelectedGates] = useState<string[]>([]);

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

  const saveBackup = useCallback((name: string, description?: string) => {
    const backup: CircuitBackup = {
      id: Date.now().toString(),
      name,
      circuit: { ...circuit },
      timestamp: Date.now(),
      description
    };
    
    const existingBackups = JSON.parse(localStorage.getItem('quantum-circuit-backups') || '[]');
    existingBackups.push(backup);
    localStorage.setItem('quantum-circuit-backups', JSON.stringify(existingBackups));
    
    return backup;
  }, [circuit]);

  const loadBackup = useCallback((backupId: string) => {
    const backups = JSON.parse(localStorage.getItem('quantum-circuit-backups') || '[]');
    const backup = backups.find((b: CircuitBackup) => b.id === backupId);
    if (backup) {
      setCircuit(backup.circuit);
    }
  }, []);

  const getBackups = useCallback((): CircuitBackup[] => {
    return JSON.parse(localStorage.getItem('quantum-circuit-backups') || '[]');
  }, []);

  const deleteBackup = useCallback((backupId: string) => {
    const backups = JSON.parse(localStorage.getItem('quantum-circuit-backups') || '[]');
    const filteredBackups = backups.filter((b: CircuitBackup) => b.id !== backupId);
    localStorage.setItem('quantum-circuit-backups', JSON.stringify(filteredBackups));
  }, []);

  const toggleGateSelection = useCallback((gateId: string) => {
    setSelectedGates(prev => {
      if (prev.includes(gateId)) {
        return prev.filter(id => id !== gateId);
      } else {
        return [...prev, gateId];
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedGates([]);
  }, []);

  const createCustomGate = useCallback((name: string, initial: string, description: string) => {
    const selectedGateObjects = circuit.gates.filter(gate => selectedGates.includes(gate.id));
    if (selectedGateObjects.length === 0) return null;

    const customGate: CustomGate = {
      id: Date.now().toString(),
      name,
      initial,
      description,
      gates: selectedGateObjects.map(gate => ({ ...gate, id: Date.now().toString() + Math.random() })),
      numQubits: Math.max(...selectedGateObjects.flatMap(g => g.qubits)) + 1,
      timestamp: Date.now()
    };

    const existingCustomGates = JSON.parse(localStorage.getItem('quantum-custom-gates') || '[]');
    existingCustomGates.push(customGate);
    localStorage.setItem('quantum-custom-gates', JSON.stringify(existingCustomGates));

    setSelectedGates([]);
    return customGate;
  }, [circuit.gates, selectedGates]);

  const getCustomGates = useCallback((): CustomGate[] => {
    return JSON.parse(localStorage.getItem('quantum-custom-gates') || '[]');
  }, []);

  return {
    circuit,
    numQubits,
    selectedGates,
    addGate,
    removeGate,
    clearCircuit,
    setNumQubits,
    exportCircuit,
    importCircuit,
    saveBackup,
    loadBackup,
    getBackups,
    deleteBackup,
    toggleGateSelection,
    clearSelection,
    createCustomGate,
    getCustomGates
  };
};