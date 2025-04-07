'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { CapabilityNodeData, CustomNodeProps } from './types';

const CapabilityNode = memo(({ data }: CustomNodeProps<CapabilityNodeData>) => {
  return (
    <motion.div 
      className="px-3 py-2 rounded-lg bg-purple-600 text-white"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", damping: 10 }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="font-bold text-center text-xs">{data.label}</div>
      <div className="text-xs text-center opacity-80">{data.type || "GenAI Capability"}</div>
    </motion.div>
  );
});

CapabilityNode.displayName = 'CapabilityNode';

export default CapabilityNode; 