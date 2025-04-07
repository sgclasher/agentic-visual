'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ProcessFlowTimeline, { generatePhasesFromUseCases } from './ProcessFlowTimeline';
import AnimatedWorkflow from './AnimatedWorkflow';
import BusinessImpactMetrics from './BusinessImpactMetrics';

// Define proper typing for agent and use case data
interface Agent {
  sys_id: string;
  name: string;
  description?: string;
  tools?: AgentTool[];
}

interface AgentTool {
  sys_id: string;
  name?: string;
  type?: string;
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
  phase?: string;
  previous_use_cases?: string[];
  next_use_cases?: string[];
  input_artifacts?: string[];
  output_artifacts?: string[];
}

interface UseCase {
  sys_id: string;
  name: string;
  description?: string;
  agents?: AgentRef[];
  triggers?: TriggerRef[];
  process_flow?: ProcessFlow;
}

interface WorkflowData {
  use_cases: UseCase[];
  agents: { [key: string]: Agent };
  tools: { [key: string]: any };
  capabilities: { [key: string]: any };
}

interface ExecutiveAgenticWorkflowViewProps {
  initialWorkflowData: WorkflowData;
}

export const ExecutiveAgenticWorkflowView: React.FC<ExecutiveAgenticWorkflowViewProps> = ({ initialWorkflowData }) => {
  const [workflowData, setWorkflowData] = useState<WorkflowData>(initialWorkflowData);
  const [activePhaseIndex, setActivePhaseIndex] = useState<number>(0);
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null);
  const [expandedInfo, setExpandedInfo] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('agents');
  
  useEffect(() => {
    const checkLocalStorage = () => {
      const storedDataString = localStorage.getItem('workflow-data');
      if (storedDataString) {
        try {
          const storedData = JSON.parse(storedDataString);
          const currentData = storedData.data || storedData;
          
          if (JSON.stringify(currentData) !== JSON.stringify(initialWorkflowData)) {
            console.log('Updating workflow data from localStorage...');
            setWorkflowData(currentData);
          }
        } catch (e) {
          console.error("Error reading or parsing workflow data from localStorage:", e);
        }
      }
    };
    
    checkLocalStorage();

  }, [initialWorkflowData]);

  const sortedUseCases = useMemo(() => {
    return [...workflowData.use_cases].sort((a, b) => {
      const seqA = a.process_flow?.sequence_number || 999;
      const seqB = b.process_flow?.sequence_number || 999;
      return seqA - seqB;
    });
  }, [workflowData.use_cases]);

  const phases = useMemo(() => {
    return generatePhasesFromUseCases(sortedUseCases);
  }, [sortedUseCases]);

  const { uniqueAgentIds, uniqueToolIds } = useMemo(() => {
    const agentSet = new Set<string>();
    const toolSet = new Set<string>();
    
    sortedUseCases.forEach(useCase => {
      (useCase.agents || []).forEach((agent) => {
        agentSet.add(agent.sys_id);
        
        const agentDetails = workflowData.agents[agent.sys_id];
        (agentDetails?.tools || []).forEach((tool) => {
          toolSet.add(tool.sys_id);
        });
      });
    });

    return {
      uniqueAgentIds: agentSet,
      uniqueToolIds: toolSet
    };
  }, [sortedUseCases, workflowData.agents]);

  useEffect(() => {
    const savedIndex = localStorage.getItem('activePhaseIndex');
    if (savedIndex !== null) {
      const index = parseInt(savedIndex, 10);
      if (!isNaN(index) && index >= 0 && index < phases.length) {
        setActivePhaseIndex(index);
      } else {
        setActivePhaseIndex(0);
        localStorage.setItem('activePhaseIndex', '0');
      }
    } else {
      setActivePhaseIndex(0);
      localStorage.setItem('activePhaseIndex', '0');
    }
  }, [phases.length]);

  useEffect(() => {
    if (activePhaseIndex >= 0 && activePhaseIndex < phases.length) {
      const phase = phases[activePhaseIndex].name;
      const phaseUseCase = sortedUseCases.find(uc => uc.process_flow?.phase === phase);
      setSelectedUseCase(phaseUseCase ? phaseUseCase.sys_id : null);
    } else {
      setSelectedUseCase(null);
    }
  }, [activePhaseIndex, phases, sortedUseCases]);

  if (!workflowData || !workflowData.use_cases || workflowData.use_cases.length === 0) {
    return <div className="p-4 text-center">No use case data available</div>;
  }

  const handlePhaseClick = useCallback((index: number) => {
    setActivePhaseIndex(index);
    localStorage.setItem('activePhaseIndex', index.toString());
  }, []);

  const handleUseCaseClick = useCallback((useCaseId: string) => {
    setSelectedUseCase(selectedUseCase === useCaseId ? null : useCaseId);
  }, [selectedUseCase]);

  const toggleExpandedInfo = useCallback((infoType: string) => {
    setExpandedInfo(expandedInfo === infoType ? null : infoType);
  }, [expandedInfo]);

  const getUseCaseDetails = useCallback((useCaseId: string | null) => {
    if (!useCaseId) return null;
    
    const useCase = workflowData.use_cases.find(uc => uc.sys_id === useCaseId);
    if (!useCase) return null;
    
    const useCaseAgents = (useCase.agents || []).map((agentRef) => {
      const agentDetails = workflowData.agents[agentRef.sys_id];
      return agentDetails || { sys_id: agentRef.sys_id, name: agentRef.name || "Unknown Agent" };
    });
    
    const useCaseTriggers = useCase.triggers || [];
    
    return { useCase, agents: useCaseAgents, triggers: useCaseTriggers };
  }, [workflowData]);

  const selectedUseCaseDetails = useMemo(() => {
    return selectedUseCase ? getUseCaseDetails(selectedUseCase) : null;
  }, [selectedUseCase, getUseCaseDetails]);

  return (
    <div className="w-full max-w-7xl mx-auto">
      <motion.div 
        className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white rounded-lg p-2 mb-4 shadow-md"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-1 md:mb-0 mr-4">
            <h1 className="text-lg font-bold whitespace-nowrap">
              ServiceNow Agentic AI Executive Dashboard
            </h1>
          </div>
          
          <div className="flex items-center justify-end flex-shrink-0 md:space-x-3">
            <div className="bg-white/20 rounded px-2 py-0.5 text-center backdrop-blur-sm">
              <h3 className="text-base font-bold">{sortedUseCases.length}</h3>
              <p className="text-xs">Use Cases</p>
            </div>
            <div className="bg-white/20 rounded px-2 py-0.5 text-center backdrop-blur-sm">
              <h3 className="text-base font-bold">{uniqueAgentIds.size}</h3>
              <p className="text-xs">AI Agents</p>
            </div>
            <div className="bg-white/20 rounded px-2 py-0.5 text-center backdrop-blur-sm">
              <h3 className="text-base font-bold">{uniqueToolIds.size}</h3>
              <p className="text-xs">Tools & Capabilities</p>
            </div>
          </div>
        </div>
      </motion.div>
      
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <ProcessFlowTimeline 
          phases={phases}
          activePhaseIndex={activePhaseIndex}
          onPhaseClick={handlePhaseClick}
        />
      </motion.div>
      
      <div className="mb-6 flex border-b">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'agents' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('agents')}
        >
          Agentic Workflow
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'overview' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('overview')}
        >
          Process Overview
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === 'impact' 
              ? 'text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('impact')}
        >
          Business Impact
        </button>
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {selectedUseCaseDetails ? (
                <motion.div 
                  className="bg-white border border-gray-200 rounded-lg p-6 shadow-md"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex flex-col md:flex-row justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-blue-700 mb-2">{selectedUseCaseDetails.useCase.name}</h2>
                      <p className="text-gray-600 mb-3">{selectedUseCaseDetails.useCase.description}</p>
                    </div>
                    <div className="md:text-right mt-4 md:mt-0">
                      <Link 
                        href={`/use-case-view?usecase=${selectedUseCaseDetails.useCase.sys_id}`} 
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium"
                      >
                        View Detailed Diagram
                      </Link>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-700 mb-2">Process Inputs</h3>
                      <ul className="space-y-1">
                        {selectedUseCaseDetails.useCase.process_flow?.input_artifacts?.map((artifact: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-blue-500 mr-2">→</span>
                            <span>{artifact}</span>
                          </li>
                        )) || <li className="text-gray-500">No inputs specified</li>}
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-700 mb-2">Process Outputs</h3>
                      <ul className="space-y-1">
                        {selectedUseCaseDetails.useCase.process_flow?.output_artifacts?.map((artifact: string, index: number) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-500 mr-2">←</span>
                            <span>{artifact}</span>
                          </li>
                        )) || <li className="text-gray-500">No outputs specified</li>}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-700 mb-2">AI Agents Involved</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {selectedUseCaseDetails.agents.map((agent: Agent) => (
                        <div 
                          key={agent.sys_id}
                          className="border border-blue-200 bg-white rounded-lg p-3 hover:shadow-md transition-shadow"
                        >
                          <h4 className="font-medium text-blue-700">{agent.name}</h4>
                          <p className="text-sm text-gray-600">{agent.description || "Performs specialized tasks"}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ) : (
                 <div className="text-center text-gray-500 p-4 border rounded-lg bg-gray-50">
                    Select a phase from the timeline above to see details.
                 </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                  className="bg-white border border-gray-200 rounded-lg p-5 shadow-md cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => toggleExpandedInfo('automation')}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-xl font-bold text-blue-800 mb-2">Automation Insights</h3>
                  <p className="text-gray-600 mb-4">
                    ServiceNow's AI Agent technology enables end-to-end process automation with human-like reasoning and decision making.
                  </p>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${expandedInfo === 'automation' ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="font-semibold mb-2">Key Benefits</h4>
                      <ul className="space-y-1">
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span>Self-healing workflows that adapt to changing conditions</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span>Natural language understanding and response generation</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span>Orchestrated multi-agent collaboration for complex processes</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-2">•</span>
                          <span>Human-in-the-loop capabilities for oversight and complex decisions</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-3">
                    <button className="text-blue-600 hover:text-blue-800">
                      {expandedInfo === 'automation' ? 'Show Less' : 'Learn More'}
                    </button>
                  </div>
                </motion.div>
                
                <motion.div 
                  className="bg-white border border-gray-200 rounded-lg p-5 shadow-md cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => toggleExpandedInfo('value')}
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <h3 className="text-xl font-bold text-green-800 mb-2">Business Value</h3>
                  <p className="text-gray-600 mb-4">
                    Implementing agentic workflows delivers measurable ROI through operational efficiency and enhanced customer experiences.
                  </p>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${expandedInfo === 'value' ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="pt-3 border-t border-gray-200">
                      <h4 className="font-semibold mb-2">Value Metrics</h4>
                      <ul className="space-y-1">
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          <span>40-60% reduction in process execution time</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          <span>25-35% improvement in employee productivity</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          <span>50-70% decrease in manual intervention requirements</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-2">•</span>
                          <span>Dramatic improvement in data quality and compliance</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-3">
                    <button className="text-green-600 hover:text-green-800">
                      {expandedInfo === 'value' ? 'Show Less' : 'Learn More'}
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
          
          {activeTab === 'agents' && (
            selectedUseCaseDetails ? (
              <AnimatedWorkflow 
                useCase={selectedUseCaseDetails.useCase}
                agents={selectedUseCaseDetails.agents}
                triggers={selectedUseCaseDetails.triggers}
              />
            ) : (
               <div className="text-center text-gray-500 p-4 border rounded-lg bg-gray-50">
                  Select a phase from the timeline above to see the agentic workflow for that phase.
               </div>
            )
          )}
          
          {activeTab === 'impact' && (
             selectedUseCaseDetails ? (
               <BusinessImpactMetrics 
                 useCase={selectedUseCaseDetails.useCase} 
               />
             ) : (
                <div className="text-center text-gray-500 p-4 border rounded-lg bg-gray-50">
                   Select a phase from the timeline above to see the business impact for that phase.
                </div>
             )
          )}
        </motion.div>
      </AnimatePresence>
      
      <motion.div 
        className="bg-gradient-to-r from-indigo-50 to-blue-50 border border-blue-100 rounded-lg p-5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h3 className="text-xl font-bold text-center text-blue-800 mb-4">Agentic AI Implementation Journey</h3>
        <div className="flex flex-wrap justify-center">
          <div className="flex items-center mb-2 md:mb-0 mr-2 md:mr-6">
            <motion.div 
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2"
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >1</motion.div>
            <span className="text-blue-800">Discovery</span>
          </div>
          <div className="w-6 h-0.5 bg-blue-300 hidden md:block mr-2"></div>
          <div className="flex items-center mb-2 md:mb-0 mr-2 md:mr-6">
            <motion.div 
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2"
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >2</motion.div>
            <span className="text-blue-800">Planning</span>
          </div>
          <div className="w-6 h-0.5 bg-blue-300 hidden md:block mr-2"></div>
          <div className="flex items-center mb-2 md:mb-0 mr-2 md:mr-6">
            <motion.div 
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2"
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >3</motion.div>
            <span className="text-blue-800">Implementation</span>
          </div>
          <div className="w-6 h-0.5 bg-blue-300 hidden md:block mr-2"></div>
          <div className="flex items-center">
            <motion.div 
              className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center mr-2"
              whileHover={{ scale: 1.2 }}
              transition={{ type: "spring", stiffness: 300 }}
            >4</motion.div>
            <span className="text-blue-800">Optimization</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ExecutiveAgenticWorkflowView; 