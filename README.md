# ServiceNow Agentic AI Visualization

A visualization tool for ServiceNow's Agentic AI capabilities, allowing you to explore and understand the relationship between agents, tools, use cases, triggers, and capabilities.

## Project Overview

This application connects to ServiceNow instances to visualize Agentic AI configurations, including:

- **AI Agents** - The core autonomous workers that execute specific tasks
- **Agent Tools** - The capabilities each agent can use to complete tasks
- **Use Cases** - Specific business scenarios where Agentic AI is applied
- **Triggers** - The conditions that initiate agent execution
- **GenAI Config** - The LLM configurations associated with agent capabilities

The app provides multiple visualization modes:
1. **Executive View** - Provides a business-focused, high-level overview of the agentic workflow 
2. **Use Case Comparison** - Allows side-by-side comparison of multiple use cases
3. **Use Case Detail** - Displays a detailed view of individual use cases with their agent structures

## RFX-Specific Implementation

**IMPORTANT**: This application is currently optimized specifically for the RFX (Request for X) agentic AI application. It includes:

1. **RFX-Specific Data Structure**:
   - Tailored to visualize the RFX process flow phases (Intake → Creation → Execution → Evaluation → Selection)
   - Uses hardcoded business value metrics specific to RFX processes
   - Expects certain agent naming patterns and tool relationships common in RFX scenarios

2. **Custom Data Enrichment**:
   - Adds `sequence_number` during data processing to order use cases in the RFX workflow
   - Maps phases to specific visual representations in the timeline view
   - Contains hardcoded descriptions for RFX-specific agent types

3. **Demo Data**:
   - The fallback demo data (`/api/servicenow/rfx-data-hardcoded`) contains sample RFX process components
   - Business impact metrics are preconfigured for RFX use cases

To adapt this application for a different agentic AI solution, you would need to modify:
- The data processing logic in `/app/api/servicenow/agentic-data/route.ts`
- The hardcoded values in visualization components
- The demo data structure in `/app/api/servicenow/rfx-data-hardcoded/route.ts`

### Data Structure

The application works with ServiceNow's Agentic AI data structure, which includes:

```typescript
interface WorkflowData {
  script_execution_info?: any;
  use_cases: UseCase[];
  agents: { [key: string]: Agent };
  tools: { [key: string]: Tool };
  capabilities: { [key: string]: Capability };
  genai_configs: { [key: string]: GenAIConfig };
  triggers: { [key: string]: Trigger };
  execution?: {
    timestamp: string;
    source: string;
  };
}
```

### Data Handling

The application handles two primary data sources:
1. **Direct API Connection** - Fetches real data from ServiceNow instances
2. **Demo Data** - Provides sample data when the API returns empty results
   
The app includes fallback mechanisms to ensure visualizations show meaningful data even when API connections fail.

## Adapting for Other Agentic Apps

To adapt this visualization tool for other ServiceNow agentic applications:

### Short-Term Solution

1. **Update the Demo Data**:
   - Modify `/app/api/servicenow/rfx-data-hardcoded/route.ts` to reflect your application's structure
   - Replace RFX-specific use cases, agents, and tools with your application's components

2. **Edit Visualization Components**:
   - Update hardcoded business values in `ExecutiveAgenticWorkflowView.tsx`
   - Modify agent description mappings in the visualization components
   - Adjust phase ordering to match your workflow

3. **Modify Data Transformation**:
   - Update the API endpoint to properly identify and order phases from your application
   - Adjust sequence assignment logic to reflect your process flow

### Long-Term Solution: Configuration-Driven Architecture

For a more flexible approach:

1. **Implement Configuration Files**:
   - Create app-specific configuration files with mappings for different applications
   - Store phase orders, business value metrics, and descriptions

2. **Parameterize API Endpoints**:
   - Add an `appContext` parameter to fetch calls
   - Update data processing logic to use configuration based on app context

3. **Abstract Visualization Components**:
   - Remove hardcoded values from components
   - Inject configuration through props
   - Create app profiles for different ServiceNow applications

4. **Build Configuration UI**:
   - Add configuration pages to define phase names, ordering, and metrics
   - Allow saving of different app profiles
   - Implement schema discovery to auto-detect application structure

## Recent Changes

1. **New Visualization Views**:
   - Added Executive View for business-focused visualization
   - Created Use Case Comparison view with navigation controls
   - Implemented detailed Use Case view with agent relationship diagram

2. **Dashboard Simplification**:
   - Reorganized buttons into logical sections: "Data Source" and "Data Actions"
   - Improved UI with clearer button labeling
   - Added fallback logic when API returns empty results

3. **Enhanced Visualizations**:
   - Updated visualizations to handle various data formats
   - Improved error handling and loading states
   - Added proper data normalization to handle different API responses

4. **App Focus Realignment**:
   - Shifted focus from RFX to Agentic AI components
   - Updated descriptions and UI text to align with Agentic AI terminology
   - Implemented proper data handling for Agentic AI structures

5. **Navigation & UX Improvements**:
   - Simplified the navigation with essential pages only
   - Improved error messages and user feedback
   - Added clear descriptions for functionality

