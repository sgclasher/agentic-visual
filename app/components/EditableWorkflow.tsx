'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
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
  Connection,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { nanoid } from 'nanoid';
import { motion } from 'framer-motion';

// Define node data interface
interface NodeData {
  label: string;
  description?: string;
  color?: string;
  toolCount?: number;
  valueType?: string;
  tools?: Array<{name: string, type: string}>;
}

// Define node components directly in this file
function OrchestrationNode({ data }: { data: NodeData }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [description, setDescription] = useState(data.description || '');

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
    data.label = e.target.value;
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
    data.description = e.target.value;
  };

  return (
    <div className="px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white">
      <Handle 
        id="target-top"
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-red-700" 
      />
      <Handle 
        id="target-left"
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-red-700" 
      />
      <div className="text-center" onDoubleClick={() => setEditing(true)}>
        {editing ? (
          <div className="flex flex-col gap-2 p-1">
            <input
              className="bg-red-400 p-1 rounded text-white text-center placeholder-white placeholder-opacity-70"
              value={label}
              onChange={handleLabelChange}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
              autoFocus
            />
            <input
              className="bg-red-400 p-1 rounded text-white text-xs text-center placeholder-white placeholder-opacity-70"
              value={description}
              onChange={handleDescriptionChange}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
              placeholder="Description"
            />
          </div>
        ) : (
          <>
            <div className="font-bold text-center text-lg">{label}</div>
            <div className="text-sm text-center">{description}</div>
          </>
        )}
      </div>
      <Handle 
        id="source-bottom"
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-red-700" 
      />
      <Handle 
        id="source-right"
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-red-700" 
      />
    </div>
  );
}

function AgentNode({ data }: { data: NodeData }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [description, setDescription] = useState(data.description || '');

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
    data.label = e.target.value;
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
    data.description = e.target.value;
  };

  return (
    <div className={`px-5 py-4 rounded-lg ${data.color || 'bg-blue-600'} text-white shadow-lg`}>
      <Handle 
        id="target-top"
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-white border-2 border-blue-500" 
      />
      <Handle 
        id="target-left"
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-white border-2 border-blue-500" 
      />
      <div className="text-center" onDoubleClick={() => setEditing(true)}>
        {editing ? (
          <div className="flex flex-col gap-2 p-1">
            <input
              className="bg-blue-500 p-1 rounded text-white text-center placeholder-white placeholder-opacity-70"
              value={label}
              onChange={handleLabelChange}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
              autoFocus
            />
            <input
              className="bg-blue-500 p-1 rounded text-white text-xs text-center placeholder-white placeholder-opacity-70"
              value={description}
              onChange={handleDescriptionChange}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
              placeholder="Description"
            />
          </div>
        ) : (
          <>
            <div className="font-bold text-lg mb-1">{label}</div>
            <div className="text-sm opacity-90">{description}</div>
            {data.toolCount && data.toolCount > 0 && (
              <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
                <span className="opacity-90">Tools: {data.toolCount}</span>
              </div>
            )}
          </>
        )}
      </div>
      <Handle 
        id="source-bottom"
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-white border-2 border-blue-500" 
      />
      <Handle 
        id="source-right"
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-white border-2 border-blue-500" 
      />
    </div>
  );
}

function TriggerNode({ data }: { data: NodeData }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [description, setDescription] = useState(data.description || '');

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
    data.label = e.target.value;
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
    data.description = e.target.value;
  };

  return (
    <div className="border-2 border-blue-500 bg-blue-100 px-4 py-2 rounded-lg shadow-lg w-[180px]">
      <Handle 
        id="target-top" 
        type="target" 
        position={Position.Top}
        className="w-3 h-3 bg-blue-700"
      />
      <Handle 
        id="target-left" 
        type="target" 
        position={Position.Left}
        className="w-3 h-3 bg-blue-700"
      />
      <div onDoubleClick={() => setEditing(true)}>
        {editing ? (
          <div className="flex flex-col gap-2 p-1">
            <input
              className="bg-blue-50 border border-blue-300 p-1 rounded text-blue-900 text-center"
              value={label}
              onChange={handleLabelChange}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
              autoFocus
            />
            <input
              className="bg-blue-50 border border-blue-300 p-1 rounded text-blue-700 text-xs text-center"
              value={description}
              onChange={handleDescriptionChange}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
              placeholder="Description"
            />
          </div>
        ) : (
          <>
            <div className="font-bold text-blue-900">{label}</div>
            <div className="text-xs text-blue-700">{description || 'Trigger'}</div>
          </>
        )}
      </div>
      <Handle 
        id="source-bottom" 
        type="source" 
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-700"
      />
      <Handle 
        id="source-right" 
        type="source" 
        position={Position.Right}
        className="w-3 h-3 bg-blue-700"
      />
    </div>
  );
}

