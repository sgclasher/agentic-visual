'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { DataNodeData, CustomNodeProps } from './types';

const DataNode = ({ data }: CustomNodeProps<DataNodeData>) => {
  return (
    <motion.div
      className="p-3 rounded-lg bg-purple-600 text-white"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="font-bold text-center">{data.label}</div>
      {data.description && (
        <div className="text-xs mt-1 opacity-80 text-center">
          {data.description}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </motion.div>
  );
};

export default memo(DataNode); 