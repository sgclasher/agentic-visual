'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// Define types
interface Tool {
  sys_id: string;
  name: string;
  description?: string;
  type: string;
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

interface UseCase {
  sys_id: string;
  name: string;
  description?: string;
  process_flow?: {
    sequence_number: number;
    phase: string;
    input_artifacts?: string[];
    output_artifacts?: string[];
  };
  agents?: { sys_id: string; name: string }[];
}

interface UseCaseComparisonProps {
  initialWorkflowData: any;
}

export const UseCaseComparisonView: React.FC<UseCaseComparisonProps> = ({ initialWorkflowData }) => {
  // Initialize state with server-fetched data
  const [workflowData, setWorkflowData] = useState(initialWorkflowData);
  const [selectedUseCases, setSelectedUseCases] = useState<string[]>([]);
  const [startIndex, setStartIndex] = useState(0);
  
  // Effect to check localStorage for updates
  useEffect(() => {
    const checkLocalStorage = () => {
      const storedDataString = localStorage.getItem('workflow-data');
      if (storedDataString) {
        try {
          const storedData = JSON.parse(storedDataString);
          const currentData = storedData.data || storedData; // Handle nesting
          
          // Simple check for difference
          if (JSON.stringify(currentData) !== JSON.stringify(initialWorkflowData)) {
            console.log('Updating UseCaseComparisonView data from localStorage...');
            setWorkflowData(currentData);
          }
        } catch (e) {
          console.error("Error reading or parsing comparison data from localStorage:", e);
        }
      }
    };
    
    checkLocalStorage();
    // Add initialWorkflowData dependency if needed for re-runs on navigation
  }, [initialWorkflowData]); 

  if (!workflowData || !workflowData.use_cases || workflowData.use_cases.length === 0) {
    return <div className="p-4 text-center">No use case data available</div>;
  }

  // Get use cases to display
  let useCasesToDisplay = workflowData.use_cases;
  if (selectedUseCases.length > 0) {
    useCasesToDisplay = workflowData.use_cases.filter(
      (uc: UseCase) => selectedUseCases.includes(uc.sys_id)
    );
  } else {
    // If none selected, take 3 starting from startIndex
    const maxIndex = Math.max(0, workflowData.use_cases.length - 3);
    const validStartIndex = Math.min(startIndex, maxIndex);
    useCasesToDisplay = workflowData.use_cases.slice(validStartIndex, validStartIndex + 3);
  }

  // Navigate to previous use cases
  const handlePrevious = () => {
    if (selectedUseCases.length > 0) {
      // When specific use cases are selected, rotate through all use cases
      const allUseCases = workflowData.use_cases.map((uc: UseCase) => uc.sys_id);
      const newSelection = selectedUseCases.map(id => {
        const currentIndex = allUseCases.indexOf(id);
        const prevIndex = (currentIndex - 1 + allUseCases.length) % allUseCases.length;
        return allUseCases[prevIndex];
      });
      setSelectedUseCases(newSelection);
    } else {
      // When no specific selection, just change start index
      setStartIndex(prev => Math.max(0, prev - 1));
    }
  };

  // Navigate to next use cases
  const handleNext = () => {
    if (selectedUseCases.length > 0) {
      // When specific use cases are selected, rotate through all use cases
      const allUseCases = workflowData.use_cases.map((uc: UseCase) => uc.sys_id);
      const newSelection = selectedUseCases.map(id => {
        const currentIndex = allUseCases.indexOf(id);
        const nextIndex = (currentIndex + 1) % allUseCases.length;
        return allUseCases[nextIndex];
      });
      setSelectedUseCases(newSelection);
    } else {
      // When no specific selection, just change start index
      const maxIndex = Math.max(0, workflowData.use_cases.length - 3);
      setStartIndex(prev => Math.min(maxIndex, prev + 1));
    }
  };

  // Toggle use case selection
  const toggleUseCaseSelection = (useCaseId: string) => {
    setSelectedUseCases(prev => {
      if (prev.includes(useCaseId)) {
        return prev.filter(id => id !== useCaseId);
      } else {
        // Limit to 3 use cases
        const newSelected = [...prev, useCaseId].slice(-3);
        return newSelected;
      }
    });
  };

  // Get color scheme for a specific use case
  const getUseCaseColorScheme = (index: number) => {
    const colorSchemes = [
      {
        title: 'bg-blue-700 text-white',
        header: 'bg-blue-600 text-white',
        card: 'border-blue-600 bg-blue-50',
        agent: 'border-blue-500 bg-blue-100',
        tool: 'border-blue-400 bg-blue-50',
        text: 'text-blue-700',
        impact: 'bg-blue-600 text-white'
      },
      {
        title: 'bg-green-700 text-white',
        header: 'bg-green-600 text-white',
        card: 'border-green-600 bg-green-50',
        agent: 'border-green-500 bg-green-100',
        tool: 'border-green-400 bg-green-50',
        text: 'text-green-700',
        impact: 'bg-green-600 text-white'
      },
      {
        title: 'bg-orange-600 text-white',
        header: 'bg-orange-500 text-white',
        card: 'border-orange-500 bg-orange-50',
        agent: 'border-orange-400 bg-orange-100',
        tool: 'border-orange-300 bg-orange-50',
        text: 'text-orange-600',
        impact: 'bg-orange-500 text-white'
      }
    ];
    
    return colorSchemes[index % colorSchemes.length];
  };

  // Helper function to get a description of what an agent does based on its name
  const getAgentDescription = (agentName: string) => {
    const lowerName = agentName.toLowerCase();
    
    if (lowerName.includes('intake')) return 'Collects and validates required information';
    if (lowerName.includes('validator')) return 'Validates information against rules and policies';
    if (lowerName.includes('finder') || lowerName.includes('retriever')) return 'Searches and retrieves relevant information';
    if (lowerName.includes('monitor')) return 'Tracks metrics and alerts on conditions';
    if (lowerName.includes('processor')) return 'Processes requests and performs transformations';
    if (lowerName.includes('creator') || lowerName.includes('generate')) return 'Creates content based on requirements';
    if (lowerName.includes('answer')) return 'Responds to questions and provides information';
    if (lowerName.includes('evaluation') || lowerName.includes('eval')) return 'Evaluates data against criteria';
    
    return 'Performs specialized tasks and operations';
  };

  // Helper function to format tool display text
  const getToolDisplayText = (tool: any, toolDetail: any) => {
    if (!toolDetail) return tool.name;
    
    if (toolDetail.type === 'capability') {
      return `${tool.name}`;
    } else if (toolDetail.type === 'subflow') {
      return `${tool.name}`;
    }
    
    return tool.name;
  };

  // Helper to generate business impact metrics
  const getBusinessImpacts = (useCaseIndex: number) => {
    const impactSets = [
      [
        '32% reduced stockouts',
        '18% inventory cost reduction',
        '22% logistics cost savings'
      ],
      [
        '35% reduced wait times',
        '42% more efficient scheduling',
        '23% better patient outcomes'
      ],
      [
        '54% deflection rate',
        '50% faster resolution',
        '6 hours saved per agent weekly'
      ]
    ];
    
    return impactSets[useCaseIndex % impactSets.length];
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      {/* Title */}
      <div className="w-full bg-blue-800 text-white rounded-lg p-4 mb-6">
        <h1 className="text-center text-2xl font-bold">
          ServiceNow Agentic AI Use Cases Comparison
        </h1>
      </div>
      
      {/* Use Case Selection */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Select Use Cases to Compare (up to 3):</h2>
        <div className="flex flex-wrap gap-2">
          {workflowData.use_cases.map((useCase: UseCase) => (
            <button
              key={useCase.sys_id}
              onClick={() => toggleUseCaseSelection(useCase.sys_id)}
              className={`px-3 py-1 rounded-lg border ${
                selectedUseCases.includes(useCase.sys_id)
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {useCase.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Use Case Navigation and Comparison Grid */}
      <div className="flex items-center mb-6">
        {/* Previous Button */}
        <button 
          onClick={handlePrevious}
          className="flex-none bg-blue-600 hover:bg-blue-700 text-white h-full p-3 rounded-lg mr-2"
          aria-label="Previous use cases"
          title="Previous use cases"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Use Case Grid */}
        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {useCasesToDisplay.map((useCase: UseCase, index: number) => {
            const colorScheme = getUseCaseColorScheme(index);
            
            // Get agents for this use case
            const useCaseAgents = (useCase.agents || []).map((agentRef: any) => {
              const agentDetails = workflowData.agents[agentRef.sys_id];
              return agentDetails || { sys_id: agentRef.sys_id, name: agentRef.name || "Unknown Agent" };
            });
            
            return (
              <div key={useCase.sys_id} className="flex flex-col h-full">
                {/* Use Case Header */}
                <div className={`rounded-lg ${colorScheme.title} p-3 mb-1`}>
                  <h2 className="text-center font-bold">{useCase.name}</h2>
                </div>
                
                {/* Loop through agents */}
                {useCaseAgents.map((agent: Agent, agentIndex: number) => {
                  // Get agent tools
                  const agentTools = agent.tools || [];
                  
                  return (
                    <div 
                      key={agent.sys_id} 
                      className={`border-2 ${colorScheme.agent} rounded-lg p-3 mb-3`}
                    >
                      <h3 className={`text-center font-bold ${colorScheme.text} mb-1`}>
                        {agent.name}
                      </h3>
                      <p className="text-center text-sm mb-2">
                        {agent.description || getAgentDescription(agent.name)}
                      </p>
                      
                      {/* Tools Section */}
                      <div className={`border ${colorScheme.tool} rounded-lg p-2 mb-1`}>
                        <h4 className={`text-center text-sm font-bold ${colorScheme.text} mb-1`}>
                          TOOLS
                        </h4>
                        <ul className="space-y-1">
                          {agentTools.map((tool: AgentTools) => {
                            const toolDetail = workflowData.tools[tool.sys_id];
                            const toolTypeClass = toolDetail?.type === 'capability' ? 'Natural Language' : 'Flow actions';
                            const iconClass = toolDetail?.type === 'capability' ? 'text-purple-600' : 'text-blue-600';
                            
                            return (
                              <li key={tool.sys_id} className="flex items-center text-sm">
                                <span className={`${iconClass} mr-2`}>•</span>
                                <span className={`${colorScheme.text}`}>
                                  {getToolDisplayText(tool, toolDetail)}
                                </span>
                              </li>
                            );
                          })}
                          {agentTools.length === 0 && (
                            <li className="text-center text-gray-500 text-sm">No tools assigned</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  );
                })}
                
                {/* Business Impact */}
                <div className={`mt-auto rounded-lg ${colorScheme.impact} p-2`}>
                  <h3 className="text-center font-bold mb-1">Business Impact</h3>
                  <ul className="space-y-1 text-sm">
                    {getBusinessImpacts(index).map((impact, i) => (
                      <li key={i} className="flex items-center justify-center">
                        <span className="mr-1">•</span>
                        <span>{impact}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* View Details Link */}
                <div className="mt-2 text-center">
                  <Link 
                    href={`/use-case-view?usecase=${useCase.sys_id}`} 
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Next Button */}
        <button 
          onClick={handleNext}
          className="flex-none bg-blue-600 hover:bg-blue-700 text-white h-full p-3 rounded-lg ml-2"
          aria-label="Next use cases"
          title="Next use cases"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
      
      {/* Common Agent Capabilities Footer */}
      <div className="border-2 border-gray-300 rounded-lg p-3 my-6 bg-gray-50 text-center">
        <h3 className="font-semibold">Common AI Agent Capabilities: Autonomous Decision-Making • Context Awareness • Tool Integration • Human-in-the-Loop</h3>
        <p className="text-sm mt-1">Built on ServiceNow's AI Agent Studio - Available Q1 2025</p>
      </div>
    </div>
  );
};

export default UseCaseComparisonView; 