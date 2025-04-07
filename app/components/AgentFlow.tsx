'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Handle,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  MarkerType,
  useReactFlow,
  Node,
  Edge,
  Connection,
  EdgeChange,
  NodeChange,
  applyEdgeChanges,
  applyNodeChanges,
  NodeTypes,
  EdgeTypes,
  Position
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import AgentNode from './AgentNode';
import ToolNode from './ToolNode';
import TriggerNode from './TriggerNode';
import UseCaseNode from './UseCaseNode';
import CapabilityNode from './CapabilityNode';
import { motion } from 'framer-motion';

// Define custom node types
const nodeTypes = {
  agent: (props: any) => <AgentNode {...props} />,
  tool: (props: any) => <ToolNode {...props} />,
  trigger: (props: any) => <TriggerNode {...props} />,
  usecase: (props: any) => <UseCaseNode {...props} />,
  capability: (props: any) => <CapabilityNode {...props} />,
  // default and input types are built-in
};

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
  type: 'subflow' | 'capability' | string;
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

interface AgentFlowProps {
  className?: string;
}

export default function AgentFlow({ className = '' }: AgentFlowProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [workflowData, setWorkflowData] = useState<WorkflowData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      
      try {
        // First, try to get from localStorage (from our API call)
        const cachedData = localStorage?.getItem('workflow-data');
        
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData);
            console.log('Using cached data:', parsedData);
            
            // Handle different data structures
            const workflowData = parsedData.data || parsedData;
            
            setWorkflowData({
              use_cases: workflowData.use_cases || workflowData.useCases || [],
              agents: workflowData.agents || {},
              tools: workflowData.tools || {},
              capabilities: workflowData.capabilities || {},
              triggers: workflowData.triggers || {},
              execution: workflowData.execution || { 
                timestamp: new Date().toISOString(), 
                source: 'localStorage' 
              }
            });
            setLoading(false);
            return;
          } catch (e) {
            console.error('Error parsing localStorage data:', e);
            // Fall through to fetch from file
          }
        }
        
        // Fallback: Fetch from static file
        const response = await fetch('/workflow-data.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch workflow data: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched data from file:', data);
        
        // Handle both formats - direct data or wrapped in a response object
        const workflowData = data.data || data;
        
        // Ensure we transform the data to match our expected structure for visualization
        setWorkflowData({
          use_cases: workflowData.use_cases || workflowData.useCases || [],
          agents: workflowData.agents || {},
          tools: workflowData.tools || {},
          capabilities: workflowData.capabilities || {},
          triggers: workflowData.triggers || {},
          execution: workflowData.execution || { 
            timestamp: new Date().toISOString(),
            source: 'static file' 
          }
        });
      } catch (err: any) {
        console.error('Error fetching workflow data:', err);
        setError(err.message || 'Failed to load workflow data');
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  useEffect(() => {
    if (workflowData) {
      const transformedNodes: Node[] = [];
      const transformedEdges: Edge[] = [];
      
      // Track node positions and IDs
      const nodePositions: Record<string, { x: number, y: number }> = {};
      const nodeIds: Record<string, string> = {};
      
      // Vertical position variables
      const yLevels = {
        trigger: 50,
        useCase: 200,
        agent: 400,
        tool: 600,
        capability: 800,
        genaiConfig: 1000
      };
      
      // Horizontal spacing
      const xOffset = 350; // Increased for better spacing between phase columns
      const phaseOffset = 350; // Spacing between phases
      const startX = 100;
      
      // --- 1. Create Trigger Nodes ---
      const triggerIds: Record<string, string> = {};
      if (workflowData.triggers) {
        let xPos = startX;
        Object.entries(workflowData.triggers).forEach(([key, trigger]) => {
          const nodeId = `trigger-${trigger.sys_id}`;
          triggerIds[trigger.sys_id] = nodeId;
          
          const position = { x: xPos, y: yLevels.trigger };
          nodePositions[nodeId] = position;
          
          transformedNodes.push({
            id: nodeId,
            type: 'trigger',
            position,
            data: {
              label: trigger.objective_template?.split(' ')[0] || `Trigger (${trigger.sys_id.substring(0, 8)})`,
              description: trigger.objective_template || '',
              condition: trigger.condition || '',
              target_table: trigger.target_table || ''
            }
          });
          
          xPos += xOffset;
        });
      }
      
      // --- 2. Create Use Case Nodes grouped by phase ---
      const useCaseIds: Record<string, string> = {};
      if (workflowData.use_cases) {
        // Group use cases by phase
        const phaseGroups: Record<string, UseCase[]> = {};
        const phaseOrder: string[] = [];
        
        // First pass - group by phase and collect unique phases
        workflowData.use_cases.forEach(useCase => {
          const phase = useCase.process_flow?.phase || 'unknown';
          if (!phaseGroups[phase]) {
            phaseGroups[phase] = [];
            phaseOrder.push(phase);
          }
          phaseGroups[phase].push(useCase);
        });
        
        // Sort phases alphabetically
        phaseOrder.sort();
        
        // Position nodes by phase in columns
        let phaseX = startX;
        
        phaseOrder.forEach(phase => {
          // Sort use cases within each phase by sequence number
          const useCases = phaseGroups[phase].sort((a, b) => {
            const aSeq = a.process_flow?.sequence_number ?? 999;
            const bSeq = b.process_flow?.sequence_number ?? 999;
            return aSeq - bSeq;
          });
          
          // Create a column of use cases for this phase
          let yPos = yLevels.useCase;
          
          // Add a phase header node
          const phaseHeaderId = `phase-${phase}`;
          transformedNodes.push({
            id: phaseHeaderId,
            type: 'default',
            position: { x: phaseX, y: yLevels.useCase - 100 },
            data: { 
              label: `Phase: ${phase.charAt(0).toUpperCase() + phase.slice(1)}` 
            },
            style: {
              background: '#e6f3ff',
              color: '#0066cc',
              border: '1px solid #99ccff',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: 'bold',
              width: 'auto'
            }
          });
          
          useCases.forEach(useCase => {
            const nodeId = `usecase-${useCase.sys_id}`;
            useCaseIds[useCase.sys_id] = nodeId;
            
            // Position in current phase column
            const position = { x: phaseX, y: yPos };
            nodePositions[nodeId] = position;
            
            transformedNodes.push({
              id: nodeId,
              type: 'usecase',
              position,
              data: { 
                label: useCase.process_flow ? `${useCase.process_flow.sequence_number}. ${useCase.name}` : useCase.name,
                description: useCase.description || '',
                processFlow: useCase.process_flow || {
                  sequence_number: 0,
                  input_artifacts: [],
                  output_artifacts: []
                },
                artifacts: {
                  inputs: useCase.process_flow?.input_artifacts || [],
                  outputs: useCase.process_flow?.output_artifacts || []
                }
              }
            });
            
            // Create Edges: Trigger -> UseCase
            if (useCase.triggers) {
              useCase.triggers.forEach(triggerRef => {
                const triggerNodeId = triggerIds[triggerRef.sys_id];
                if (triggerNodeId) {
                  transformedEdges.push({
                    id: `e-${triggerNodeId}-${nodeId}`,
                    source: triggerNodeId,
                    target: nodeId,
                    animated: true,
                    type: 'smoothstep',
                    style: { stroke: '#ff9900' }
                  });
                }
              });
            }
            
            yPos += 250; // Vertical spacing between use cases in the same phase
          });
          
          phaseX += phaseOffset; // Move to next phase column
        });
        
        // Create Process Flow Edges between use cases (after all nodes are positioned)
        workflowData.use_cases.forEach(useCase => {
          if (useCase.process_flow?.next_use_cases) {
            useCase.process_flow.next_use_cases.forEach(nextId => {
              const sourceNodeId = useCaseIds[useCase.sys_id];
              const targetNodeId = useCaseIds[nextId];
              
              if (sourceNodeId && targetNodeId) {
                transformedEdges.push({
                  id: `flow-${sourceNodeId}-${targetNodeId}`,
                  source: sourceNodeId,
                  target: targetNodeId,
                  animated: true,
                  type: 'smoothstep',
                  style: { stroke: '#5577ff', strokeWidth: 3 },
                  markerEnd: { type: MarkerType.ArrowClosed, color: '#5577ff' },
                  label: 'Next Step',
                  labelStyle: { fill: '#5577ff', fontWeight: 'bold' }
                });
              }
            });
          }
        });
      }
      
      // --- 3. Create Agent Nodes ---
      const agentIds: Record<string, string> = {};
      if (workflowData.agents) {
        Object.entries(workflowData.agents).forEach(([key, agent]) => {
          const nodeId = `agent-${agent.sys_id}`;
          agentIds[agent.sys_id] = nodeId;
          
          // Find associated use case to position agent below
          const associatedUseCase = workflowData.use_cases.find(uc => 
            uc.agents && uc.agents.some(a => a.sys_id === agent.sys_id));
          
          // Position agent below its use case if found
          let position;
          if (associatedUseCase) {
            const useCaseNodeId = useCaseIds[associatedUseCase.sys_id];
            const useCasePos = nodePositions[useCaseNodeId];
            if (useCasePos) {
              // Position agent directly below its use case
              position = { x: useCasePos.x, y: useCasePos.y + 150 };
            } else {
              // Fallback positioning - should rarely happen
              position = { x: startX, y: yLevels.agent };
            }
          } else {
            // Position unassociated agents at the bottom
            position = { x: startX, y: yLevels.agent + 200 };
          }
          
          nodePositions[nodeId] = position;
          
          transformedNodes.push({
            id: nodeId,
            type: 'agent',
            position,
            data: { 
              label: agent.name, 
              description: agent.description || '' 
            }
          });
          
          // Create Edge: UseCase -> Agent
          workflowData.use_cases.forEach(useCase => {
            if (useCase.agents) {
              const matchingAgent = useCase.agents.find(a => a.sys_id === agent.sys_id);
              if (matchingAgent) {
                const useCaseNodeId = useCaseIds[useCase.sys_id];
                if (useCaseNodeId) {
                  transformedEdges.push({
                    id: `e-${useCaseNodeId}-${nodeId}`,
                    source: useCaseNodeId,
                    target: nodeId,
                    animated: true,
                    type: 'smoothstep',
                    style: { stroke: '#00aaff' }
                  });
                }
              }
            }
          });
        });
      }
      
      // --- 4. Create Tool Nodes ---
      const toolIds: Record<string, string> = {};
      const toolsByAgent: Record<string, string[]> = {};
      
      if (workflowData.tools) {
        // First, group tools by agent
        Object.entries(workflowData.agents).forEach(([agentKey, agent]) => {
          if (agent.tools && agent.tools.length > 0) {
            toolsByAgent[agent.sys_id] = agent.tools.map(t => t.sys_id);
          }
        });
        
        // Then create tool nodes
        Object.entries(workflowData.tools).forEach(([key, tool]) => {
          const nodeId = `tool-${tool.sys_id}`;
          toolIds[tool.sys_id] = nodeId;
          
          // Find which agents use this tool
          const agentsSharingTool: string[] = [];
          Object.entries(toolsByAgent).forEach(([agentId, toolIds]) => {
            if (toolIds.includes(tool.sys_id)) {
              agentsSharingTool.push(agentId);
            }
          });
          
          // Position tool based on its first agent
          let position;
          if (agentsSharingTool.length > 0) {
            const agentNodeId = `agent-${agentsSharingTool[0]}`;
            const agentPos = nodePositions[agentNodeId];
            if (agentPos) {
              // Position tool below its agent
              position = { x: agentPos.x, y: agentPos.y + 150 };
            } else {
              // Fallback position
              position = { x: startX, y: yLevels.tool };
            }
          } else {
            // Position unassociated tools at the bottom
            position = { x: startX + 100, y: yLevels.tool + 200 };
          }
          
          nodePositions[nodeId] = position;
          
          transformedNodes.push({
            id: nodeId,
            type: 'tool',
            position,
            data: {
              label: tool.name,
              description: tool.description || '',
              type: tool.type || 'unknown'
            }
          });
          
          // Create Edge: Agent -> Tool
          Object.entries(workflowData.agents).forEach(([agentKey, agent]) => {
            if (agent.tools) {
              const matchingTool = agent.tools.find(t => t.sys_id === tool.sys_id);
              if (matchingTool) {
                const agentNodeId = `agent-${agent.sys_id}`;
                transformedEdges.push({
                  id: `e-${agentNodeId}-${nodeId}`,
                  source: agentNodeId,
                  target: nodeId,
                  animated: true,
                  type: 'smoothstep',
                  style: { stroke: '#00cc88' },
                  label: matchingTool.name
                });
              }
            }
          });
        });
      }
      
      // --- 5. Create Capability Nodes ---
      const capabilityIds: Record<string, string> = {};
      if (workflowData.capabilities) {
        Object.entries(workflowData.capabilities).forEach(([key, capability]) => {
          const nodeId = `capability-${capability.sys_id}`;
          capabilityIds[capability.sys_id] = nodeId;
          
          // Find which tool uses this capability
          const linkedTools = Object.entries(workflowData.tools).filter(
            ([_, tool]) => tool.type === 'capability' && 
                          tool.target_document_table === capability.sys_id
          );
          
          let position;
          if (linkedTools.length > 0) {
            const toolNodeId = `tool-${linkedTools[0][1].sys_id}`;
            const toolPos = nodePositions[toolNodeId];
            if (toolPos) {
              position = { x: toolPos.x, y: yLevels.capability };
            } else {
              position = { x: startX + Object.keys(capabilityIds).length * xOffset, y: yLevels.capability };
            }
          } else {
            position = { x: startX + Object.keys(capabilityIds).length * xOffset, y: yLevels.capability };
          }
          
          nodePositions[nodeId] = position;
          
          transformedNodes.push({
            id: nodeId,
            type: 'capability',
            position,
            data: {
              label: capability.name,
              description: capability.description || '',
              type: capability.type || 'unknown'
            }
          });
          
          // Create Edge: Tool -> Capability
          Object.entries(workflowData.tools).forEach(([toolKey, tool]) => {
            if (tool.type === 'capability' && tool.target_document_table === capability.sys_id) {
              const toolNodeId = `tool-${tool.sys_id}`;
              transformedEdges.push({
                id: `e-${toolNodeId}-${nodeId}`,
                source: toolNodeId,
                target: nodeId,
                animated: false,
                type: 'smoothstep',
                style: { stroke: '#9966ff' },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#9966ff' }
              });
            }
          });
        });
      }
      
      // Set the final nodes and edges
      setNodes(transformedNodes);
      setEdges(transformedEdges);
    }
  }, [workflowData]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    [setEdges]
  );

  if (loading) {
    return <div className="flex justify-center items-center h-64"><p>Loading workflow data...</p></div>;
  }
  
  if (error) {
    return <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded">{error}</div>;
  }
  
  if (!workflowData || !workflowData.use_cases || workflowData.use_cases.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-4 rounded">
        <h3 className="font-bold">No workflow data available</h3>
        <p>There is no workflow data to display. Please fetch data from the dashboard first.</p>
      </div>
    );
  }

  // Group use cases by phase
  const phaseGroups = workflowData.use_cases.reduce((groups: Record<string, UseCase[]>, useCase) => {
    const phase = useCase.process_flow?.phase || 'Unknown';
    if (!groups[phase]) {
      groups[phase] = [];
    }
    groups[phase].push(useCase);
    return groups;
  }, {}) || {};
  
  // Sort phases in a logical order
  const orderedPhases = Object.keys(phaseGroups).sort((a, b) => {
    const phaseOrder: Record<string, number> = {
      'Drafting': 1,
      'Review': 2,
      'Approval': 3,
      'Published': 4,
      'In Progress': 5,
      'Submitted': 5,
      'Evaluation': 6,
      'Selection': 7,
      'Closed': 8,
      'Unknown': 99
    };
    
    return (phaseOrder[a] || 50) - (phaseOrder[b] || 50);
  });

  // Display transform info if available
  const transformInfo = workflowData?.script_execution_info ? (
    <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded mb-2">
      Data processed using script execution info 
      at {new Date(workflowData.script_execution_info.executed_at).toLocaleString()}
    </div>
  ) : null;

  // Simple phase legend
  const phaseLegend = (
    <div className="flex flex-wrap gap-3 text-xs p-2 bg-white rounded shadow-sm mb-2">
      <div className="font-semibold">Phases: </div>
      {workflowData?.use_cases && Array.from(new Set(workflowData.use_cases.map(uc => uc.process_flow?.phase || 'unknown')))
        .sort()
        .map(phase => (
          <div key={phase} className="bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
            {phase.charAt(0).toUpperCase() + phase.slice(1)}
          </div>
        ))
      }
    </div>
  );

  return (
    <div className={`${className} p-6 bg-white rounded-lg shadow`}>
      <h2 className="text-2xl font-bold mb-6">Agentic AI Workflow by Phase</h2>
      
      <div className="text-sm text-gray-500 mb-4">
        <p>Data source: {workflowData.execution?.source || 'Unknown'}</p>
        <p>Last updated: {workflowData.execution?.timestamp ? new Date(workflowData.execution.timestamp).toLocaleString() : 'Unknown'}</p>
        <p>Total use cases: {workflowData.use_cases.length}</p>
      </div>
      
      <div className="flex flex-col space-y-6">
        {orderedPhases.map((phase, phaseIndex) => (
          <div key={phase} className="border rounded-lg p-4">
            <h3 className="text-xl font-semibold mb-3">{phase}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {phaseGroups[phase].map((useCase, caseIndex) => (
                <motion.div
                  key={useCase.sys_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * caseIndex }}
                  className="bg-blue-50 border border-blue-200 rounded p-4 hover:shadow-md transition-shadow"
                >
                  <h4 className="font-medium text-blue-800">{useCase.name}</h4>
                  
                  {useCase.description && (
                    <p className="text-sm text-gray-600 mt-2">{useCase.description}</p>
                  )}
                  
                  {useCase.process_flow?.input_artifacts && useCase.process_flow.input_artifacts.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500">Inputs: {useCase.process_flow.input_artifacts.length}</p>
                    </div>
                  )}
                  
                  {useCase.process_flow?.output_artifacts && useCase.process_flow.output_artifacts.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-500">Outputs: {useCase.process_flow.output_artifacts.length}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {transformInfo}
      {phaseLegend}
    </div>
  );
} 