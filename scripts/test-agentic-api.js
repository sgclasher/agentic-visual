#!/usr/bin/env node

/**
 * Agentic AI API Tester
 * 
 * This script tests the agentic-data API endpoint directly by submitting
 * a request and analyzing the response.
 * 
 * Usage: node test-agentic-api.js [instance] [username] [password] [scope]
 */

// Default values (same as in fetch-agentic-data.sh)
const DEFAULT_INSTANCE = "https://nowgenticllcdemo1.service-now.com";
const DEFAULT_USERNAME = "integrationUser";
const DEFAULT_PASSWORD = "J5)F{b!L]3hPkrU]V_j:c[({h4QV@iQn7Ob!@o+rne0A<VV+*U.z^[r)e&@mO.o7}E1{xJSyAfDhd:A&?*LUa4TCYl;QZXNF@]_a";
const DEFAULT_SCOPE = "x_nowge_rfx_ai";

// Get command line arguments or use defaults
const instanceUrl = process.argv[2] || DEFAULT_INSTANCE;
const username = process.argv[3] || DEFAULT_USERNAME;
const password = process.argv[4] || DEFAULT_PASSWORD;
const appScope = process.argv[5] || DEFAULT_SCOPE;

// Local API endpoint
const localApiUrl = 'http://localhost:3000/api/servicenow/agentic-data';

// First check if the server is running
async function checkServerRunning() {
  try {
    const response = await fetch('http://localhost:3000', { 
      method: 'HEAD',
      timeout: 2000 
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function testApi() {
  console.log('Testing Agentic AI API...');
  
  // Check if server is running
  const serverRunning = await checkServerRunning();
  if (!serverRunning) {
    console.error('\nERROR: Development server is not running!');
    console.error('Please start the server with "npm run dev" before running this script.');
    console.error('\nIf the server is running on a different port, update the localApiUrl in this script.');
    process.exit(1);
  }
  
  console.log(`Instance: ${instanceUrl}`);
  console.log(`Scope: ${appScope}`);
  console.log(`API Endpoint: ${localApiUrl}`);
  console.log('Sending request...');

  try {
    // Create payload
    const payload = {
      instanceUrl,
      username,
      password,
      appScope
    };

    // Send request
    const startTime = Date.now();
    const response = await fetch(localApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    const endTime = Date.now();
    const responseTime = (endTime - startTime) / 1000;

    console.log(`Response received in ${responseTime.toFixed(2)} seconds`);
    console.log(`Status: ${response.status} ${response.statusText}`);

    // Check response status
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:');
      console.error(errorText);
      process.exit(1);
    }

    // Parse response
    const data = await response.json();
    
    if (!data.success) {
      console.error('API returned failure:');
      console.error(data.error || data.message || 'Unknown error');
      process.exit(1);
    }

    console.log('\nAPI Response Summary:');
    console.log(`Success: ${data.success}`);
    console.log(`Message: ${data.message}`);

    // Data counts
    const workflowData = data.data;
    const useCasesCount = Array.isArray(workflowData.use_cases) ? workflowData.use_cases.length : 0;
    const agentsCount = workflowData.agents ? Object.keys(workflowData.agents).length : 0;
    const toolsCount = workflowData.tools ? Object.keys(workflowData.tools).length : 0;
    const capabilitiesCount = workflowData.capabilities ? Object.keys(workflowData.capabilities).length : 0;
    const genaiConfigsCount = workflowData.genai_configs ? Object.keys(workflowData.genai_configs).length : 0;
    const triggersCount = workflowData.triggers ? Object.keys(workflowData.triggers).length : 0;

    console.log('\nData Summary:');
    console.log(`- Use Cases: ${useCasesCount}`);
    console.log(`- Agents: ${agentsCount}`);
    console.log(`- Tools: ${toolsCount}`);
    console.log(`- Capabilities: ${capabilitiesCount}`);
    console.log(`- GenAI Configs: ${genaiConfigsCount}`);
    console.log(`- Triggers: ${triggersCount}`);

    if (useCasesCount === 0 && agentsCount === 0 && toolsCount === 0) {
      console.log('\nNOTE: No data was returned from the API. This could be because:');
      console.log('1. The scope doesn\'t contain any Agentic AI components');
      console.log('2. The credentials don\'t have sufficient permissions');
      console.log('3. The ServiceNow instance doesn\'t have Agentic AI components configured');
      console.log('\nTry with a different scope or credentials, or check your ServiceNow instance configuration.');
    } else {
      // Sample of each component type
      if (useCasesCount > 0) {
        const sampleUseCase = Array.isArray(workflowData.use_cases) ? workflowData.use_cases[0] : null;
        console.log('\nSample Use Case:');
        console.log(`- ID: ${sampleUseCase.sys_id}`);
        console.log(`- Name: ${sampleUseCase.name}`);
        console.log(`- Agents: ${sampleUseCase.agents?.length || 0}`);
        console.log(`- Triggers: ${sampleUseCase.triggers?.length || 0}`);
      }

      if (agentsCount > 0) {
        const agentId = Object.keys(workflowData.agents)[0];
        const sampleAgent = workflowData.agents[agentId];
        console.log('\nSample Agent:');
        console.log(`- ID: ${sampleAgent.sys_id}`);
        console.log(`- Name: ${sampleAgent.name}`);
        console.log(`- Tools: ${sampleAgent.tools?.length || 0}`);
      }
    }

    console.log('\nAPI test completed successfully!');
  } catch (error) {
    console.error('Error testing API:');
    console.error(error);
    process.exit(1);
  }
}

// Run the test
testApi(); 