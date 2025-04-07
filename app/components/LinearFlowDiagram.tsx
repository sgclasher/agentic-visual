'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// Define interface for our optimized workflow data
interface ServiceNowRef {
  sys_id: string;
  name?: string;
  type?: string;
}

interface Tool {
  sys_id: string;
  name: string;
  description?: string;
  type: string;
  target_document_table?: string;
}

interface Capability {
  sys_id: string;
  name: string;
  description?: string;
  type?: string;
}

interface AgentTools {
  sys_id: string;
  name: string;
  type?: string;
}

interface Agent {
  sys_id: string;
  name: string;
  description?: string;
  tools?: AgentTools[];
}

interface AgentRef {
  sys_id: string;
  name: string;
}

interface TriggerRef {
  sys_id: string;
  name?: string;
  condition?: string;
  target_table?: string;
}

interface ProcessFlow {
  sequence_number: number;
  previous_use_cases?: string[];
  next_use_cases?: string[];
  input_artifacts?: string[];
  output_artifacts?: string[];
  phase?: string;
}

interface UseCase {
  sys_id: string;
  name: string;
  description?: string;
  agents?: AgentRef[];
  triggers?: TriggerRef[];
  process_flow?: ProcessFlow; 
}

interface Trigger {
  sys_id: string;
  active?: string;
  usecase?: string;
  target_table?: string;
  condition?: string;
  run_as?: string;
  objective_template?: string;
}

// Simplified WorkflowData interface focused on visualization needs
interface WorkflowData {
  script_execution_info?: any;
  use_cases: UseCase[];
  agents: { [key: string]: Agent };
  tools: { [key: string]: Tool };
  capabilities: { [key: string]: Capability };
  triggers: { [key: string]: Trigger };
  execution?: {
    timestamp: string;
    source: string;
  };
}

