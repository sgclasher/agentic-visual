'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { ToolNodeData, CustomNodeProps } from './types';

const ToolNode = ({ data }: CustomNodeProps<ToolNodeData>) => {
  const isCapability = data.type === 'capability' || data.type?.toLowerCase().includes('ai');
  const bgColor = isCapability ? 'bg-indigo-600' : 'bg-gray-700';
  
  return (
    <motion.div 
      className={`px-3 py-2 rounded-lg ${bgColor} text-white`}
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <Handle type="target" position={Position.Top} className="w-2 h-2" />
      <div className="font-bold text-center text-sm">{data.label}</div>
      <div className="text-xs text-center opacity-80">
        {isCapability ? 'AI Capability' : 'Flow Action'}
      </div>
      {data.description && (
        <div className="text-xs mt-1 text-center opacity-70">
          {data.description}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} className="w-2 h-2" />
    </motion.div>
  );
};

export default memo(ToolNode); 