6. **API Optimization**:
   - Streamlined Agentic AI data API to fetch only essential fields
   - Minimized payload size by removing extraneous data
   - Improved the relationship mapping between Use Cases, Agents, and Tools

## Recent Enhancements

### May 2024 Updates

#### Workflow Visualization Enhancements:
- **Improved Tool Toggle Functionality**:
  - Fixed event propagation issues with tool visibility toggles
  - Converted toggle elements to proper button elements for better accessibility
  - Implemented robust click handling to ensure toggles work consistently
  - Added debug logging to aid future maintenance

- **Optimized Node Spacing**:
  - Greatly increased vertical spacing between agents and their tools
  - Implemented fixed positioning for tool containers to prevent overlap
  - Adjusted overall diagram layout for better readability

- **Hierarchical Value Representation**:
  - Redesigned business value nodes with a three-tier system:
    - **Agent-Level Values** (Emerald Green): Specific metrics for each individual agent
    - **Use Case-Level Values** (Blue): Overall process improvements for the specific use case
    - **Solution-Level Value** (Purple): Enterprise-wide benefits of the entire agentic solution
  - Added contextual descriptions to each value node
  - Intelligently generated appropriate metrics based on agent functionality
  - Connected value nodes to relevant elements (agents, tools, other values) to show relationships

- **Visual Design Improvements**:
  - Introduced color-coding for different types of value nodes
  - Added descriptions to value nodes for better context
  - Implemented intelligent positioning of value nodes with alternating offsets
  - Created visual hierarchy that tells a coherent value story

#### Technical Implementation:
- **Style Enhancements**:
  - Added custom CSS targeting for React Flow node buttons
  - Implemented explicit z-index management for interactive elements
  - Added pointer-events handling to ensure UI responsiveness
  - Applied consistent styling across all node types

- **State Management Improvements**:
  - Replaced Set-based state with array-based state for better reactivity
  - Implemented useCallback for event handlers to prevent unnecessary re-renders
  - Enhanced dependency arrays in useEffect hooks for optimal performance
  - Improved state initialization with meaningful defaults

### April 2024 Updates

#### UI/UX Improvements:
- **Header Optimization**: Compacted the dashboard header to save space and removed redundant "End-to-End Process Flow" heading.
- **Clean Visualization**: Removed drop shadows from all workflow nodes for a cleaner, more professional appearance.
- **Improved Spacing and Alignment**: 
  - Increased whitespace between nodes to prevent overlapping
  - Fixed connection line centering with explicit handle positioning
  - Implemented mathematical layout calculations for perfect node distribution

#### New Features:
- **Tool Visibility Toggle**: 
  - Added "Show/Hide tools" buttons to each agent node
  - Tools now appear in an organized, stacked format below their parent agent
  - One agent's tools are visible by default for better discoverability
  - Eliminates visual clutter while maintaining accessibility to tool details

#### Technical Improvements:
- **React Flow Customization**:
  - Implemented custom handle configuration with explicit IDs for precise edge connections
  - Added global CSS overrides to enforce consistent node styling
  - Replaced standard button elements with custom div-based toggles to avoid event propagation issues
  - Set initial state to show one agent's tools by default

#### Workflow Visualization Architecture:
- **Node Organization**:
  - Orchestrator node centered at the top
  - Trigger nodes positioned to the side of the orchestrator
  - Agent nodes evenly distributed and centered
  - Tool nodes consolidated into stacked groups below respective agents
  - Value nodes (metrics) distributed to show business impact across the workflow

These enhancements make the visualization more intuitive, cleaner, and more interactive while preserving all the essential information about the ServiceNow Agentic AI components and their relationships.

## Next Steps

1. **Animation Refinements**:
   - Consider adding transitions for tool nodes when toggling visibility
   - Optimize animation timing for smoother flow

2. **Business Value Enhancements**:
   - Connect the hierarchical value system to real metrics from ServiceNow
   - Add configuration options for customizing value metrics
   - Implement hover tooltips with detailed ROI calculations for each value node

3. **Data Enrichment**:
   - Add tooltips with additional details for nodes
   - Display more metadata when hovering over connections
   - Create a "details panel" that shows selected node information

4. **Rendering Optimizations**:
   - Further fine-tune the layout algorithm for larger agent teams
   - Add additional responsive adjustments for different screen sizes
   - Implement minimap highlighting for currently visible sections

## Known Issues

1. ~~**API Data Structure Mismatch**~~: 
   - ~~The standard API endpoint (`/api/servicenow/agentic-data`) returns empty data in some instances~~
   - **RESOLVED**: The API now properly fetches the complete Agentic AI architecture components, matching the required data structure with optimized payload size

2. **Port Conflicts**: 
   - The application may encounter port conflicts (3000-3010)
   - Kill all Node processes before starting the app

3. **Data Transformation**:
   - Different data formats between real and demo data require normalization
   - Currently handled through utility functions in the visualization components

4. **RFX-Specific Implementation**:
   - Visualization is optimized for RFX workflows and may not accurately represent other agentic applications
   - Hardcoded values would need updating for other applications (see "Adapting for Other Agentic Apps" section)

