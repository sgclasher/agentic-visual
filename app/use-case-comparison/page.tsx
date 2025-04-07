import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import UseCaseComparisonView from '../components/UseCaseComparisonView';

// Re-use or import shared types if available
interface Agent {
  sys_id: string;
  name: string;
  description?: string;
  tools?: any[];
}

interface UseCase {
  sys_id: string;
  name: string;
  description?: string;
  agents?: any[];
  triggers?: any[];
  process_flow?: any;
}

interface WorkflowData {
  use_cases: UseCase[];
  agents: { [key: string]: Agent };
  tools: { [key: string]: any };
  capabilities: { [key: string]: any };
}

async function getWorkflowData(): Promise<WorkflowData | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', 'workflow-data.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    return data.data || data;
  } catch (error) {
    console.error('Error reading or parsing workflow data:', error);
    return null;
  }
}

// Server Component for the page
export default async function UseCaseComparisonPage() {
  const initialWorkflowData = await getWorkflowData();

  if (!initialWorkflowData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Error Loading Data</h2>
          <p className="text-red-500">Could not load workflow data from the server.</p>
          <p className="text-gray-500 mt-2">Ensure 'public/workflow-data.json' exists.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Use Case Comparison</h1>
      {/* Pass initial data to the client component */}
      <UseCaseComparisonView initialWorkflowData={initialWorkflowData} />
    </div>
  );
} 