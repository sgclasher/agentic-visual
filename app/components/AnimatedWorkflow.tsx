'use client';

import React, { useState, useCallback, useRef, useEffect, useMemo, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ReactFlow,
  Background, 
  Controls, 
  MiniMap, 
  Node, 
  Edge,
  Position,
  Handle,
  Panel,
  NodeToolbar,
  useReactFlow,
  NodeTypes,
  EdgeTypes,
  BaseEdge,
  EdgeProps,
  getSmoothStepPath,
  getEdgeCenter,
  NodeChange,
  applyNodeChanges,
  useNodes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { scaleLinear } from 'd3-scale';
import { interpolateBlues, interpolateGreens, interpolateOranges, interpolatePurples, interpolateReds } from 'd3-scale-chromatic';
import Dagre from '@dagrejs/dagre';
import dagre from '@dagrejs/dagre';

// Create a flow direction context
const FlowDirectionContext = createContext<{ direction: string }>({ direction: 'TB' });
const useFlowDirection = () => useContext(FlowDirectionContext);

// Custom node components
function OrchestrationNode({ data }: any) {
  return (
    <motion.div 
      className="px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Handle 
        id="target-top"
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-red-700" 
        style={{ top: -4, left: '50%' }}
      />
      <Handle 
        id="target-left"
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-red-700" 
        style={{ left: -4, top: '50%' }}
      />
      <div className="font-bold text-center text-lg">{data.label}</div>
      <div className="text-sm text-center">{data.description}</div>
      <Handle 
        id="source-bottom"
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-red-700" 
        style={{ bottom: -4, left: '50%' }}
      />
      <Handle 
        id="source-right"
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-red-700" 
        style={{ right: -4, top: '50%' }}
      />
    </motion.div>
  );
}

function AgentNode({ data }: any) {
  return (
    <motion.div 
      className={`px-5 py-4 rounded-lg ${data.color || 'bg-blue-600'} text-white shadow-lg`}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20, delay: data.index * 0.1 }}
      whileHover={{ scale: 1.03, y: -2, transition: { duration: 0.2 } }}
    >
      <Handle 
        id="target-top"
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-white border-2 border-blue-500"
        style={{ top: -4, left: '50%' }}
      />
      <Handle 
        id="target-left"
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-white border-2 border-blue-500"
        style={{ left: -4, top: '50%' }}
      />
      <div className="text-center">
        <div className="font-bold text-lg mb-1">{data.label}</div>
        <div className="text-sm opacity-90">{data.description}</div>
        {data.toolCount > 0 && (
          <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
            <span className="opacity-90">Tools: {data.toolCount}</span>
          </div>
        )}
      </div>
      <Handle 
        id="source-bottom"
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-white border-2 border-blue-500"
        style={{ bottom: -4, left: '50%' }}
      />
      <Handle 
        id="source-right"
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-white border-2 border-blue-500"
        style={{ right: -4, top: '50%' }}
      />
    </motion.div>
  );
}

function TriggerNode({ data }: any) {
  return (
    <motion.div 
      className="border-2 border-blue-500 bg-blue-100 px-4 py-2 rounded-lg shadow-lg w-[180px]"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <Handle 
        id="target-top" 
        type="target" 
        position={Position.Top}
        className="w-3 h-3 bg-blue-700"
        style={{ top: -4, left: '50%' }}
      />
      <Handle 
        id="target-left" 
        type="target" 
        position={Position.Left}
        className="w-3 h-3 bg-blue-700"
        style={{ left: -4, top: '50%' }}
      />
      <div className="font-bold text-blue-900">{data.label}</div>
      <div className="text-xs text-blue-700">{data.description || 'Trigger'}</div>
      <Handle 
        id="source-bottom" 
        type="source" 
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-700"
        style={{ bottom: -4, left: '50%' }}
      />
      <Handle 
        id="source-right" 
        type="source" 
        position={Position.Right}
        className="w-3 h-3 bg-blue-700"
        style={{ right: -4, top: '50%' }}
      />
    </motion.div>
  );
}

function ToolNode({ data }: any) {
  return (
    <motion.div 
      className="px-3 py-2 rounded-lg bg-gray-700 text-white"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15, delay: data.index * 0.05 + 0.3 }}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" style={{ opacity: 0 }} />
      <div className="font-bold text-center text-sm">{data.label}</div>
      <div className="text-xs text-center opacity-80">{data.type}</div>
    </motion.div>
  );
}

