'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { TriggerNodeData, CustomNodeProps } from './types';

const TriggerNode = ({ data }: CustomNodeProps<TriggerNodeData>) => {
  return (
    <motion.div
      className="p-3 rounded-lg bg-blue-600 text-white"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="font-bold text-center">{data.label}</div>
      {data.description && (
        <div className="text-xs mt-1 opacity-80 text-center">
          {data.description}
        </div>
      )}
      {data.condition && (
        <div className="bg-blue-500 mt-2 p-1 text-xs rounded">
          {data.condition}
        </div>
      )}
      <Handle 
        type="source" 
        position={Position.Bottom}
        className="w-2 h-2"
      />
    </motion.div>
  );
};

export default memo(TriggerNode); 