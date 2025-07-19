export interface QuantumGate {
  id: string;
  name: string;
  qubits: number[];
  parameters?: number[];
  position?: number;
}

export interface Circuit {
  gates: QuantumGate[];
  measurements: { qubit: number; bit: number }[];
}

export type Backend = 'local' | 'qiskit' | 'cirq' | 'braket' | 'ionq' | 'ibm';

export interface QuantumState {
  amplitudes: Complex[];
  numQubits: number;
}

export interface Complex {
  real: number;
  imag: number;
}

export interface SimulationResult {
  counts: { [key: string]: number };
  statevector?: QuantumState;
  executionTime: number;
}