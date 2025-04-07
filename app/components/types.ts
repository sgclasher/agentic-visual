import { NodeProps as XYNodeProps } from '@xyflow/react';

/**
 * Common node data interface definition
 */
export interface NodeData {
  label: string;
  description?: string;
}

/**
 * Agent node specific data
 */
export interface AgentNodeData extends NodeData {
  color?: string;
  type?: string;
  toolCount?: number;
  metadata?: string;
  index?: number;
}

/**
 * Trigger node specific data
 */
export interface TriggerNodeData extends NodeData {
  condition?: string;
  target_table?: string;
}

/**
 * Tool node specific data
 */
export interface ToolNodeData extends NodeData {
  label: string;
  type?: string;
  description?: string;
  index?: number;
}

/**
 * Capability node specific data
 */
export interface CapabilityNodeData extends NodeData {
  type?: string;
}

/**
 * Data node specific data
 */
export interface DataNodeData extends NodeData {
  fields?: string[];
}

/**
 * Decision node specific data
 */
export interface DecisionNodeData extends NodeData {
  options?: string[];
}

/**
 * Use case node specific data
 */
export interface UseCaseNodeData extends NodeData {
  processFlow?: {
    sequence_number: number;
    input_artifacts?: string[];
    output_artifacts?: string[];
  };
  artifacts?: {
    inputs: string[];
    outputs: string[];
  };
}

/**
 * Custom Node Props type that works with the latest XYFlow
 */
export type CustomNodeProps<T = any> = {
  data: T;
  id?: string;
  type?: string;
  selected?: boolean;
  [key: string]: any;
};

export interface ValueNodeData {
  label: string;
  description?: string;
  valueType?: 'agent' | 'useCase' | 'solution';
  amount?: string | number;
  metric?: string;
} 