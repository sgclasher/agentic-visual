'use client';

import React from 'react';
import EditableWorkflow from '../components/EditableWorkflow';

const PlaygroundPage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Agentic Workflow Playground</h1>
      <p className="mb-6 text-gray-600">
        Create your own agentic workflows by dragging nodes and connecting them together. 
        Use the panel on the left to add new components to your workflow.
      </p>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <EditableWorkflow />
      </div>
    </div>
  );
};

export default PlaygroundPage; 