# ServiceNow Agentic AI Visualization

A visual workflow tool for ServiceNow's Agentic AI framework, showcasing agent relationships, orchestration, and value metrics using React Flow. This application provides both visualization and interactive playground features for working with agentic AI workflows.

## Features

- Interactive agent workflow visualization
- Orchestration paths and agent relationships
- Tools and capabilities visualization
- Business value metrics display
- Toggleable views (Vertical/Horizontal layout)
- Animation and visual enhancements
- Interactive workflow playground for creating custom agent workflows

## Technology Stack

- Next.js 14
- React
- XY Flow (React Flow v12)
- Framer Motion
- TailwindCSS
- TypeScript
- Dagre (for graph layouts)
- nanoid (for generating unique IDs)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser (or the port indicated in the console output)

## Application Overview

### Core Features

#### 1. Read-Only Visualizations

The app provides several specialized views for exploring and understanding ServiceNow Agentic AI configurations:

- **Executive View** - A business-focused overview showing the entire workflow with value metrics
- **Use Case Comparison** - Side-by-side comparison of multiple use cases
- **Use Case Detail** - Detailed visualization of a single use case with its agents and tools
- **Dashboard** - Quick access to all visualization types with control panels

#### 2. Interactive Playground

The playground allows users to create and modify their own agentic AI workflows:

- Create custom nodes via drag-and-drop
- Connect nodes to establish relationships
- Edit node properties by double-clicking
- Arrange and organize the workflow canvas
- Experiment with different agent topologies

### Application Architecture

#### Directory Structure

```
/app
  /components         # Reusable UI components
    /workflow-nodes   # Node type components for workflows
    AnimatedWorkflow.tsx    # Read-only workflow visualization
    EditableWorkflow.tsx    # Interactive workflow playground
    Navigation.tsx          # Site-wide navigation component
  /api                # API routes for data fetching
  /dashboard          # Dashboard page
  /executive-view     # Business-focused visualization
  /use-case-view      # Detailed use case visualization
  /use-case-comparison # Side-by-side comparison
  /playground         # Interactive playground page
  /config             # Configuration page
  /styles             # Global styles
```

#### Key Components

1. **AnimatedWorkflow** - The core visualization component for read-only workflows
   - Uses React Flow to display nodes and connections
   - Implements custom node types for different workflow elements
   - Supports toggleable layout direction (vertical/horizontal)
   - Provides options to show/hide tools and value metrics

2. **EditableWorkflow** - Interactive playground for creating and editing workflows
   - Provides a draggable node palette for adding components
   - Implements editable node types with double-click editing
   - Supports drag-and-drop node creation and connection
   - Includes controls for navigating the canvas

3. **Navigation** - Site-wide navigation with access to all views
   - Responsive design for desktop and mobile
   - Direct access to the playground via the pencil icon

#### Data Flow

1. **ServiceNow API Integration**
   - Fetches real data from ServiceNow instances
   - Transforms API responses into visualization-ready format
   - Falls back to demo data when API returns empty results

2. **Visualization Pipeline**
   - Processes raw data into node and edge configurations
   - Applies layout algorithms to position elements
   - Renders interactive SVG-based visualizations

3. **User Interaction**
   - Captures user events (clicks, drags, edits)
   - Updates internal state and re-renders affected components
   - Provides visual feedback for actions

## Usage Guide

### Read-Only Visualizations

Navigate to different views using the top navigation bar:

1. **Executive View** (`/executive-view`)
   - Shows the entire workflow with business value metrics
   - Toggle tools and value metrics using the control panel
   - Switch between vertical and horizontal layouts

2. **Use Case Detail** (`/use-case-view`)
   - Detailed view of a single use case
   - Shows all agents, tools, and their relationships
   - Provides context on agent responsibilities

3. **Use Case Comparison** (`/use-case-comparison`)
   - Compare multiple use cases side by side
   - Navigate between use cases with arrow controls
   - See differences in agent utilization and flow

### Interactive Playground

Access the playground by clicking the pencil icon in the top-right corner or navigating to `/playground`:

1. **Adding Components**
   - Drag node types from the left panel onto the canvas
   - Node types include: Agents, Triggers, Tools, and Value nodes

2. **Editing Components**
   - Double-click on any node to edit its label and description
   - Click away or press Enter to save changes

3. **Connecting Components**
   - Drag from a node's handle (connection point) to another node
   - Connections create relationships between workflow elements

4. **Navigation**
   - Use the controls in the bottom-right to zoom and pan
   - The minimap helps navigate larger workflows

## Node Types and Their Roles

The application visualizes several types of nodes, each representing different elements of the agentic AI workflow:

1. **Orchestrator Node** (Red)
   - Central coordinator of the workflow
   - Manages communication between specialized agents
   - Typically sits at the top of the visualization hierarchy

2. **Agent Node** (Blue)
   - Specialized AI agents that perform specific tasks
   - Can have associated tools and capabilities
   - Connected to the orchestrator in a hub-and-spoke pattern

3. **Trigger Node** (Light Blue)
   - Events or conditions that start the workflow
   - Connect to the orchestrator to initiate processes
   - Examples: user requests, scheduled events, system triggers

4. **Tools Group Node** (Gray)
   - Collection of tools available to an agent
   - Can be toggled visible/hidden for cleaner visualization
   - Shows specific capabilities an agent can leverage

