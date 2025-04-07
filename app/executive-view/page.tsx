import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import ExecutiveAgenticWorkflowView from '../components/ExecutiveAgenticWorkflowView';

// Define types for the data structure (consider moving to a shared types file later)
interface Agent {
  sys_id: string;
  name: string;
  description?: string;
  tools?: any[]; // Define more specific type if known
}

interface UseCase {
  sys_id: string;
  name: string;
  description?: string;
  agents?: any[]; // Define more specific type if known
  triggers?: any[]; // Define more specific type if known
  process_flow?: any; // Define more specific type if known
}

interface WorkflowData {
  use_cases: UseCase[];
  agents: { [key: string]: Agent };
  tools: { [key: string]: any };
  capabilities: { [key: string]: any };
  // Add other potential top-level keys if needed
}

async function getWorkflowData(): Promise<WorkflowData | null> {
  try {
    // Construct the absolute path to the JSON file in the public directory
    const filePath = path.join(process.cwd(), 'public', 'workflow-data.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(fileContent);
    // The data might be nested under a 'data' key from the API response structure
    return data.data || data; 
  } catch (error) {
    console.error('Error reading or parsing workflow data:', error);
    // Return null or throw an error depending on desired handling
    // Returning null allows the client component to potentially handle the error state
    return null; 
  }
}

// This is now an async Server Component
export default async function ExecutiveViewPage() {
  const initialWorkflowData = await getWorkflowData();

  // Error handling if data fetch failed server-side
  if (!initialWorkflowData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4 text-red-600">Error Loading Data</h2>
          <p className="text-red-500">Could not load workflow data from the server.</p>
          <p className="text-gray-500 mt-2">Please ensure 'public/workflow-data.json' exists and is valid.</p>
        </div>
      </div>
    );
  }

  // Pass the server-fetched data to the client component
  return (
    <div className="container mx-auto px-4 py-8">
      <ExecutiveAgenticWorkflowView initialWorkflowData={initialWorkflowData} />
    </div>
  );
} 