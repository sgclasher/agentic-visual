'use client';

import React, { useState, useCallback, useMemo, memo } from 'react';
import { motion } from 'framer-motion';

interface ProcessPhase {
  name: string;
  description: string;
  icon: string;
  artifacts: {
    inputs: string[];
    outputs: string[];
  };
}

interface ProcessFlowTimelineProps {
  phases: ProcessPhase[];
  activePhaseIndex: number;
  onPhaseClick: (index: number) => void;
}

// Memoize the ProcessFlowTimeline component to prevent unnecessary re-renders
const ProcessFlowTimeline: React.FC<ProcessFlowTimelineProps> = memo(({ 
  phases, 
  activePhaseIndex,
  onPhaseClick
}) => {
  // Calculate position for panel based on active phase - memoize this calculation
  const getPanelPosition = useCallback(() => {
    if (activePhaseIndex < 0 || phases.length === 0) return '50%';
    
    // For first and last phases, adjust to stay within viewport
    if (activePhaseIndex === 0) return '10%';
    if (activePhaseIndex === phases.length - 1) return '90%';
    
    // For middle phases, use percentage based on position
    return `${(activePhaseIndex / (phases.length - 1)) * 100}%`;
  }, [activePhaseIndex, phases.length]);
  
  return (
    <div className="w-full mb-8">
      {/* <h2 className="text-xl font-bold text-gray-800 mb-6">End-to-End Process Flow</h2> Removed Heading */}
      
      {/* Main Timeline */}
      <div className="relative">
        <div className="h-2 bg-gray-200 absolute w-full top-6 z-0 rounded-full"></div>
        
        <div className="flex justify-between relative z-10" id="phase-nodes">
          {phases.map((phase, index) => (
            <div 
              key={phase.name}
              className="flex flex-col items-center cursor-pointer relative"
              onClick={() => onPhaseClick(index)}
            >
              <motion.div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                  activePhaseIndex === index 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300'
                }`}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: activePhaseIndex === index ? 1.1 : 1, 
                  opacity: 1,
                  y: activePhaseIndex === index ? -5 : 0
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 15, 
                  delay: index * 0.1
                }}
              >
                <span className="text-lg">{phase.icon}</span>
              </motion.div>
              
              <motion.h3 
                className={`text-sm font-semibold ${activePhaseIndex === index ? 'text-blue-700' : 'text-gray-700'}`}
                animate={{ 
                  fontWeight: activePhaseIndex === index ? 600 : 400,
                  scale: activePhaseIndex === index ? 1.05 : 1
                }}
              >
                {phase.name}
              </motion.h3>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Information Panel - Dynamically Positioned - COMMENTED OUT
      <div className="relative h-[220px] mt-8">
        {activePhaseIndex >= 0 && activePhaseIndex < phases.length && (
          <motion.div 
            className="absolute top-0 w-64"
            initial={{ opacity: 0, y: -10 }}
            animate={{ 
              opacity: 1, 
              y: 0,
              left: getPanelPosition(),
              x: '-50%' // Center the panel on the position
            }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25 
            }}
          >
            <div className="bg-white border border-blue-200 rounded-lg p-4 shadow-md relative">
              
              <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-t border-l border-blue-200 rotate-45"></div>
              
              <p className="text-sm text-gray-700 mb-3">{phases[activePhaseIndex].description}</p>
              
              <div className="space-y-2">
                <div>
                  <h4 className="text-xs font-semibold text-blue-700">INPUTS</h4>
                  <ul className="text-xs text-gray-700 pl-4 list-disc">
                    {phases[activePhaseIndex].artifacts.inputs.map((input, i) => (
                      <li key={i}>{input}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-blue-700">OUTPUTS</h4>
                  <ul className="text-xs text-gray-700 pl-4 list-disc">
                    {phases[activePhaseIndex].artifacts.outputs.map((output, i) => (
                      <li key={i}>{output}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      */}
      
      {/* Progress Indicator */}
      <div className="mt-4">
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
          <motion.div 
            className="bg-blue-600 h-1.5 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${((activePhaseIndex + 1) / phases.length) * 100}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          ></motion.div>
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>Start</span>
          <span>Progress: {Math.round(((activePhaseIndex + 1) / phases.length) * 100)}%</span>
          <span>Complete</span>
        </div>
      </div>
    </div>
  );
});

ProcessFlowTimeline.displayName = 'ProcessFlowTimeline';

// Helper component to generate phases from use cases - moved to a separate utility function
export const generatePhasesFromUseCases = (useCases: any[]): ProcessPhase[] => {
  const phaseIcons: Record<string, string> = {
    'Intake': '📥',
    'Creation': '📝',
    'Execution': '🚀',
    'Evaluation': '⚖️',
    'Selection': '🏆',
    'Processing': '⚙️',
    'Analysis': '🔍',
    'Approval': '✅',
    'Implementation': '🛠️',
    'Unknown': '❓'
  };

  // Extract unique phases - fix TypeScript error with proper typing
  const uniquePhasesSet = new Set<string>();
  useCases
    .filter(uc => uc.process_flow?.phase)
    .forEach(uc => uniquePhasesSet.add(uc.process_flow.phase));
  const uniquePhases = Array.from(uniquePhasesSet);
  
  // Sort by sequence number if available
  const sortedUseCases = [...useCases].sort((a, b) => {
    const seqA = a.process_flow?.sequence_number || 999;
    const seqB = b.process_flow?.sequence_number || 999;
    return seqA - seqB;
  });
  
  // Get phases in order with proper typing
  const orderedPhases: string[] = [];
  
  for (const useCase of sortedUseCases) {
    const phase = useCase.process_flow?.phase;
    if (phase && !orderedPhases.includes(phase)) {
      orderedPhases.push(phase);
    }
  }
  
  // If no ordered phases were found, use the unique phases
  const phaseNames = orderedPhases.length > 0 ? orderedPhases : uniquePhases;
  
  // Create phase objects
  return phaseNames.map(phaseName => {
    // Find a use case for this phase to get artifacts
    const phaseUseCase = useCases.find(uc => uc.process_flow?.phase === phaseName);
    
    return {
      name: phaseName,
      description: getPhaseDescription(phaseName),
      icon: phaseIcons[phaseName] || phaseIcons['Unknown'],
      artifacts: {
        inputs: phaseUseCase?.process_flow?.input_artifacts || ['Data from previous phase'],
        outputs: phaseUseCase?.process_flow?.output_artifacts || ['Processed information']
      }
    };
  });
};

// Helper function for phase descriptions - extracted for better maintainability
const getPhaseDescription = (phaseName: string): string => {
  const descriptions: Record<string, string> = {
    'Intake': 'Collect and validate all required information to initiate the process',
    'Creation': 'Generate necessary documents and artifacts based on validated information',
    'Execution': 'Perform the core activities of the process with agent assistance',
    'Evaluation': 'Assess results and outcomes against defined criteria',
    'Selection': 'Make decisions based on evaluation results and select optimal outcomes',
    'Processing': 'Process and transform incoming data for further use',
    'Analysis': 'Analyze data to extract insights and identify patterns',
    'Approval': 'Review and approve decisions or documents before proceeding',
    'Implementation': 'Implement the approved changes or decisions'
  };
  
  return descriptions[phaseName] || 'This phase handles a specific part of the business process';
};

export default ProcessFlowTimeline; 