## Development Setup

1. Clone the repository
2. Install dependencies:
```
npm install
```
3. Run the development server:
```
npm run dev
```
4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Fetching Agentic AI Data

The application now includes tools to fetch actual Agentic AI architecture data from ServiceNow:

1. **Using the Web Interface**:
   - Navigate to the Configuration page
   - Enter your ServiceNow instance details (URL, username, password)
   - Optionally specify an app scope to filter by
   - Click "Fetch Agentic AI Data" to retrieve and save the data
   - The app will automatically use this data for visualizations

2. **Using the Command Line Script**:
   - Make sure the development server is running (`npm run dev`)
   - Run the fetch script with your ServiceNow credentials:
   ```
   node scripts/fetch-agentic-ai-data.js [instance-url] [username] [password] [scope]
   ```
   - Example:
   ```
   node scripts/fetch-agentic-ai-data.js https://myinstance.service-now.com admin password x_nowge_rfx_ai
   ```
   - The script will save the data to `public/workflow-data.json`
   - Refresh your browser to see the updated visualizations

3. **Using Environment Variables**:
   - Set the following environment variables:
   ```
   SN_INSTANCE=https://myinstance.service-now.com
   SN_USERNAME=admin
   SN_PASSWORD=password
   SN_SCOPE=x_nowge_rfx_ai
   ```
   - Run the script without arguments:
   ```
   node scripts/fetch-agentic-ai-data.js
   ```

The fetched data includes the essential Agentic AI architecture components (Use Cases, Agents, Tools, Capabilities, GenAI Configs, and Triggers) and their relationships, optimized for efficient visualization by including only the necessary fields for each component.

## Project Structure

- `/app` - Main application code
  - `/api` - Backend API routes for ServiceNow connectivity
  - `/components` - Reusable UI components
  - `/config` - Configuration page
  - `/dashboard` - Main dashboard page
  - `/use-case-view` - Detailed use case visualization
  - `/use-case-comparison` - Side-by-side use case comparison
  - `/executive-view` - Business-focused workflow visualization
- `/public` - Static assets and cached data

## API Routes

- `/api/servicenow/test-connection` - Tests ServiceNow connectivity
- `/api/servicenow/agentic-data` - Fetches Agentic AI data from ServiceNow
- `/api/servicenow/rfx-data-hardcoded` - Provides demo data for RFX use cases
- `/api/save-workflow-data` - Saves workflow data to the public directory

## Key Components

- `UseCaseDetailView.tsx` - Visualizes a single use case with its agents and tools
- `UseCaseComparisonView.tsx` - Compares multiple use cases side by side
- `ExecutiveAgenticWorkflowView.tsx` - Provides a business-focused view of the entire process
- `Navigation.tsx` - Main navigation component

## Technology Stack

- Next.js 14.x
- React 18.x
- TypeScript
- TailwindCSS
- Framer Motion (for animations)

## License

MIT 

## Key Files

The application is structured as follows, with these key files being most important for understanding the visualization components:

### Core Visualization Components

- `/app/components/ProcessFlowTimeline.tsx` - Component for visualizing process phases with dynamic information panels
- `/app/components/ExecutiveAgenticWorkflowView.tsx` - Main executive dashboard view with process flow, agents, and metrics
- `/app/components/AnimatedWorkflow.tsx` - Visualization for agent workflow diagrams using React Flow
- `/app/components/BusinessImpactMetrics.tsx` - Visualization for business metrics and ROI data
- `/app/components/AgentFlow.tsx` - Base component for agent relationship diagrams
- `/app/components/LinearFlowDiagram.tsx` - Linear flow visualization for agent sequences

### Page Components

- `/app/page.tsx` - Home/landing page
- `/app/dashboard/page.tsx` - Main dashboard
- `/app/use-case-view/page.tsx` - Detailed view of a single use case
- `/app/use-case-comparison/page.tsx` - Side-by-side comparison of use cases
- `/app/executive-view/page.tsx` - Business-focused view for decision makers
- `/app/config/page.tsx` - Configuration page for ServiceNow connections

### Data Processing and API Routes

- `/app/api/servicenow/agentic-data/route.ts` - API for fetching and processing Agentic AI data
- `/app/api/servicenow/rfx-data-hardcoded/route.ts` - Demo data for RFX workflows
- `/app/api/servicenow/test-connection/route.ts` - API for testing ServiceNow connectivity
- `/app/api/save-workflow-data/route.ts` - API for saving workflow data

### Removed Files

The following unused files, directories, and empty folders have been cleaned up to streamline the codebase:

- `/app/linear-view/` - Deprecated linear view replaced by more advanced visualizations
- `/app/phase-view/` - Deprecated phase view replaced by ProcessFlowTimeline
- `/app/documentation/` - Documentation now consolidated in README
- `/app/about/` - Unused about page
- `/app/explorer/` - Unused explorer page
- `/app/components/Navbar.tsx` - Replaced by Navigation component
- `/pages/` - Empty legacy Next.js pages directory (app directory is used instead)
- Test files in the root directory #   a g e n t i c - v i s u a l  
 