function ValueNode({ data }: any) {
  // Determine the color based on value type
  const getColorClass = () => {
    switch(data.valueType) {
      case 'agent': return 'bg-emerald-600'; // Agent-specific value
      case 'useCase': return 'bg-blue-600';  // Use case value
      case 'solution': return 'bg-purple-600'; // Overall solution value
      default: return 'bg-green-600'; // Default
    }
  };
  
  // Determine shadow class based on value type
  const getShadowClass = () => {
    switch(data.valueType) {
      case 'agent': return 'shadow-emerald-400/40'; 
      case 'useCase': return 'shadow-blue-400/40';
      case 'solution': return 'shadow-purple-400/40';
      default: return 'shadow-green-400/40';
    }
  };
  
  return (
    <motion.div 
      className={`px-4 py-2 rounded-full ${getColorClass()} text-white max-w-[220px] shadow-lg ${getShadowClass()}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.5 }}
      whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
    >
      <Handle 
        id="target-top"
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-white border-2 border-emerald-500" 
        style={{ top: -4, left: '50%' }}
      />
      <Handle 
        id="target-left"
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-white border-2 border-emerald-500" 
        style={{ left: -4, top: '50%' }}
      />
      <div className="font-bold text-center">{data.label}</div>
      <div className="text-xs opacity-80 text-center">{data.description}</div>
      <Handle 
        id="source-bottom"
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-white border-2 border-emerald-500" 
        style={{ bottom: -4, left: '50%' }}
      />
      <Handle 
        id="source-right"
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-white border-2 border-emerald-500" 
        style={{ right: -4, top: '50%' }}
      />
    </motion.div>
  );
}

// New component to show all tools in one stacked node
function ToolsGroupNode({ data }: any) {
  return (
    <motion.div 
      className="px-4 py-3 rounded-lg bg-gray-700 text-white"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
    >
      <Handle 
        id="target-top"
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-gray-500" 
        style={{ top: -4, left: '50%' }}
      />
      <Handle 
        id="target-left"
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-gray-500" 
        style={{ left: -4, top: '50%' }}
      />
      {data.tools.map((tool: any, index: number) => (
        <div key={index} className={`${index > 0 ? 'mt-3 pt-3 border-t border-gray-500' : ''}`}>
          <div className="font-bold text-center text-sm">{tool.name}</div>
          <div className="text-xs text-center opacity-80">{tool.type}</div>
        </div>
      ))}
      <Handle 
        id="source-bottom"
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-gray-500" 
        style={{ bottom: -4, left: '50%' }}
      />
      <Handle 
        id="source-right"
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-gray-500" 
        style={{ right: -4, top: '50%' }}
      />
    </motion.div>
  );
}

// Define custom node types
const nodeTypes = {
  orchestratorNode: (props: any) => <OrchestrationNode {...props} />,
  agentNode: (props: any) => <AgentNode {...props} />,
  triggerNode: (props: any) => <TriggerNode {...props} />,
  toolNode: (props: any) => <ToolNode {...props} />,
  toolsGroupNode: (props: any) => <ToolsGroupNode {...props} />,
  valueNode: (props: any) => <ValueNode {...props} />
};

// Utility functions for floating edges
const getNodePositionWithOrientation = (
  node: Node,
  handle?: string | null,
): [number, number, string] => {
  const position = node.position;
  // Calculate the center of the node - fallback to estimated sizes if computed is not available
  const nodeWidth = node.width ?? 175;  // Estimated average node width
  const nodeHeight = node.height ?? 80; // Estimated average node height
  const centerX = position.x + nodeWidth / 2;
  const centerY = position.y + nodeHeight / 2;

  // Get the source/target position based on the centerpoint of the node
  return [centerX, centerY, 'center'];
};

const getHandlePosition = (
  position: [number, number, string],
  nodeWidth: number,
  nodeHeight: number,
): [number, number] => {
  const [x, y, orientation] = position;
  
  // Just return the center for simplicity
  return [x, y];
};

export function FloatingEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  selected,
}: EdgeProps) {
  // Get source and target node positions
  const [edgePath, setEdgePath] = useState('');
  const [labelX, setLabelX] = useState(0);
  const [labelY, setLabelY] = useState(0);
  const { getNodes } = useReactFlow();

  useEffect(() => {
    // Get the actual nodes to determine exact handle positions
    const nodes = getNodes();
    const sourceNode = nodes.find(node => node.id === source);
    const targetNode = nodes.find(node => node.id === target);
    
    // Create a more pronounced curve for orchestration edges
    const isOrchestrationEdge = data?.type === 'orchestration';
    const isTriggerEdge = data?.type === 'trigger';
    
    // Adjust these parameters to control how the curve looks
    let curvature = isOrchestrationEdge ? 0.5 : 0.2;
    if (isTriggerEdge) curvature = 0.4; // Increase curvature for trigger edges
    
    // Calculate control points for the bezier curve
    const dx = Math.abs(targetX - sourceX);
    const dy = Math.abs(targetY - sourceY);
    
    let controlX1, controlY1, controlX2, controlY2;
    
    // Check if this is a trigger node connection
    if (sourceNode?.type === 'triggerNode' || targetNode?.type === 'triggerNode') {
      // For trigger connections, use a more pronounced horizontal curve
      // and ensure smooth connection to handles
      controlX1 = sourceX + dx * 0.6;
      controlY1 = sourceY;
      controlX2 = targetX - dx * 0.6;
      controlY2 = targetY;
      
      // Adjust for vertical offset if exists
      if (Math.abs(sourceY - targetY) > 20) {
        controlY1 = sourceY + (targetY - sourceY) * 0.3;
        controlY2 = targetY - (targetY - sourceY) * 0.3;
      }
    } else if (isOrchestrationEdge) {
      // For orchestration edges, create a more pronounced vertical curve
      controlX1 = sourceX;
      controlY1 = sourceY + dy * 0.6;
      controlX2 = targetX;
      controlY2 = targetY - dy * 0.6;
      
      // Adjust for horizontal offset if exists
      if (Math.abs(sourceX - targetX) > 20) {
        controlX1 = sourceX + (targetX - sourceX) * 0.3;
        controlX2 = targetX - (targetX - sourceX) * 0.3;
      }
    } else if (dx > dy) {
      // More horizontal arrangement
      controlX1 = sourceX + dx * curvature;
      controlY1 = sourceY;
      controlX2 = targetX - dx * curvature;
      controlY2 = targetY;
    } else {
      // More vertical arrangement
      controlX1 = sourceX;
      controlY1 = sourceY + dy * curvature;
      controlX2 = targetX;
      controlY2 = targetY - dy * curvature;
    }

    // Create bezier path
    const path = `M ${sourceX} ${sourceY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${targetX} ${targetY}`;
    setEdgePath(path);

    // Position for label
    setLabelX((sourceX + targetX) / 2);
    setLabelY((sourceY + targetY) / 2 - 10); // Move label slightly above the path
  }, [sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, data, source, target, getNodes]);

  const edgeType = data?.type as string || 'default';
  const edgeLabel = data?.label as React.ReactNode;
  
  return (
    <g>
      <path
        id={id}
        className={`react-flow__edge-path ${
          edgeType === 'orchestration' ? 'stroke-red-500' : 'stroke-blue-500'
        } ${selected ? 'stroke-[3px]' : 'stroke-[2px]'}`}
        d={edgePath}
        style={{
          ...style,
          strokeDasharray: edgeType === 'orchestration' ? '5,5' : 'none',
          strokeLinecap: 'round',
          animation: edgeType === 'orchestration' ? 'flow 0.5s linear infinite' : 'none',
        }}
      />
      {edgeLabel && (
        <foreignObject
          width={100}
          height={40}
          x={labelX - 50}
          y={labelY - 20}
          className="overflow-visible"
        >
          <div className="flex items-center justify-center text-xs px-2 py-1 bg-gray-700 text-white rounded-md shadow-md">
            {edgeLabel}
          </div>
        </foreignObject>
      )}
    </g>
  );
}

// Define custom edge types
const edgeTypes = {
  default: FloatingEdge,
  value: FloatingEdge,
  useCaseValue: FloatingEdge,
  solutionValue: FloatingEdge,
  trigger: FloatingEdge,
  orchestration: FloatingEdge,
};

// Add this in the global style section, after other style definitions
const globalStyles = `
  @keyframes flow {
    from {
      stroke-dashoffset: 10;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  
  .react-flow__handle {
    opacity: 0; /* Hide all handles by default */
    transition: all 0.2s ease;
  }
  
  /* Only show handles when hovering if we want to make them interactive later */
  .react-flow--connecting .react-flow__handle,
  .react-flow__node:hover .react-flow__handle {
    opacity: 0; /* Keep them hidden even on hover since interactions are disabled */
  }
  
  .react-flow__edge-path {
    transition: stroke-width 0.2s ease;
  }
  
  .react-flow__edge:hover .react-flow__edge-path {
    stroke-width: 3px;
  }
`;

// Update the edge styles object
const edgeStyles = {
  default: {
    stroke: '#b1b1b7',
    strokeWidth: 2,
    animated: false,
    filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
  },
  trigger: {
    stroke: '#3b82f6',
    strokeWidth: 2.5,
    animated: true,
    strokeDasharray: '0.5, 3',
    filter: 'drop-shadow(0 1px 3px rgba(59, 130, 246, 0.3))'
  },
  orchestration: {
    stroke: '#ef4444',
    strokeWidth: 2.5,
    animated: false,
    strokeLinecap: 'round' as const,
    filter: 'drop-shadow(0 1px 3px rgba(239, 68, 68, 0.3))'
  },
  value: {
    stroke: '#10b981', // Emerald color for value connections
    strokeWidth: 2.5,
    strokeDasharray: '4, 4', // Dashed line for value connections
    animated: true,
    strokeLinecap: 'round' as const,
    filter: 'drop-shadow(0 0 3px rgba(16, 185, 129, 0.3))'
  },
  useCaseValue: {
    stroke: '#3b82f6', // Blue for use case value connections
    strokeWidth: 2.5,
    strokeDasharray: '4, 4',
    animated: true,
    strokeLinecap: 'round' as const,
    filter: 'drop-shadow(0 0 3px rgba(59, 130, 246, 0.3))'
  },
  solutionValue: {
    stroke: '#8b5cf6', // Purple for solution value connections
    strokeWidth: 2.5,
    strokeDasharray: '4, 4',
    animated: true,
    strokeLinecap: 'round' as const,
    filter: 'drop-shadow(0 0 3px rgba(139, 92, 246, 0.3))'
  }
};

interface AnimatedWorkflowProps {
  useCase: any;
  agents: any[];
  triggers: any[];
}

// Toggle button component with enhanced styling and animation
function ToggleButton({ active, onClick, label, activeColor, children }: { 
  active: boolean; 
  onClick: () => void; 
  label: string; 
  activeColor: string;
  children?: React.ReactNode;
}) {
  return (
    <button 
      className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 flex items-center space-x-2 border ${
        active 
          ? `${activeColor} text-white border-transparent` 
          : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-300'
      }`}
      onClick={onClick}
    >
      <span>{label}</span>
      {children}
    </button>
  );
}

// Define an interface for our extended node data in dagre
interface ExtendedDagreNode {
  x: number;
  y: number;
  width: number;
  height: number;
  parentId?: string;
  alignWithParent?: boolean;
  rank?: number;
  [key: string]: any; // Allow other properties
}

// Fix the getLayoutedElements function with better spacing and algorithm adjustments
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  // Create a new dagre graph
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Improved configuration for more consistent spacing and better alignment
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 120,       // Increase horizontal spacing between nodes
    ranksep: 180,       // Increase vertical spacing between ranks
    marginx: 40,        // Slightly larger margins
    marginy: 40,
    align: 'UL',        // Upper left alignment often works better
    edgesep: 70,        // Increased edge separation
    acyclicer: 'greedy', // Help with cycles
  });
  
  // Configure node constraints based on node type
  nodes.forEach((node) => {
    // Define width and height based on node type for better proportions
    let width = 0;
    let height = 0;
    
    if (node.type === 'orchestratorNode') {
      width = 250;
      height = 100;
    } else if (node.type === 'agentNode') {
      width = 220;
      height = 140;
    } else if (node.type === 'triggerNode') {
      width = 180;
      height = 80;
    } else if (node.type === 'toolsGroupNode') {
      width = 200;
      height = 140;
    } else if (node.type === 'valueNode') {
      width = 180;
      height = 70;
    } else {
      width = 200;
      height = 100;
    }
    
    // Set node dimensions in the dagre graph
    dagreGraph.setNode(node.id, { width, height });
  });
  
  // Process triggers differently - position them to the side
  const triggerNodes = nodes.filter(node => node.type === 'triggerNode');
  const triggerIds = triggerNodes.map(node => node.id);
  
  // Add rank constraints for node types
  const nodesByType: Record<string, Node[]> = {};
  nodes.forEach(node => {
    const type = node.type || 'default';
    if (!nodesByType[type]) nodesByType[type] = [];
    nodesByType[type].push(node);
  });
  
  // Add specific constraints to Dagre when connecting edges
  edges.forEach((edge) => {
    // Special treatment for Orchestrator to Agent connections
    if (edge.source === 'orchestrator') {
      dagreGraph.setEdge(edge.source, edge.target, { 
        weight: 3,        // Give higher precedence to orchestrator connections
        minlen: 2         // Increase minimum edge length
      });
    } 
    // Special handling for trigger connections 
    else if (triggerIds.includes(edge.source)) {
      dagreGraph.setEdge(edge.source, edge.target, {
        weight: 2,        // Higher precedence than default but lower than orchestrator
        minlen: 1.5       // Slightly increased minimum edge length
      });
    }
    // Regular connections
    else {
      dagreGraph.setEdge(edge.source, edge.target, {
        weight: 1,
        minlen: 1
      });
    }
  });
  
  // Compute the layout
  dagre.layout(dagreGraph);
  
  // Apply the calculated layout to our nodes
  const positionedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    
    // Skip nodes that weren't processed by dagre
    if (!nodeWithPosition) {
      return node;
    }
    
    // Get position from Dagre and center node based on its dimensions
    return {
      ...node,
      // Center the node based on the dimensions we provided to dagre
      position: {
        x: nodeWithPosition.x - nodeWithPosition.width / 2,
        y: nodeWithPosition.y - nodeWithPosition.height / 2,
      },
      // Store the computed dimensions for better handle positioning
      width: nodeWithPosition.width,
      height: nodeWithPosition.height
    };
  });
  
  // Return the positioned nodes and edges
  return {
    nodes: positionedNodes,
    edges
  };
};