function ValueNode({ data }: { data: NodeData }) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [description, setDescription] = useState(data.description || '');
  
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
    data.label = e.target.value;
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
    data.description = e.target.value;
  };

  // Determine color based on value type
  const getColorClass = () => {
    switch(data.valueType) {
      case 'agent': return 'bg-emerald-600';
      case 'useCase': return 'bg-blue-600';
      case 'solution': return 'bg-purple-600';
      default: return 'bg-green-600';
    }
  };
  
  return (
    <div className={`px-4 py-2 rounded-full ${getColorClass()} text-white max-w-[220px] shadow-lg`}>
      <Handle 
        id="target-top"
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-white border-2 border-emerald-500" 
      />
      <Handle 
        id="target-left"
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-white border-2 border-emerald-500" 
      />
      <div className="text-center" onDoubleClick={() => setEditing(true)}>
        {editing ? (
          <div className="flex flex-col gap-2 p-1">
            <input
              className="bg-green-500 p-1 rounded text-white text-center placeholder-white placeholder-opacity-70"
              value={label}
              onChange={handleLabelChange}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
              autoFocus
            />
            <input
              className="bg-green-500 p-1 rounded text-white text-xs text-center placeholder-white placeholder-opacity-70"
              value={description}
              onChange={handleDescriptionChange}
              onBlur={() => setEditing(false)}
              onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
              placeholder="Description"
            />
          </div>
        ) : (
          <>
            <div className="font-bold text-center">{label}</div>
            <div className="text-xs opacity-80 text-center">{description}</div>
          </>
        )}
      </div>
      <Handle 
        id="source-bottom"
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-white border-2 border-emerald-500" 
      />
      <Handle 
        id="source-right"
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-white border-2 border-emerald-500" 
      />
    </div>
  );
}

