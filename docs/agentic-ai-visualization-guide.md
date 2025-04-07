# ServiceNow Agentic AI Visualization Guide

This guide explains how to effectively use the ServiceNow Agentic AI Visualization tool to explore and understand your Agentic AI architecture.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Fetching Agentic AI Data](#fetching-data)
4. [Visualization Views](#visualization-views)
5. [Data Explorer](#data-explorer)
6. [Troubleshooting](#troubleshooting)

## Introduction

ServiceNow's Agentic AI Framework enables autonomous AI agents to perform complex tasks across your instance. This visualization tool helps you understand:

- How Use Cases, Teams, and Agents are connected
- What Tools each Agent has access to
- How Tools connect to Capabilities and GenAI Configurations
- How Triggers initiate agent workflows

The tool provides multiple visualization views to help you understand the relationships between these components.

## Getting Started

1. Start the application with `npm run dev`
2. Navigate to [http://localhost:3000](http://localhost:3000)
3. You'll see the dashboard with various options

### Navigation

- **Dashboard**: Overview and access to all features
- **Phase View**: Explore Agents grouped by phases
- **Linear View**: Visualize the sequential flow of Use Cases
- **Configuration**: Set up ServiceNow connectivity
- **Data Explorer**: Examine the raw Agentic AI data

## Fetching Data

There are three ways to fetch Agentic AI data from ServiceNow:

### Method 1: Using the Web Interface

1. Go to the **Configuration** page
2. Enter your ServiceNow instance details:
   - Instance URL (e.g., https://yourinstance.service-now.com)
   - Username
   - Password
   - App Scope ID (optional, to filter by a specific application)
3. Click **Fetch Agentic AI Data**
4. The data will be saved to `public/workflow-data.json` and loaded automatically

### Method 2: Using the Command Line Script

1. Ensure the development server is running (`npm run dev`)
2. Open a terminal and run:

```bash
node scripts/fetch-agentic-ai-data.js [instance-url] [username] [password] [scope]
```

Example:
```bash
node scripts/fetch-agentic-ai-data.js https://myinstance.service-now.com admin password x_nowge_rfx_ai
```

3. The script will retrieve the data and save it to `public/workflow-data.json`
4. Refresh your browser to see the updated visualizations

### Method 3: Using Environment Variables

1. Set the following environment variables:
```
SN_INSTANCE=https://myinstance.service-now.com
SN_USERNAME=admin
SN_PASSWORD=password
SN_SCOPE=x_nowge_rfx_ai
```

2. Run the script without arguments:
```bash
node scripts/fetch-agentic-ai-data.js
```

## Visualization Views

### Phase View

The Phase View organizes Use Cases and Agents by their functional phases:

1. **Creation**: Initial data gathering and creation processes
2. **Validation**: Verification and approval processes
3. **Interaction**: Communication with users or systems
4. **Evaluation**: Analysis and assessment processes
5. **Decision**: Selection and recommendation processes

This view helps understand what agents are involved in each phase of a workflow.

### Linear View

The Linear View presents Use Cases in sequential order, showing:

- How Use Cases connect to form a workflow
- Input and output artifacts for each Use Case
- Agents associated with each Use Case

This view is ideal for understanding the end-to-end process flow.

## Data Explorer

The Data Explorer provides access to the raw Agentic AI component data:

1. **Use Cases**: Business scenarios where Agentic AI is applied
2. **Agents**: The autonomous AI workers
3. **Tools**: Capabilities each agent can use
4. **Capabilities**: Skills and functions that tools connect to
5. **GenAI Configs**: LLM configurations for AI components
6. **Triggers**: Conditions that initiate agent execution

Use the explorer to:
- View detailed component information
- Understand relationships between components
- Copy component IDs for reference

## Troubleshooting

### No Data Appears in Visualizations

1. Check if the application successfully fetched data from ServiceNow:
   - Look for data in `public/workflow-data.json`
   - Check the browser console for any API errors

2. Verify your ServiceNow credentials and permissions:
   - Ensure the user has access to the Agentic AI tables
   - Test the connection on the Configuration page

3. Try the test script to verify API connectivity:
```bash
node scripts/test-agentic-api.js
```

### Application Doesn't Start

1. Check for port conflicts:
   - The application uses port 3000 by default
   - Kill existing processes or change the port in package.json

2. Verify dependencies are installed:
```bash
npm install
```

### Data Structure Issues

If the visualizations show incorrect or incomplete data:

1. Examine the data structure in Data Explorer
2. Check that the fetched data includes all component types
3. Verify that the instance has Agentic AI components configured

## Support

For help or feature requests, please create an issue on the GitHub repository. 