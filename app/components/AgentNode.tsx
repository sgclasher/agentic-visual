'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { AgentNodeData, CustomNodeProps } from './types';

const AgentNode = ({ data }: CustomNodeProps<AgentNodeData>) => {
  // Determine agent background color based on agent role or type
  const getAgentColor = () => {
    // If the data provides a specific color, use that
    if (data.color) return data.color;
    
    // Otherwise, use type-based coloring
    if (data.type?.includes('eval')) return 'bg-blue-600';
    if (data.type?.includes('intake')) return 'bg-purple-600';
    if (data.type?.includes('scoring')) return 'bg-orange-500';
    
    // Default color
    return 'bg-blue-600';
  };

  return (
    <motion.div
      className={`px-5 py-4 rounded-lg ${getAgentColor()} text-white shadow-lg`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03, y: -2 }}
      transition={{ duration: 0.2 }}
    >
      {/* Top handle - improved positioning for better connections */}
      <Handle 
        id="target-top"
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 !bg-white !border-2 border-gray-400"
        style={{ top: -1, left: '50%' }} 
      />
      
      <div className="text-center">
        <div className="font-bold text-lg mb-1">{data.label}</div>
        {data.description && (
          <div className="text-sm opacity-90 mt-1 max-w-[220px] mx-auto">{data.description}</div>
        )}
        
        {/* Show tool count if available */}
        {data.toolCount > 0 && (
          <div className="mt-3 text-xs bg-white/20 rounded-full px-3 py-1 inline-block">
            <span className="opacity-90">Tools: {data.toolCount}</span>
          </div>
        )}
      </div>
      
      {/* Bottom handle - improved positioning for better connections */}
      <Handle 
        id="source-bottom"
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 !bg-white !border-2 border-gray-400"
        style={{ bottom: -1, left: '50%' }} 
      />
      
      {/* Enhanced tooltip */}
      {data.description && (
        <div className="absolute top-0 left-0 w-full opacity-0 group-hover:opacity-100 pointer-events-none z-10 transform -translate-y-full transition-opacity duration-200">
          <div className="bg-gray-800 text-white p-2 rounded shadow-lg text-sm max-w-[250px] mx-auto mt-2">
            {data.description}
            {data.metadata && (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <div className="text-xs text-gray-300">{data.metadata}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default memo(AgentNode); 