function ToolsGroupNode({ data }: { data: NodeData }) {
  const [editing, setEditing] = useState(false);
  const [tools, setTools] = useState(data.tools || []);

  const handleNameChange = (index: number, value: string) => {
    const updatedTools = [...tools];
    updatedTools[index].name = value;
    setTools(updatedTools);
    data.tools = updatedTools;
  };

  const handleTypeChange = (index: number, value: string) => {
    const updatedTools = [...tools];
    updatedTools[index].type = value;
    setTools(updatedTools);
    data.tools = updatedTools;
  };

  return (
    <div className="px-4 py-3 rounded-lg bg-gray-700 text-white">
      <Handle 
        id="target-top"
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-gray-500" 
      />
      <Handle 
        id="target-left"
        type="target" 
        position={Position.Left} 
        className="w-3 h-3 bg-gray-500" 
      />
      <div onDoubleClick={() => setEditing(true)}>
        {editing ? (
          <div className="flex flex-col gap-2 p-1">
            {tools.map((tool, index) => (
              <div key={index} className={`${index > 0 ? 'mt-2 pt-2 border-t border-gray-500' : ''}`}>
                <input
                  className="bg-gray-600 p-1 mb-1 w-full rounded text-white text-sm text-center"
                  value={tool.name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  onBlur={() => setEditing(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
                  autoFocus={index === 0}
                />
                <input
                  className="bg-gray-600 p-1 w-full rounded text-white text-xs text-center"
                  value={tool.type}
                  onChange={(e) => handleTypeChange(index, e.target.value)}
                  onBlur={() => setEditing(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
                />
              </div>
            ))}
          </div>
        ) : (
          <>
            {tools.map((tool, index) => (
              <div key={index} className={`${index > 0 ? 'mt-3 pt-3 border-t border-gray-500' : ''}`}>
                <div className="font-bold text-center text-sm">{tool.name}</div>
                <div className="text-xs text-center opacity-80">{tool.type}</div>
              </div>
            ))}
          </>
        )}
      </div>
      <Handle 
        id="source-bottom"
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-gray-500" 
      />
      <Handle 
        id="source-right"
        type="source" 
        position={Position.Right} 
        className="w-3 h-3 bg-gray-500" 
      />
    </div>
  );
}

// Define node types
const nodeTypes = {
  orchestratorNode: OrchestrationNode,
  agentNode: AgentNode,
  triggerNode: TriggerNode,
  toolsGroupNode: ToolsGroupNode,
  valueNode: ValueNode
};

const initialNodes: Node[] = [
  {
    id: 'orchestrator',
    type: 'orchestratorNode',
    data: { 
      label: 'Orchestrator Agent',
      description: 'Coordinates end-to-end process'
    },
    position: { x: 250, y: 50 }
  },
  {
    id: 'trigger-1',
    type: 'triggerNode',
    data: { 
      label: 'User Request',
      description: 'Starts the workflow'
    },
    position: { x: 50, y: 50 }
  }
];

const initialEdges: Edge[] = [
  {
    id: 'e-trigger-orchestrator',
    source: 'trigger-1',
    sourceHandle: 'source-right',
    target: 'orchestrator',
    targetHandle: 'target-left',
    type: 'default',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 20,
      height: 20
    }
  }
];

const EditableWorkflow = () => {
  // Use nodes and edges state from React Flow
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [nodeCount, setNodeCount] = useState({
    agent: 0,
    trigger: 1,
    value: 0,
    tools: 0
  });

  // Node selection state
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // Handle connections between nodes
  const onConnect = useCallback((params: Connection) => {
    setEdges((els) => 
      addEdge({
        ...params,
        type: 'default',
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20
        }
      }, els)
    );
  }, [setEdges]);

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  // Add a new node to the canvas
  const addNode = useCallback((type: string, position: { x: number, y: number }) => {
    const newNodeId = `${type}-${nanoid(6)}`;
    let nodeData: any = {};
    
    switch (type) {
      case 'agent':
        nodeData = {
          label: `Agent ${nodeCount.agent + 1}`,
          description: 'Performs specialized tasks',
          toolCount: 0,
        };
        setNodeCount(prev => ({ ...prev, agent: prev.agent + 1 }));
        break;
      case 'trigger':
        nodeData = {
          label: `Trigger ${nodeCount.trigger + 1}`,
          description: 'Initiates the process',
        };
        setNodeCount(prev => ({ ...prev, trigger: prev.trigger + 1 }));
        break;
      case 'value':
        nodeData = {
          label: 'Value Metric',
          description: 'Business value',
          valueType: 'agent',
        };
        setNodeCount(prev => ({ ...prev, value: prev.value + 1 }));
        break;
      case 'tools':
        nodeData = {
          tools: [
            { name: 'Tool 1', type: 'AI Capability' },
            { name: 'Tool 2', type: 'Flow Action' }
          ]
        };
        setNodeCount(prev => ({ ...prev, tools: prev.tools + 1 }));
        break;
    }
    
    // Create the new node
    const newNode: Node = {
      id: newNodeId,
      type: type === 'agent' ? 'agentNode' : 
           type === 'trigger' ? 'triggerNode' : 
           type === 'value' ? 'valueNode' : 'toolsGroupNode',
      data: nodeData,
      position
    };
    
    setNodes(nodes => [...nodes, newNode]);
    return newNode;
  }, [nodes, nodeCount, setNodes]);

  // Handle drag and drop from the node palette
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const reactFlowBounds = document.querySelector('.react-flow')?.getBoundingClientRect();
      const type = event.dataTransfer.getData('application/reactflow');
      
      if (typeof type === 'undefined' || !type || !reactFlowBounds) {
        return;
      }

      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      };
      
      addNode(type, position);
    },
    [addNode]
  );

  // Component for draggable node types in the palette
  const DraggableNodeType = ({ type, label, color }: { type: string, label: string, color: string }) => {
    const onDragStart = (event: React.DragEvent, nodeType: string) => {
      event.dataTransfer.setData('application/reactflow', nodeType);
      event.dataTransfer.effectAllowed = 'move';
    };

    return (
      <div
        className={`${color} text-white rounded-md p-3 mb-2 cursor-move shadow-sm text-center`}
        onDragStart={(event) => onDragStart(event, type)}
        draggable
      >
        {label}
      </div>
    );
  };

  return (
    <div className="h-[750px] w-full border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
      <div className="h-full flex">
        {/* Node Palette */}
        <div className="w-48 bg-white border-r border-gray-200 p-3 overflow-auto">
          <h3 className="font-medium text-gray-900 mb-3">Add Components</h3>
          <p className="text-xs text-gray-500 mb-4">Drag items to the canvas</p>
          
          <DraggableNodeType type="agent" label="Agent" color="bg-blue-600" />
          <DraggableNodeType type="trigger" label="Trigger" color="bg-blue-500" />
          <DraggableNodeType type="tools" label="Tools Group" color="bg-gray-700" />
          <DraggableNodeType type="value" label="Value Node" color="bg-green-600" />
        </div>
        
        {/* Flow Editor */}
        <div className="flex-1 h-full">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            onDragOver={onDragOver}
            onDrop={onDrop}
            fitView
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
          >
            <Panel position="top-right" className="bg-white p-2 rounded shadow text-xs">
              <p>Drag to connect nodes</p>
              <p>Double-click on node text to edit</p>
            </Panel>
            <Controls />
            <MiniMap />
            <Background 
              color="#f1f1f1" 
              gap={16} 
              variant={BackgroundVariant.Lines} 
            />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
};

export default EditableWorkflow; 