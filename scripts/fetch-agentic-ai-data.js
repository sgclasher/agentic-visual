#!/usr/bin/env node

/**
 * Agentic AI Architecture Data Fetcher
 * 
 * This script fetches Agentic AI architecture data from ServiceNow using
 * the new agentic-data API and saves it to workflow-data.json.
 * 
 * Usage: node fetch-agentic-ai-data.js [instance] [username] [password] [scope]
 * 
 * Where:
 *   - instance: ServiceNow instance URL (e.g., https://devxxxxx.service-now.com)
 *   - username: ServiceNow username
 *   - password: ServiceNow password
 *   - scope: App scope to filter by (optional)
 * 
 * You can also set these values as environment variables:
 *   - SN_INSTANCE
 *   - SN_USERNAME
 *   - SN_PASSWORD
 *   - SN_SCOPE
 */

const fs = require('fs');
const path = require('path');

// Main script
async function main() {
  try {
    // Get command line arguments or environment variables
    const instanceUrl = process.argv[2] || process.env.SN_INSTANCE;
    const username = process.argv[3] || process.env.SN_USERNAME;
    const password = process.argv[4] || process.env.SN_PASSWORD;
    const appScope = process.argv[5] || process.env.SN_SCOPE;
    
    // Check required parameters
    if (!instanceUrl || !username || !password) {
      console.error('Error: Missing required parameters');
      console.log('Usage: node fetch-agentic-ai-data.js [instance] [username] [password] [scope]');
      console.log('Or set environment variables: SN_INSTANCE, SN_USERNAME, SN_PASSWORD, SN_SCOPE');
      process.exit(1);
    }
    
    console.log(`Fetching Agentic AI data from ${instanceUrl}${appScope ? ` for scope ${appScope}` : ''}...`);
    
    // Use local API endpoint to fetch data
    const localApiUrl = 'http://localhost:3000/api/servicenow/agentic-data';
    
    // Create payload for our API
    const payload = {
      instanceUrl,
      username,
      password,
      appScope
    };
    
    // Make API request using Node.js fetch API
    console.log(`Sending request to ${localApiUrl}...`);
    
    const apiResponse = await fetch(localApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      throw new Error(`API request failed: ${apiResponse.status} ${apiResponse.statusText}\n${errorText}`);
    }
    
    const responseData = await apiResponse.json();
    
    if (!responseData.success) {
      throw new Error(`API returned error: ${responseData.error || responseData.message}`);
    }
    
    // Get the workflow data
    const workflowData = responseData.data;
    
    console.log('Processing workflow data...');
    
    // Create the output file path
    const outputFile = path.join(process.cwd(), 'public', 'workflow-data.json');
    
    // Save the data
    fs.writeFileSync(outputFile, JSON.stringify(workflowData, null, 2));
    
    console.log(`Agentic AI data saved to ${outputFile}`);
    
    // Additional stats
    const useCasesCount = workflowData.use_cases?.length || 0;
    const agentsCount = Object.keys(workflowData.agents || {}).length;
    const toolsCount = Object.keys(workflowData.tools || {}).length;
    const capabilitiesCount = Object.keys(workflowData.capabilities || {}).length;
    const genaiConfigsCount = Object.keys(workflowData.genai_configs || {}).length;
    const triggersCount = Object.keys(workflowData.triggers || {}).length;
    
    console.log(`\nData Summary:`);
    console.log(`- Use Cases: ${useCasesCount}`);
    console.log(`- Agents: ${agentsCount}`);
    console.log(`- Tools: ${toolsCount}`);
    console.log(`- Capabilities: ${capabilitiesCount}`);
    console.log(`- GenAI Configs: ${genaiConfigsCount}`);
    console.log(`- Triggers: ${triggersCount}`);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    process.exit(1);
  }
}

// Execute the main function
main(); 