5. **Value Node** (Green variants)
   - Represents business value metrics and outcomes
   - Color-coded by scope (agent, use case, or solution level)
   - Connects to the elements that drive the specific value

## Visualization Controls

Both read-only visualizations and the playground offer multiple controls:

1. **Toggle Controls** (read-only views)
   - Show/Hide Tools - Display or hide agent tool collections
   - Show/Hide Values - Display or hide business value metrics
   - Layout Direction - Switch between top-to-bottom and left-to-right layouts

2. **Navigation Controls** (all views)
   - Zoom controls - Zoom in/out of the visualization
   - Fit view - Automatically fit all elements to the viewport
   - Pan - Click and drag to move around the canvas

3. **Minimap** (playground)
   - Shows a small overview of the entire canvas
   - Helps navigate larger, more complex workflows

## How the Components Work Together

1. **Data Fetching and Processing**
   - API routes fetch data from ServiceNow (or use demo data)
   - JSON data is transformed into visualization-compatible formats
   - Layouts are calculated using Dagre for optimal positioning

2. **Component Hierarchy**
   - Page components (e.g., `executive-view/page.tsx`) load appropriate visualizations
   - Visualization components (e.g., `AnimatedWorkflow.tsx`) render the flow
   - Node components (e.g., `OrchestrationNode`) render individual elements

3. **User Interaction Flow**
   - User actions (clicks, drags) are captured by React Flow event handlers
   - State updates trigger re-renders of affected components
   - Visual feedback is provided through animations and style changes

## Development Workflow

When extending or modifying the application:

1. **Adding New Components**
   - Create new components in the appropriate directories
   - Import and use them in parent components
   - Update types and interfaces as needed

2. **Styling Components**
   - Use Tailwind CSS classes for consistent styling
   - Global styles are in `/app/styles`
   - Component-specific styles should be included inline

3. **Adding New Routes**
   - Create new directories in `/app` for page routes
   - Add `page.tsx` files for each route
   - Update navigation in `Navigation.tsx`

4. **Data Changes**
   - Update API routes in `/app/api`
   - Modify transformation logic for new data structures
   - Update type definitions to match data changes

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

- **Playground Feature Added**:
  - Added an interactive playground for creating custom workflows
  - Implemented drag-and-drop functionality for adding nodes
  - Added editable nodes with double-click to edit functionality
  - Created direct navigation access via pencil icon in the header

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

5. **Playground Edit Mode**:
   - In some cases, the double-click edit functionality may require a more precise click
   - Ensure you're double-clicking directly on the text to edit

## Next Steps

1. **Playground Enhancements**:
   - Add save/load functionality for custom workflows
   - Create templates for common agentic patterns
   - Add export to JSON functionality

2. **Animation Refinements**:
   - Consider adding transitions for tool nodes when toggling visibility
   - Optimize animation timing for smoother flow

3. **Business Value Enhancements**:
   - Connect the hierarchical value system to real metrics from ServiceNow
   - Add configuration options for customizing value metrics
   - Implement hover tooltips with detailed ROI calculations for each value node

4. **Data Enrichment**:
   - Add tooltips with additional details for nodes
   - Display more metadata when hovering over connections
   - Create a "details panel" that shows selected node information

5. **Rendering Optimizations**:
   - Further fine-tune the layout algorithm for larger agent teams
   - Add additional responsive adjustments for different screen sizes
   - Implement minimap highlighting for currently visible sections

## License

MIT 

## Key Files

The application is structured as follows, with these key files being most important for understanding the visualization components:

### Core Visualization Components

- `/app/components/ProcessFlowTimeline.tsx` - Component for visualizing process phases with dynamic information panels
- `/app/components/ExecutiveAgenticWorkflowView.tsx` - Main executive dashboard view with process flow, agents, and metrics
- `/app/components/AnimatedWorkflow.tsx` - Read-only visualization for agent workflow diagrams using React Flow
- `/app/components/EditableWorkflow.tsx` - Interactive playground for creating custom workflows
- `/app/components/BusinessImpactMetrics.tsx` - Visualization for business metrics and ROI data
- `/app/components/AgentFlow.tsx` - Base component for agent relationship diagrams
- `/app/components/LinearFlowDiagram.tsx` - Linear flow visualization for agent sequences
- `/app/components/Navigation.tsx` - Site-wide navigation with access to all views

### Page Components

- `/app/page.tsx` - Home/landing page
- `/app/dashboard/page.tsx` - Main dashboard
- `/app/use-case-view/page.tsx` - Detailed view of a single use case
- `/app/use-case-comparison/page.tsx` - Side-by-side comparison of use cases
- `/app/executive-view/page.tsx` - Business-focused view for decision makers
- `/app/playground/page.tsx` - Interactive workflow playground
- `/app/config/page.tsx` - Configuration page for ServiceNow connections

### Data Processing and API Routes

- `/app/api/servicenow/agentic-data/route.ts` - API for fetching and processing Agentic AI data
- `/app/api/servicenow/rfx-data-hardcoded/route.ts` - Demo data for RFX workflows
- `/app/api/servicenow/test-connection/route.ts` - API for testing ServiceNow connectivity
- `/app/api/save-workflow-data/route.ts` - API for saving workflow data