export default function LinearFlowDiagram() {
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Order phases for display
  const phaseOrder = ['1', '2', '3', '4', '5', 'New', 'Planning', 'Draft', 'Review', 'Published', 'Archived'];
  
  // Map phase to color
  const phaseColors: { [key: string]: string } = {
    '1': 'bg-blue-100 text-blue-800',
    '2': 'bg-green-100 text-green-800',
    '3': 'bg-yellow-100 text-yellow-800',
    '4': 'bg-purple-100 text-purple-800',
    '5': 'bg-pink-100 text-pink-800',
    'New': 'bg-blue-100 text-blue-800',
    'Planning': 'bg-teal-100 text-teal-800',
    'Draft': 'bg-yellow-100 text-yellow-800',
    'Review': 'bg-orange-100 text-orange-800',
    'Published': 'bg-green-100 text-green-800',
    'Archived': 'bg-gray-100 text-gray-800',
    'default': 'bg-gray-100 text-gray-800',
  };

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        // First check if we have cached data in localStorage
        const cachedData = localStorage?.getItem('workflow-data');
        
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            console.log('Using cached workflow data:', parsedData);
            
            // Transform data if needed
            setWorkflowData(normalizeData(parsedData));
            setLoading(false);
            return;
          } catch (e) {
            console.error('Error parsing localStorage data:', e);
            // Fall through to fetch from file
          }
        }
        
        // Fallback to fetching from static file
        const response = await fetch('/workflow-data.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch workflow data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched workflow data from file:', data);
        
        // Transform data if needed
        setWorkflowData(normalizeData(data));
      } catch (err: any) {
        console.error('Error loading workflow data:', err);
        setError(err.message || 'Failed to load workflow data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Normalize data to handle different formats
  function normalizeData(data: any): WorkflowData {
    // Check if data is wrapped in a data property
    const workflowData = data.data || data;
    
    // If process_flow is missing from use cases, add it with basic phase info
    const processedUseCases = (workflowData.use_cases || workflowData.useCases || []).map((useCase: any, index: number) => {
      if (!useCase.process_flow) {
        // Create a basic process flow if one doesn't exist
        useCase.process_flow = {
          sequence_number: index + 1,
          phase: useCase.team ? 'Phase ' + (index % 5 + 1) : 'Unknown'
        };
      }
      return useCase;
    });
    
    // Return normalized data structure
    return {
      use_cases: processedUseCases,
      agents: workflowData.agents || {},
      tools: workflowData.tools || {},
      capabilities: workflowData.capabilities || {},
      triggers: workflowData.triggers || {},
      execution: workflowData.execution || {
        timestamp: new Date().toISOString(),
        source: 'normalized'
      }
    };
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mb-2"></div>
          <p className="text-gray-600">Loading workflow data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-4">
        <p className="font-bold">Error</p>
        <p>{error}</p>
        <p className="mt-2">
          Please try again or go to the <a href="/dashboard" className="text-blue-600 underline">Dashboard</a> to reload data.
        </p>
      </div>
    );
  }

  if (!workflowData || !workflowData.use_cases || workflowData.use_cases.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded mb-4">
        <p className="font-bold">No Data Available</p>
        <p>
          No Agentic AI workflow data found. Please go to the <a href="/dashboard" className="text-blue-600 underline">Dashboard</a> to fetch data.
        </p>
      </div>
    );
  }

  // Sort use cases by phase for linear display
  const sortedUseCases = [...workflowData.use_cases].sort((a, b) => {
    const phaseA = a.process_flow?.phase || '0';
    const phaseB = b.process_flow?.phase || '0';
    
    const indexA = phaseOrder.indexOf(phaseA);
    const indexB = phaseOrder.indexOf(phaseB);
    
    if (indexA !== -1 && indexB !== -1) {
      if (indexA === indexB) {
        // If same phase, sort by sequence number
        return (a.process_flow?.sequence_number || 0) - (b.process_flow?.sequence_number || 0);
      }
      return indexA - indexB;
    }
    
    // Fallback to sequence number if phase not in order list
    return (a.process_flow?.sequence_number || 0) - (b.process_flow?.sequence_number || 0);
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-2">Agentic AI Linear Process Flow</h1>
      
      {workflowData.execution && (
        <div className="text-sm text-gray-500 mb-6">
          <p>Data Source: {workflowData.execution.source}</p>
          <p>Retrieved: {new Date(workflowData.execution.timestamp).toLocaleString()}</p>
        </div>
      )}
      
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-3">Phase Legend</h2>
        <div className="flex flex-wrap gap-2">
          {phaseOrder.map((phase) => (
            <span 
              key={phase}
              className={`px-3 py-1 rounded-full text-sm ${phaseColors[phase] || phaseColors.default}`}
            >
              {phase}
            </span>
          ))}
        </div>
      </div>
      
      <div className="mb-8">
        <div className="flex justify-between mb-2 text-sm font-medium text-gray-500">
          <span>Start</span>
          <span>Flow Direction</span>
          <span>End</span>
        </div>
        <div className="h-1 w-full bg-gray-200 relative">
          <div className="absolute inset-0 flex justify-center items-center">
            <svg width="100%" height="8" className="text-gray-400">
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
                </marker>
              </defs>
              <line x1="0" y1="4" x2="100%" y2="4" strokeWidth="2" stroke="currentColor" markerEnd="url(#arrowhead)" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        {sortedUseCases.map((useCase, index) => {
          const phase = useCase.process_flow?.phase || 'default';
          const agentList = useCase.agents?.map(agent => agent.name || workflowData.agents[agent.sys_id]?.name).filter(Boolean) || [];
          
          return (
            <motion.div 
              key={useCase.sys_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white shadow-md rounded-lg p-4 border-l-4 border-blue-500"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{useCase.name}</h3>
                  {useCase.description && <p className="text-gray-600 mt-1">{useCase.description}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${phaseColors[phase] || phaseColors.default}`}>
                  {phase}
                </span>
              </div>
              
              {agentList.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700">Agents:</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {agentList.map((agent, index) => (
                      <span key={index} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-sm">
                        {agent}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {useCase.process_flow && (
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  {useCase.process_flow.input_artifacts && useCase.process_flow.input_artifacts.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-700">Inputs:</p>
                      <ul className="list-disc list-inside text-gray-600">
                        {useCase.process_flow.input_artifacts.map((input, i) => (
                          <li key={i}>{input}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {useCase.process_flow.output_artifacts && useCase.process_flow.output_artifacts.length > 0 && (
                    <div>
                      <p className="font-medium text-gray-700">Outputs:</p>
                      <ul className="list-disc list-inside text-gray-600">
                        {useCase.process_flow.output_artifacts.map((output, i) => (
                          <li key={i}>{output}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
} 