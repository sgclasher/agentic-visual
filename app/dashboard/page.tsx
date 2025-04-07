'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [config, setConfig] = useState({
    instanceUrl: '',
    username: '',
    appScope: '',
    lastFetched: '',
  });
  const [isLoadingStandard, setIsLoadingStandard] = useState(false);
  const [isLoadingRfx, setIsLoadingRfx] = useState(false);
  const [isLoadingHardcodedRfx, setIsLoadingHardcodedRfx] = useState(false);
  const [dataPreviewVisible, setDataPreviewVisible] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load saved configuration from localStorage on component mount
  useEffect(() => {
    const savedConfig = localStorage.getItem('servicenow-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(parsedConfig);
      } catch (e) {
        console.error('Error parsing saved config:', e);
        router.push('/config');
      }
    } else {
      router.push('/config');
    }
  }, [router]);

  // Function to fetch standard Agentic AI data
  const fetchAgenticData = async () => {
    setError('');
    setSuccess('');
    setIsLoadingStandard(true);
    
    try {
      // Get credentials from sessionStorage
      const password = sessionStorage.getItem('servicenow-password');
      
      if (!password) {
        throw new Error('Password not found. Please go to the configuration page and save your credentials again.');
      }
      
      // Make API request
      const response = await fetch('/api/servicenow/agentic-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instanceUrl: config.instanceUrl,
          username: config.username,
          password: password,
          appScope: config.appScope
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Check if the data is empty (no use cases or empty relationships)
        const isEmpty = 
          (!data.data.use_cases || data.data.use_cases.length === 0) ||
          (Object.keys(data.data.agents || {}).length === 0 &&
           Object.keys(data.data.tools || {}).length === 0);
          
        if (isEmpty) {
          console.log('API returned empty or insufficient Agentic AI data, falling back to demo data');
          // Fall back to the hardcoded data endpoint
          await fetchHardcodedRfxData();
          return;
        }
        
        // Save to localStorage for visualization components
        localStorage.setItem('workflow-data', JSON.stringify(data));
        
        // Update configuration with last fetched timestamp
        const updatedConfig = {
          ...config,
          lastFetched: new Date().toLocaleString(),
        };
        localStorage.setItem('servicenow-config', JSON.stringify(updatedConfig));
        setConfig(updatedConfig);
        
        // Show success message
        const useCaseCount = data.data.use_cases?.length || 0;
        const agentCount = Object.keys(data.data.agents || {}).length;
        setSuccess(`Successfully fetched Agentic AI data! (${useCaseCount} use cases, ${agentCount} agents)`);
      } else {
        throw new Error(data.message || 'Failed to fetch Agentic AI data');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      console.error('Error fetching Agentic AI data:', err);
      
      // Fall back to the hardcoded demo data if API call fails
      try {
        console.log('Falling back to hardcoded demo data after API error');
        await fetchHardcodedRfxData();
      } catch (fallbackErr: any) {
        console.error('Error with fallback data:', fallbackErr);
      }
    } finally {
      setIsLoadingStandard(false);
    }
  };

  // Function to fetch hardcoded Agentic AI data for RFX
  const fetchHardcodedRfxData = async () => {
    setError('');
    setSuccess('');
    setIsLoadingHardcodedRfx(true);
    
    try {
      const response = await fetch('/api/servicenow/rfx-data-hardcoded', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Save to localStorage for visualization components
        localStorage.setItem('workflow-data', JSON.stringify(data));
        
        // Update configuration with last fetched timestamp
        const updatedConfig = {
          ...config,
          lastFetched: new Date().toLocaleString(),
        };
        localStorage.setItem('servicenow-config', JSON.stringify(updatedConfig));
        setConfig(updatedConfig);
        
        // Show success message
        const useCaseCount = data.data.use_cases?.length || data.data.useCases?.length || 0;
        const agentCount = Object.keys(data.data.agents || {}).length;
        setSuccess(`Successfully loaded demo Agentic AI data! (${useCaseCount} use cases, ${agentCount} agents)`);
      } else {
        throw new Error(data.message || 'Failed to fetch demo data');
      }
    } catch (err: any) {
      setError(`Error: ${err.message}`);
      console.error('Error fetching demo data:', err);
    } finally {
      setIsLoadingHardcodedRfx(false);
    }
  };

  // Function to save data to public directory
  const saveToPublicDirectory = async () => {
    try {
      const data = localStorage.getItem('workflow-data');
      if (!data) {
        setError('No data to save. Please fetch data first.');
        return;
      }

      const response = await fetch('/api/save-workflow-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error('Failed to save workflow data');
      }

      const result = await response.json();
      if (result.success) {
        setSuccess('Successfully saved workflow data to public directory');
      } else {
        throw new Error(result.message);
      }
    } catch (err: any) {
      setError(`Error saving workflow data: ${err.message}`);
    }
  };

  // Function to toggle data preview
  const toggleDataPreview = () => {
    setDataPreviewVisible(!dataPreviewVisible);
  };

  // Get data to preview from localStorage
  const getDataPreview = () => {
    try {
      const data = localStorage?.getItem('workflow-data');
      if (!data) return 'No data available. Please fetch data first.';
      
      const formattedData = JSON.stringify(JSON.parse(data), null, 2);
      return formattedData;
    } catch (e) {
      return 'Error retrieving data preview. Try refreshing the page.';
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">ServiceNow Agentic AI Dashboard</h1>

      {/* Instance Information */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Instance Information</h2>
        <div className="mb-4">
          <p><strong>Instance URL:</strong> {config.instanceUrl}</p>
          <p><strong>Username:</strong> {config.username}</p>
          <p><strong>Application Scope:</strong> {config.appScope}</p>
          <p><strong>Last Fetched:</strong> {config.lastFetched || 'Never'}</p>
        </div>

        {/* Data Source Selection */}
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-2">Data Source</h3>
          <p className="text-gray-600 mb-3">
            Select how you want to load Agentic AI data:
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={fetchAgenticData}
              disabled={isLoadingStandard}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
            >
              {isLoadingStandard ? 'Connecting...' : 'Connect to ServiceNow'}
            </button>
            
            <button
              onClick={fetchHardcodedRfxData}
              disabled={isLoadingHardcodedRfx}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium disabled:opacity-50"
            >
              {isLoadingHardcodedRfx ? 'Loading...' : 'Load Demo Data'}
            </button>
            
            <Link 
              href="/config" 
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded font-medium"
            >
              Edit Configuration
            </Link>
          </div>
        </div>

        {/* Data Actions */}
        <div>
          <h3 className="text-lg font-medium mb-2">Data Actions</h3>
          <p className="text-gray-600 mb-3">
            After loading data, you can:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={toggleDataPreview}
              className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded font-medium"
            >
              {dataPreviewVisible ? 'Hide Data Preview' : 'Show Data Preview'}
            </button>
            
            <button
              onClick={saveToPublicDirectory}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
            >
              Save to Public Directory
            </button>
          </div>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded mb-6">
          <strong>Error</strong>
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded mb-6">
          <strong>Success</strong>
          <p>{success}</p>
        </div>
      )}

      {/* Data Preview */}
      {dataPreviewVisible && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Data Preview</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-500">
            {getDataPreview()}
          </pre>
        </div>
      )}

      {/* Visualization Options */}
      <h2 className="text-xl font-semibold mt-8 mb-4">Visualization Options</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Executive View</h2>
          <p className="text-gray-600 mb-4">
            High-level visualization of agentic workflows, showing business impact and process flow.
          </p>
          <Link 
            href="/executive-view" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium inline-block"
          >
            Open Executive View
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Use Case Comparison</h2>
          <p className="text-gray-600 mb-4">
            View and compare multiple use cases side by side, showing their agents, tools, and business impact.
          </p>
          <Link 
            href="/use-case-comparison" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium inline-block"
          >
            Open Comparison View
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Use Case Detail View</h2>
          <p className="text-gray-600 mb-4">
            Visualize individual use cases with their agents, tools, and triggers in a clear, professional diagram format.
          </p>
          <Link 
            href="/use-case-view" 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded font-medium inline-block"
          >
            Open Detail View
          </Link>
        </div>
      </div>
    </div>
  );
} 