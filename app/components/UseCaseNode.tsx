'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { motion } from 'framer-motion';
import { UseCaseNodeData, CustomNodeProps } from './types';

interface ProcessBadgeProps {
  label: string;
  count: number;
  colorClass?: string;
}

const ProcessBadge = ({ label, count, colorClass = 'bg-blue-100 text-blue-800' }: ProcessBadgeProps) => (
  <div className={`text-xs px-2 py-1 rounded-full ${colorClass} flex items-center justify-between`}>
    <span>{label}</span>
    <span className="ml-1 bg-white w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold">
      {count}
    </span>
  </div>
);

const UseCaseNode = ({ data }: CustomNodeProps<UseCaseNodeData>) => {
  const inputCount = data.artifacts?.inputs?.length || data.processFlow?.input_artifacts?.length || 0;
  const outputCount = data.artifacts?.outputs?.length || data.processFlow?.output_artifacts?.length || 0;
  
  return (
    <motion.div
      className="p-3 bg-white border-2 border-blue-600 rounded-lg shadow-lg min-w-[200px]"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="font-bold text-center text-blue-800">{data.label}</div>
      
      {data.description && (
        <div className="text-xs mt-1 opacity-80 text-center">
          {data.description}
        </div>
      )}
      
      <div className="mt-2 flex justify-between">
        {inputCount > 0 && (
          <ProcessBadge label="Inputs" count={inputCount} colorClass="bg-blue-100 text-blue-800" />
        )}
        {outputCount > 0 && (
          <ProcessBadge label="Outputs" count={outputCount} colorClass="bg-green-100 text-green-800" />
        )}
      </div>
      
      <Handle type="source" position={Position.Bottom} />
    </motion.div>
  );
};

export default memo(UseCaseNode); 