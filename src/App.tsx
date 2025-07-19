import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { CircuitCanvas } from './components/CircuitCanvas';
import { InsightsPanel } from './components/InsightsPanel';
import { CodeView } from './components/CodeView';
import { QuantumChatbot } from './components/QuantumChatbot';
import { GateSuggestor } from './components/GateSuggestor';
import { CircuitFixer } from './components/CircuitFixer';
import { TutorialTour } from './components/TutorialTour';
import { BlochSphere } from './components/BlochSphere';
import { ProbabilityView } from './components/ProbabilityView';
import { StateVectorView } from './components/StateVectorView';
import { useTheme } from './hooks/useTheme';
import { useCircuit } from './hooks/useCircuit';
import { QuantumGate, Circuit, Backend } from './types/quantum';

function App() {
  const { theme, toggleTheme } = useTheme();
  const { circuit, addGate, removeGate, clearCircuit, exportCircuit, importCircuit, setNumQubits } = useCircuit();
  const [selectedBackend, setSelectedBackend] = useState<Backend>('local');
  const [showCodeView, setShowCodeView] = useState(false);
  const [showBlochSphere, setShowBlochSphere] = useState(false);
  const [showProbability, setShowProbability] = useState(false);
  const [showStateVector, setShowStateVector] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [numQubits, setNumQubitsState] = useState(4);
  const [activeBottomPanel, setActiveBottomPanel] = useState<'chat' | 'suggest' | 'fix' | 'none'>('none');

  useEffect(() => {
    // Check if first time user
    const hasSeenTutorial = localStorage.getItem('quantum-simulator-tutorial');
    if (!hasSeenTutorial) {
      setShowTutorial(true);
    }
  }, []);

  const handleNumQubitsChange = (newNumQubits: number) => {
    setNumQubitsState(newNumQubits);
    setNumQubits(newNumQubits);
  };

  const handleSimulate = async () => {
    setIsSimulating(true);
    // Simulate quantum circuit
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSimulating(false);
  };

  const toggleBottomPanel = (panel: 'chat' | 'suggest' | 'fix') => {
    setActiveBottomPanel(activeBottomPanel === panel ? 'none' : panel);
  };

  return (
    <div className={`${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="flex flex-col h-screen">
          <Header 
            theme={theme}
            toggleTheme={toggleTheme}
            onSimulate={handleSimulate}
            isSimulating={isSimulating}
            selectedBackend={selectedBackend}
            setSelectedBackend={setSelectedBackend}
            showCodeView={showCodeView}
            setShowCodeView={setShowCodeView}
            showBlochSphere={showBlochSphere}
            setShowBlochSphere={setShowBlochSphere}
            showProbability={showProbability}
            setShowProbability={setShowProbability}
            showStateVector={showStateVector}
            setShowStateVector={setShowStateVector}
            onExport={exportCircuit}
            onImport={importCircuit}
            onClear={clearCircuit}
            numQubits={numQubits}
            onNumQubitsChange={handleNumQubitsChange}
            activeBottomPanel={activeBottomPanel}
            onToggleBottomPanel={toggleBottomPanel}
          />
          
          <div className="flex flex-1 overflow-hidden">
            <div className="w-56 flex-shrink-0 border-r border-gray-200 dark:border-gray-700">
              <Sidebar 
                onGateSelect={addGate}
                className="h-full"
              />
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex flex-1 overflow-hidden">
                <main className="flex-1 overflow-hidden">
                  {showStateVector ? (
                    <StateVectorView circuit={circuit} numQubits={numQubits} />
                  ) : showProbability ? (
                    <ProbabilityView circuit={circuit} numQubits={numQubits} />
                  ) : showBlochSphere ? (
                    <BlochSphere circuit={circuit} numQubits={numQubits} />
                  ) : showCodeView ? (
                    <CodeView circuit={circuit} />
                  ) : (
                    <CircuitCanvas 
                      circuit={circuit}
                      onGateRemove={removeGate}
                      onGateAdd={addGate}
                      numQubits={numQubits}
                      className="h-full"
                    />
                  )}
                </main>
                
                <div className="w-64 flex-shrink-0 border-l border-gray-200 dark:border-gray-700">
                  <InsightsPanel 
                    circuit={circuit}
                    className="h-full"
                  />
                </div>
              </div>
              
              {/* Bottom AI Panels */}
              {activeBottomPanel !== 'none' && (
                <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800" style={{ height: '250px' }}>
                  {activeBottomPanel === 'chat' && (
                    <QuantumChatbot 
                      circuit={circuit}
                      onClose={() => setActiveBottomPanel('none')}
                    />
                  )}
                  {activeBottomPanel === 'suggest' && (
                    <GateSuggestor 
                      circuit={circuit}
                      onGateAdd={addGate}
                      numQubits={numQubits}
                      onClose={() => setActiveBottomPanel('none')}
                    />
                  )}
                  {activeBottomPanel === 'fix' && (
                    <CircuitFixer 
                      circuit={circuit}
                      onGateRemove={removeGate}
                      onClose={() => setActiveBottomPanel('none')}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showTutorial && (
        <TutorialTour onComplete={() => setShowTutorial(false)} />
      )}
    </div>
  );
}

export default App;