'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfigPage() {
  const router = useRouter();
  
  // Hardcoded credentials for testing (will be removed in production)
  const PREFILLED_INSTANCE_URL = 'https://nowgenticllcdemo1.service-now.com';
  const PREFILLED_USERNAME = 'integrationUser';
  const PREFILLED_PASSWORD = 'J5)F{b!L]3hPkrU]V_j:c[({h4QV@iQn7Ob!@o+rne0A<VV+*U.z^[r)e&@mO.o7}E1{xJSyAfDhd:A&?*LUa4TCYl;QZXNF@]_a';
  const PREFILLED_SCOPE = 'x_nowge_rfx_ai';
  
  const [config, setConfig] = useState({
    instanceUrl: PREFILLED_INSTANCE_URL,
    username: PREFILLED_USERNAME,
    password: PREFILLED_PASSWORD,
    appScope: PREFILLED_SCOPE
  });
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<{success?: boolean; message?: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Load saved config (except password) when component mounts
  useEffect(() => {
    const savedConfig = localStorage.getItem('servicenow-config');
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig);
        setConfig(prev => ({
          ...prev,
          instanceUrl: parsedConfig.instanceUrl || PREFILLED_INSTANCE_URL,
          username: parsedConfig.username || PREFILLED_USERNAME,
          appScope: parsedConfig.appScope || PREFILLED_SCOPE
        }));
      } catch (e) {
        console.error('Error parsing saved config', e);
      }
    }
  }, []);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Save configuration (excluding password) to localStorage
      localStorage.setItem('servicenow-config', JSON.stringify({
        instanceUrl: config.instanceUrl,
        username: config.username,
        appScope: config.appScope,
        lastFetched: ''
      }));
      
      // Store password in sessionStorage (cleared when browser is closed)
      sessionStorage.setItem('servicenow-password', config.password);
      
      // Show success message and redirect
      setTestStatus({ success: true, message: 'Configuration saved successfully!' });
      
      // Redirect to dashboard after saving
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (e: any) {
      setError(e.message || 'An error occurred saving the configuration');
    }
  };
  
  const testConnection = async () => {
    setIsTesting(true);
    setTestStatus(null);
    setError(null);
    
    try {
      const response = await fetch('/api/servicenow/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceUrl: config.instanceUrl,
          username: config.username,
          password: config.password
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setTestStatus({
          success: true,
          message: data.message || 'Connection successful!'
        });
      } else {
        setTestStatus({
          success: false,
          message: data.error || data.message || 'Connection failed'
        });
      }
    } catch (e: any) {
      setTestStatus({
        success: false,
        message: e.message || 'An error occurred testing the connection'
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-6">ServiceNow API Configuration</h1>
      
      <div className="bg-white shadow p-6 rounded-lg">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ServiceNow Instance URL
            </label>
            <input
              type="text"
              name="instanceUrl"
              value={config.instanceUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://yourinstance.service-now.com"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={config.username}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Username"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={config.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Password"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Note: Password is stored temporarily in your browser's session storage and 
              will be cleared when you close your browser.
            </p>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Application Scope (Optional)
            </label>
            <input
              type="text"
              name="appScope"
              value={config.appScope}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g., x_nowge_rfx_ai"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty to get data from all applications. Or specify a scope like "x_nowge_rfx_ai".
            </p>
          </div>
          
          <div className="flex space-x-4">
            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Configuration
            </button>
            
            <button
              type="button"
              onClick={testConnection}
              disabled={isTesting}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400"
            >
              {isTesting ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </form>
        
        {testStatus && (
          <div 
            className={`mt-4 p-4 rounded-md ${
              testStatus.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}
          >
            <p 
              className={`text-sm ${
                testStatus.success ? 'text-green-700' : 'text-red-700'
              }`}
            >
              {testStatus.message}
            </p>
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-4 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
} 