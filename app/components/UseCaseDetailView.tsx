'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

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

interface TriggerRef {
  sys_id: string;
  name?: string;
  condition?: string;
  target_table?: string;
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
  triggers?: TriggerRef[];
}

interface UseCaseDetailViewProps {
  initialWorkflowData: any;
  initialSelectedUseCaseId?: string;
}

export const UseCaseDetailView: React.FC<UseCaseDetailViewProps> = ({ 
  initialWorkflowData, 
  initialSelectedUseCaseId 
}) => {
  const [workflowData, setWorkflowData] = useState(initialWorkflowData);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  
  const [activeUseCaseId, setActiveUseCaseId] = useState<string | null>(
    initialSelectedUseCaseId || searchParams?.get('usecase') || null
  );

  useEffect(() => {
    const checkLocalStorage = () => {
      const storedDataString = localStorage.getItem('workflow-data');
      if (storedDataString) {
        try {
          const storedData = JSON.parse(storedDataString);
          const currentData = storedData.data || storedData;
          
          if (JSON.stringify(currentData) !== JSON.stringify(initialWorkflowData)) {
            console.log('Updating UseCaseDetailView data from localStorage...');
            setWorkflowData(currentData);
          }
        } catch (e) {
          console.error("Error reading or parsing detail view data from localStorage:", e);
        }
      }
    };
    
    checkLocalStorage();
  }, [initialWorkflowData]);

  useEffect(() => {
    if (!workflowData || !workflowData.use_cases || workflowData.use_cases.length === 0) {
      return;
    }
    
    let currentSelectedId = activeUseCaseId;

    if (!currentSelectedId && workflowData.use_cases.length > 0) {
      currentSelectedId = workflowData.use_cases[0].sys_id;
      setActiveUseCaseId(currentSelectedId);
      
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('usecase', currentSelectedId as string);
      router.replace(`?${params.toString()}`, { scroll: false }); 
    }
    
  }, [workflowData, initialSelectedUseCaseId, router, searchParams, activeUseCaseId]);

  const handleUseCaseChange = useCallback((newUseCaseId: string) => {
    setActiveUseCaseId(newUseCaseId);
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('usecase', newUseCaseId);
    router.push(`${pathname}?${newSearchParams.toString()}`);
  }, [router, pathname]);

  useEffect(() => {
    if (typeof activeUseCaseId === 'string' && typeof window !== 'undefined') {
      const idAsString: string = activeUseCaseId;
      const currentSearchParams = new URLSearchParams(window.location.search);
      const currentUseCaseId = currentSearchParams.get('usecase');

      if (idAsString !== currentUseCaseId) {
        const newSearchParams = new URLSearchParams();
        newSearchParams.set('usecase', idAsString);
        router.replace(`${pathname}?${newSearchParams.toString()}`);
      }
    }
  }, [activeUseCaseId, pathname, router]);

  if (!workflowData || !workflowData.use_cases || workflowData.use_cases.length === 0) {
    return <div className="p-4 text-center">No use case data available</div>;
  }

  const activeUseCase = workflowData.use_cases.find(
    (uc: UseCase) => uc.sys_id === activeUseCaseId
  );

  if (!activeUseCase) {
    if (!(!activeUseCaseId && workflowData.use_cases.length > 0)) {
        return <div className="p-4 text-center">Selected use case not found or data is loading.</div>;
    }
    return null;
  }

  const useCaseTriggers = activeUseCase.triggers || [];
  
  const useCaseAgents = (activeUseCase.agents || []).map((agentRef: any) => {
    const agentDetails = workflowData.agents[agentRef.sys_id];
    return agentDetails || { sys_id: agentRef.sys_id, name: agentRef.name || "Unknown Agent" };
  });

  const workerAgents = useCaseAgents;

  const businessProblem = activeUseCase.description 
    ? `Addressing: ${activeUseCase.description.split('.')[0]}`
    : "Enhancing business operations and efficiency";

  const getGridCols = () => {
    const count = workerAgents.length;
    if (count === 1) return "grid-cols-1";
    if (count === 2) return "grid-cols-2";
    return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
  };

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto space-y-4 p-4">
      <div className="flex items-center justify-center mb-4">
        <select 
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5 w-full max-w-xl"
          value={activeUseCaseId || ''}
          onChange={(e) => handleUseCaseChange(e.target.value)}
        >
          {workflowData.use_cases.map((uc: UseCase) => (
            <option key={uc.sys_id} value={uc.sys_id}>
              {uc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="w-full border-2 border-blue-700 rounded-lg bg-blue-50 p-6">
        <h1 className="text-center text-2xl font-bold text-blue-700 mb-2">
          USE CASE: {activeUseCase.name.toUpperCase()}
        </h1>
        <p className="text-center text-lg text-blue-600">
          {activeUseCase.description}
        </p>
      </div>

      <div className="w-full border-2 border-red-400 rounded-lg bg-red-50 p-4">
        <h2 className="text-center text-xl font-bold text-red-600 mb-1">
          BUSINESS PROBLEM
        </h2>
        <p className="text-center text-lg text-red-500">{businessProblem}</p>
      </div>

      <div className="w-full border-2 border-blue-400 rounded-lg bg-blue-50 p-4">
        <h2 className="text-center text-xl font-bold text-blue-600 mb-1">
          TRIGGERS
        </h2>
        <div className="flex flex-wrap justify-center gap-8 p-2">
          {useCaseTriggers.length > 0 ? (
            useCaseTriggers.map((trigger: TriggerRef) => (
              <div key={trigger.sys_id} className="flex items-center">
                <span className="text-blue-600 mr-2">•</span>
                <span className="text-blue-600">
                  {trigger.name || "Unnamed Trigger"}
                  {trigger.condition && ` (${trigger.condition})`}
                </span>
              </div>
            ))
          ) : (
            <span className="text-blue-600">No triggers defined</span>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="border-2 border-red-400 rounded-full bg-red-100 py-4 px-12 max-w-md">
          <h2 className="text-center text-xl font-bold text-red-600 mb-1">
            ORCHESTRATOR AGENT
          </h2>
          <p className="text-center text-sm text-red-400">Provides end-to-end process orchestration and control</p>
        </div>
      </div>

      {workerAgents.length > 0 && (
        <div className="flex justify-center h-8">
          <div className="w-0.5 h-full bg-red-400"></div>
        </div>
      )}

      <div className="flex justify-center">
        <div className={`grid ${getGridCols()} gap-4 max-w-4xl`}>
          {workerAgents.map((agent: Agent) => {
            const agentTools = agent.tools || [];
            const colorScheme = getColorScheme(agent.sys_id);
            
            return (
              <div 
                key={agent.sys_id} 
                className={`border-2 ${colorScheme.border} rounded-lg ${colorScheme.bg} p-4`}
              >
                <h3 className={`text-center text-lg font-bold ${colorScheme.text} mb-1 uppercase`}>
                  {agent.name}
                </h3>
                <p className={`text-center ${colorScheme.textLight} mb-3`}>
                  Worker Agent
                </p>
                
                <div className={`border-2 ${colorScheme.border} rounded-lg ${colorScheme.bgLight} p-3 mb-1`}>
                  <h4 className={`text-center font-bold ${colorScheme.text} mb-2`}>
                    TOOLS
                  </h4>
                  <ul className="space-y-1">
                    {agentTools.map((tool: AgentTools) => (
                      <li key={tool.sys_id} className="flex items-start">
                        <span className={`${colorScheme.text} mr-2`}>•</span>
                        <span className={`${colorScheme.text}`}>
                          {getToolDisplayText(tool, workflowData)}
                        </span>
                      </li>
                    ))}
                    {agentTools.length === 0 && (
                      <li className={`text-center ${colorScheme.textLight}`}>No tools assigned</li>
                    )}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full border-2 border-blue-700 rounded-lg bg-blue-50 p-4 mt-4">
        <h2 className="text-center text-xl font-bold text-blue-700 mb-1">
          VALUE DRIVERS
        </h2>
        <div className="flex flex-wrap justify-center gap-8 p-2">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">•</span>
            <span className="text-blue-600">Improved process efficiency</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">•</span>
            <span className="text-blue-600">Reduced manual effort</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">•</span>
            <span className="text-blue-600">Enhanced customer experience</span>
          </div>
        </div>
      </div>
    </div>
  );
};

function getColorScheme(agentId: string) {
  const colorSchemes = [
    {
      border: 'border-green-600',
      bg: 'bg-green-100',
      bgLight: 'bg-green-50',
      text: 'text-green-700',
      textLight: 'text-green-600'
    },
    {
      border: 'border-blue-500',
      bg: 'bg-blue-100',
      bgLight: 'bg-blue-50',
      text: 'text-blue-700',
      textLight: 'text-blue-600'
    },
    {
      border: 'border-orange-500',
      bg: 'bg-orange-100',
      bgLight: 'bg-orange-50',
      text: 'text-orange-700',
      textLight: 'text-orange-600'
    },
    {
      border: 'border-purple-500',
      bg: 'bg-purple-100',
      bgLight: 'bg-purple-50',
      text: 'text-purple-700',
      textLight: 'text-purple-600'
    },
    {
      border: 'border-cyan-600',
      bg: 'bg-cyan-100',
      bgLight: 'bg-cyan-50',
      text: 'text-cyan-700',
      textLight: 'text-cyan-600'
    }
  ];
  
  const index = agentId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colorSchemes.length;
  return colorSchemes[index];
}

function getToolDisplayText(tool: AgentTools, workflowData: any) {
  const toolDetail = workflowData.tools[tool.sys_id];
  if (!toolDetail) return tool.name;
  
  let prefix = '';
  if (toolDetail.type === 'capability') {
    prefix = 'Skills: ';
  } else if (toolDetail.type === 'subflow') {
    prefix = 'Flow actions: ';
  }
  
  return `${prefix}${tool.name}`;
}

export default UseCaseDetailView; 