const AnimatedWorkflow: React.FC<AnimatedWorkflowProps> = ({ 
  useCase, 
  agents, 
  triggers 
}) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [isReady, setIsReady] = useState<boolean>(false); // Control initial render
  
  // Global visibility toggles and state
  const [showTools, setShowTools] = useState<boolean>(false);
  const [showValues, setShowValues] = useState<boolean>(false);
  const [isLayouting, setIsLayouting] = useState<boolean>(false);
  const [layoutDirection, setLayoutDirection] = useState<string>('TB'); // TB (top-bottom) or LR (left-right)
  
  // Track the current stage/useCase ID to detect changes
  const prevUseCaseIdRef = useRef<string | null>(null);

  // Provide the flow direction context value
  const flowDirectionContextValue = useMemo(() => ({
    direction: layoutDirection
  }), [layoutDirection]);

  // Add the global styles
  useEffect(() => {
    // Add styles to the document head
    const styleElement = document.createElement('style');
    styleElement.innerHTML = globalStyles;
    document.head.appendChild(styleElement);

    // Clean up on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Reset layout flag when useCase changes
  useEffect(() => {
    // If there's a useCase and it's different from the previous one
    if (useCase && useCase.sys_id !== prevUseCaseIdRef.current) {
      console.log('Stage changed, resetting and preparing new layout');
      prevUseCaseIdRef.current = useCase.sys_id;
      setIsReady(false); // Hide diagram until new layout is ready
    }
  }, [useCase]);

  // Create nodes and edges and apply layout before first render
  useEffect(() => {
    if (!useCase || !agents || !triggers) return;

    console.log('Creating flow elements with tools visible:', showTools, 'and values visible:', showValues);
    setIsLayouting(true); // Show loading indicator
    
    // Helper function to create the initial nodes and edges
    const createFlowElements = () => {
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];
      
      // Add orchestrator node
      newNodes.push({
        id: 'orchestrator',
        type: 'orchestratorNode',
        data: { 
          label: 'Orchestrator Agent',
          description: 'Coordinates end-to-end process'
        },
        position: { x: 450, y: 50 }, // Centered position, slightly higher
        style: { background: 'transparent', border: 'none', boxShadow: 'none' },
        className: 'no-shadow'
      });
      
      // Add trigger nodes
      triggers.forEach((trigger, index) => {
        const triggerNodeId = `trigger-${trigger.sys_id}`;
        newNodes.push({
          id: triggerNodeId,
          type: 'triggerNode',
          data: { 
            label: trigger.name || 'Trigger',
            description: trigger.condition || 'Initiates the process'
          },
          position: { x: 150 + (index * 200), y: 50 },
          style: { background: 'transparent', border: 'none', boxShadow: 'none' },
          className: 'no-shadow'
        });
        
        newEdges.push({
          id: `edge-${triggerNodeId}-orchestrator`,
          source: triggerNodeId,
          sourceHandle: 'source-right',
          target: 'orchestrator',
          targetHandle: 'target-left',
          type: 'trigger',
          animated: true,
          data: { 
            type: 'trigger'
          }
        });
      });
      
      // Calculate total width needed for agents
      const totalAgents = agents.length;
      const agentSpacing = 300; // Reduce spacing between agents for better symmetry 
      const startX = 450 - ((totalAgents - 1) * agentSpacing / 2); // Center the agents
      
      // Common Y positions with optimal spacing
      const agentY = 180;
      const toolsY = 320;
      
      // Collect agent node ids and their positions for later use with value nodes
      const agentNodeIds: string[] = [];
      const agentPositions: {[key: string]: {x: number, y: number}} = {};
      
      // Add agent nodes
      agents.forEach((agent, index) => {
        const agentNodeId = `agent-${agent.sys_id}`;
        agentNodeIds.push(agentNodeId);
        
        const toolCount = agent.tools?.length || 0;
        const colorIndex = index % colorClasses.length;
        const agentX = startX + (index * agentSpacing);
        
        // Store position for later reference
        agentPositions[agentNodeId] = {x: agentX, y: agentY};
        
        newNodes.push({
          id: agentNodeId,
          type: 'agentNode',
          data: { 
            label: agent.name,
            description: agent.description || 'Performs specialized tasks',
            toolCount,
            color: colorClasses[colorIndex],
            index
          },
          position: { x: agentX, y: agentY },
          style: { background: 'transparent', border: 'none', boxShadow: 'none' },
          className: 'no-shadow'
        });
        
        // Connect orchestrator to agent with curved paths
        newEdges.push({
          id: `edge-orchestrator-${agentNodeId}`,
          source: 'orchestrator',
          sourceHandle: 'source-bottom',
          target: agentNodeId,
          targetHandle: 'target-top',
          type: 'orchestration',
          animated: true,
          data: { 
            type: 'orchestration'
          }
        });
        
        // Add tool group node for each agent with tools, but only if tools are visible globally
        if (agent.tools && agent.tools.length > 0 && showTools) {
          console.log(`Showing tools for agent: ${agentNodeId}`);
          const toolGroupId = `toolgroup-${agent.sys_id}`;
          
          // Prepare tool data
          const toolData = agent.tools.map((tool: any) => ({
            name: tool.name,
            type: tool.type === 'capability' ? 'AI Capability' : 'Flow Action',
            sys_id: tool.sys_id
          }));
          
          // Add a single tools group node
          newNodes.push({
            id: toolGroupId,
            type: 'toolsGroupNode',
            data: { 
              tools: toolData,
              agentId: agent.sys_id
            },
            position: { x: agentX, y: toolsY },
            style: { background: 'transparent', border: 'none', boxShadow: 'none' },
            className: 'no-shadow'
          });
          
          // Connect agent to tools group
          newEdges.push({
            id: `edge-${agentNodeId}-${toolGroupId}`,
            source: agentNodeId,
            sourceHandle: 'source-bottom',
            target: toolGroupId,
            targetHandle: 'target-top',
            type: 'default',
            animated: false,
            data: { 
              type: 'default'
            }
          });
        }
      });
      
      // Only add value nodes if they are visible globally
      if (showValues) {
        // ===== Value Nodes Placement Strategy =====
        // 1. Generate agent-specific value data based on agent name/function
        const agentValueData = agents.map((agent, index) => {
          let valueLabel = '';
          let valueDescription = '';
          
          // Determine appropriate value metric based on agent name or function
          if (agent.name.toLowerCase().includes('vendor') && agent.name.toLowerCase().includes('question')) {
            valueLabel = "90% Faster Responses";
            valueDescription = "Vendor queries resolved in minutes instead of days";
          } else if (agent.name.toLowerCase().includes('classify') || agent.name.toLowerCase().includes('categoriz')) {
            valueLabel = "95% Classification Accuracy";
            valueDescription = "Better routing and prioritization";
          } else if (agent.name.toLowerCase().includes('comparison')) {
            valueLabel = "30% Workload Reduction";
            valueDescription = "Enhanced operational efficiency";
          } else if (agent.name.toLowerCase().includes('decision')) {
            valueLabel = "80% Error Reduction";
            valueDescription = "Fewer decision-making mistakes";
          } else if (agent.name.toLowerCase().includes('award') || agent.name.toLowerCase().includes('communication')) {
            valueLabel = "3x Process Acceleration";
            valueDescription = "Faster completion of final stages";
          } else if (agent.name.toLowerCase().includes('evaluat')) {
            valueLabel = "85% More Consistent Scoring";
            valueDescription = "Standardized evaluation criteria";
          } else if (agent.name.toLowerCase().includes('extract') || agent.name.toLowerCase().includes('data')) {
            valueLabel = "99% Data Accuracy";
            valueDescription = "Precise information extraction";
          } else {
            // Fallback based on agent index
            const fallbackLabels = [
              "30% Workload Reduction",
              "80% Error Reduction",
              "3x Process Acceleration",
              "50% Better Compliance"
            ];
            valueLabel = fallbackLabels[index % fallbackLabels.length];
            valueDescription = "Enhanced operational efficiency";
          }
          
          return {
            agentId: agent.sys_id,
            label: valueLabel,
            description: valueDescription
          };
        });
        
        // 2. Position agent value nodes below their corresponding agents in a bottom row
        const agentValueY = toolsY + 200; // Position agent-specific values in a row below tools
        
        agentValueData.forEach((valueData, index) => {
          const agentNodeId = `agent-${valueData.agentId}`;
          const agentPos = agentPositions[agentNodeId];
          
          if (!agentPos) return; // Skip if agent position not found
          
          const agentValueId = `agent-value-${valueData.agentId}`;
          
          newNodes.push({
            id: agentValueId,
            type: 'valueNode',
            data: { 
              label: valueData.label,
              description: valueData.description,
              valueType: 'agent' // Agent-specific value
            },
            position: { x: agentPos.x, y: agentValueY }, // Position below the agent
            style: { background: 'transparent', border: 'none', boxShadow: 'none' },
            className: 'no-shadow'
          });
          
          // Connect value to agent or its tools
          const sourceId = showTools ? `toolgroup-${valueData.agentId}` : agentNodeId;
          const sourceHandle = showTools ? 'source-bottom' : 'source-bottom';
          const targetHandle = 'target-top';
          
          newEdges.push({
            id: `edge-${sourceId}-${agentValueId}`,
            source: sourceId,
            sourceHandle: sourceHandle,
            target: agentValueId,
            targetHandle: targetHandle,
            type: 'smoothstep',
            style: edgeStyles.value,
            animated: true
          });
        });
        
        // 3. Add overall process values in a row at the bottom
        const processValueY = agentValueY + 150; // Position for overall process metrics
        const useCaseValues = [
          { 
            id: 'usecase-value-1', 
            label: '40% Time Saved', 
            description: 'Overall process execution',
            position: 0.33 // Relative position (0-1) across the diagram width
          },
          { 
            id: 'usecase-value-2', 
            label: '65% Cost Reduction',
            description: 'Per RFX process',
            position: 0.67 // Relative position (0-1) across the diagram width
          }
        ];
        
        // Calculate the width of the diagram for positioning
        const diagramWidth = (totalAgents > 1) 
          ? startX + ((totalAgents - 1) * agentSpacing) + 200 
          : 900;
        
        useCaseValues.forEach((value, index) => {
          const valueX = 150 + (diagramWidth - 300) * value.position;
          
          newNodes.push({
            id: value.id,
            type: 'valueNode',
            data: { 
              label: value.label,
              description: value.description,
              valueType: 'useCase' // Use case specific value
            },
            position: { x: valueX, y: processValueY },
            style: { background: 'transparent', border: 'none', boxShadow: 'none' },
            className: 'no-shadow'
          });
          
          // Connect agent value nodes to use case value nodes
          const connectCount = Math.min(2, agents.length);
          for (let i = 0; i < connectCount; i++) {
            const offset = i === 0 ? -1 : 1;
            const connAgentIndex = (index + offset + agents.length) % agents.length;
            const connAgentValueId = `agent-value-${agents[connAgentIndex].sys_id}`;
            
            newEdges.push({
              id: `edge-${connAgentValueId}-${value.id}`,
              source: connAgentValueId,
              sourceHandle: 'source-bottom', // Use explicit source handle
              target: value.id,
              targetHandle: 'target-top', // Use explicit target handle
              type: 'smoothstep',
              style: edgeStyles.useCaseValue,
              animated: true
            });
          }
        });
        
        // 4. Add final solution value node at the bottom center
        const solutionValueY = processValueY + 120; // Position for the overall solution value
        const solutionValue = {
          id: 'solution-value',
          type: 'valueNode',
          data: { 
            label: 'Improved Quality & Compliance', 
            description: 'Across all RFX processes',
            valueType: 'solution' // Overall solution value
          },
          position: { x: 450, y: solutionValueY },
          style: { background: 'transparent', border: 'none', boxShadow: 'none' },
          className: 'no-shadow'
        };
        
        newNodes.push(solutionValue);
        
        // Connect use case values to solution value with explicit handles
        useCaseValues.forEach(value => {
          newEdges.push({
            id: `edge-${value.id}-solution-value`,
            source: value.id,
            sourceHandle: 'source-bottom', // Use explicit source handle
            target: 'solution-value',
            targetHandle: 'target-top', // Use explicit target handle
            type: 'smoothstep',
            style: edgeStyles.solutionValue,
            animated: true
          });
        });
      }
      
      return { nodes: newNodes, edges: newEdges };
    };
    
    // Create the initial elements
    const { nodes: initialNodes, edges: initialEdges } = createFlowElements();
    
    // Apply layout immediately before rendering
    setTimeout(() => {
      const { nodes: layoutedNodes } = getLayoutedElements(
        initialNodes, 
        initialEdges,
        layoutDirection
      );
      
      setNodes(layoutedNodes);
      setEdges(initialEdges);
      setIsLayouting(false);
      setIsReady(true); // Now show the diagram
    }, 0);
    
  }, [useCase, agents, triggers, showTools, showValues]);

  // Default React Flow properties
  const defaultViewport = { x: 0, y: 0, zoom: 0.8 };
  
  // Toggle handlers
  const toggleTools = useCallback(() => {
    setShowTools(prev => !prev);
  }, []);
  
  const toggleValues = useCallback(() => {
    setShowValues(prev => !prev);
  }, []);

  // Color scales for agents
  const colorClasses = [
    'bg-blue-600',
    'bg-purple-600',
    'bg-amber-600',
    'bg-teal-600',
    'bg-emerald-600',
    'bg-indigo-600',
    'bg-cyan-600',
  ];

  // After the nodes and edges are created
  useEffect(() => {
    if (!isReady && nodes.length > 0) {
      setIsLayouting(true);
      
      // Apply layout with Dagre
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        nodes,
        edges,
        layoutDirection
      );
      
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setIsReady(true);
      
      setTimeout(() => {
        setIsLayouting(false);
      }, 150);
    }
  }, [nodes.length, edges.length, isReady]);

  return (
    <FlowDirectionContext.Provider value={flowDirectionContextValue}>
      <div className="h-[750px] w-full border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
        {/* Only render ReactFlow when layout is ready */}
        {isReady ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultViewport={defaultViewport}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            minZoom={0.3}
            maxZoom={1.5}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: false }}
          >
            <Panel position="top-left" className="bg-white p-3 shadow-md rounded-lg flex gap-3">
              <ToggleButton
                active={showTools}
                onClick={toggleTools}
                label={showTools ? "Hide Tools" : "Show Tools"}
                activeColor="bg-blue-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zm7-10a1 1 0 01.707.293l.707.707L15 5.414l1.293-1.293a1 1 0 111.414 1.414l-1.293 1.293L18 8.414l.293.293a1 1 0 010 1.414l-.707.707L16 9.414l-1.293 1.293a1 1 0 01-1.414-1.414L14.586 8l-1.293-1.293a1 1 0 010-1.414l.707-.707z" clipRule="evenodd" />
                </svg>
              </ToggleButton>
              <ToggleButton
                active={showValues}
                onClick={toggleValues}
                label={showValues ? "Hide Values" : "Show Values"}
                activeColor="bg-emerald-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-14a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V5z" clipRule="evenodd" />
                </svg>
              </ToggleButton>
              <ToggleButton
                active={layoutDirection === 'TB'}
                onClick={() => {
                  setLayoutDirection(layoutDirection === 'TB' ? 'LR' : 'TB');
                  setIsReady(false); // Trigger a re-layout
                }}
                label={layoutDirection === 'TB' ? "Vertical Layout" : "Horizontal Layout"}
                activeColor="bg-purple-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M15 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm-4 0a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zM9 3a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1zm-4 0a1 1 0 011 1v12a1 1 0 11-2 0V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </ToggleButton>
            </Panel>
            
            <Panel position="top-right" className="bg-white p-2 shadow rounded">
              <div className="text-sm font-medium">Agentic Workflow Legend</div>
              <div className="flex text-xs mt-1 items-center">
                <div className="w-3 h-3 rounded-full bg-emerald-600 mr-1"></div>
                <span>Agent Values</span>
              </div>
              <div className="flex text-xs mt-1 items-center">
                <div className="w-3 h-3 rounded-full bg-blue-600 mr-1"></div>
                <span>Use Case Values</span>
              </div>
              <div className="flex text-xs mt-1 items-center">
                <div className="w-3 h-3 rounded-full bg-purple-600 mr-1"></div>
                <span>Solution Value</span>
              </div>
            </Panel>
            <Background color="#f1f1f1" gap={16} />
            <Controls />
            <MiniMap
              nodeStrokeColor={(n: Node) => {
                if (n.type === 'orchestratorNode') return '#ef4444';
                if (n.type === 'agentNode') return '#4f46e5';
                if (n.type === 'triggerNode') return '#3b82f6';
                return '#64748b';
              }}
              nodeColor={(n: Node) => {
                if (n.type === 'orchestratorNode') return '#fecaca';
                if (n.type === 'agentNode') return '#c7d2fe';
                if (n.type === 'triggerNode') return '#bfdbfe';
                if (n.type === 'valueNode') {
                  const valueType = n.data?.valueType;
                  if (valueType === 'agent') return '#10b981';
                  if (valueType === 'useCase') return '#3b82f6';
                  if (valueType === 'solution') return '#8b5cf6';
                  return '#22c55e';
                }
                return '#f8fafc';
              }}
            />
          </ReactFlow>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-blue-500 rounded-full mb-2"></div>
              <div className="text-gray-600">Generating workflow visualization...</div>
            </div>
          </div>
        )}
      </div>
    </FlowDirectionContext.Provider>
  );
};

export default AnimatedWorkflow; 