'use client';

import React, { useState } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { motion } from 'framer-motion';

// Orchestration Node - Main control node
export function OrchestrationNode({ data, selected }: NodeProps) {
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(data.label);
  const [description, setDescription] = useState(data.description);

  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLabel(e.target.value);
    data.label = e.target.value;
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
    data.description = e.target.value;
  };

  return (
    <motion.div 
      className={`px-4 py-3 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-red-500' : ''}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
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
            />
          </div>
        ) : (
          <>
            <div className="font-bold text-center text-lg">{label}</div>
            <div className="text-sm text-center opacity-90">{description}</div>
          </>
        )}
      </div>
      
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

// Agent Node - Represents a specific agent in the workflow
export function AgentNode({ data, selected }: NodeProps) {
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
    <motion.div 
      className={`px-5 py-4 rounded-lg ${data.color || 'bg-blue-600'} text-white shadow-lg ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-blue-500' : ''}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
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
            {data.toolCount > 0 && (
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

// Trigger Node - Starting point of a workflow
export function TriggerNode({ data, selected }: NodeProps) {
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
    <motion.div 
      className={`border-2 border-blue-500 bg-blue-100 px-4 py-2 rounded-lg shadow-lg w-[180px] ${selected ? 'ring-2 ring-blue-300 ring-offset-2' : ''}`}
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

// Value Node - Represents business value or metrics
export function ValueNode({ data, selected }: NodeProps) {
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
      className={`px-4 py-2 rounded-full ${getColorClass()} text-white max-w-[220px] shadow-lg ${getShadowClass()} ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-green-600' : ''}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 10 }}
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

// Tools Group Node - Container for tools
export function ToolsGroupNode({ data, selected }: NodeProps) {
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
    <motion.div 
      className={`px-4 py-3 rounded-lg bg-gray-700 text-white ${selected ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-700' : ''}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
      whileHover={{ scale: 1.03, transition: { duration: 0.2 } }}
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
      
      <div onDoubleClick={() => setEditing(true)}>
        {editing ? (
          <div className="flex flex-col gap-2 p-1">
            {tools.map((tool: any, index: number) => (
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
            {tools.map((tool: any, index: number) => (
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