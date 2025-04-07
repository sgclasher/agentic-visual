import { NextResponse } from 'next/server';

// Helper function for ServiceNow API requests
async function servicenowRequest(url: string, authHeader: string) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': authHeader,
      'Accept': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error(`ServiceNow API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  return data.result;
}

export async function POST(request: Request) {
  try {
    const { instanceUrl, username, password, appScope } = await request.json();
    
    // Validate inputs
    if (!instanceUrl || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Create basic auth header
    const authHeader = `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
    
    // Build scope filter if provided
    const scopeFilter = appScope ? `&sysparm_query=sys_scope=${appScope}` : '';
    
    // Debugging information
    const debugInfo = {
      queries: {},
      recordCounts: {},
      version: 'v30.0-minimal-viz'
    };
    
    // Helper function with debugging
    async function servicenowRequestWithDebug(url: string, tableName: string) {
      debugInfo.queries[tableName] = url;
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': authHeader,
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          debugInfo.queries[`${tableName}_error`] = `${response.status} ${response.statusText}: ${errorText}`;
          return [];
        }
        
        const data = await response.json();
        debugInfo.recordCounts[tableName] = data.result?.length || 0;
        return data.result || [];
      } catch (error) {
        debugInfo.queries[`${tableName}_error`] = error.message;
        return [];
      }
    }
    
    // Step 1: Fetch only the essential minimal fields for visualization
    const [useCases, teams, agents, triggerConfigs] = await Promise.all([
      // 1. Fetch Use Cases (minimal visualization fields only)
      servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/sn_aia_usecase?sysparm_fields=sys_id,name,description,team${scopeFilter}`,
        'sn_aia_usecase'
      ),
      
      // 2. Fetch Teams (minimal fields)
      servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/sn_aia_team?sysparm_fields=sys_id,name${scopeFilter}`,
        'sn_aia_team'
      ),
      
      // 3. Fetch Agents (minimal fields for visualization)
      servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/sn_aia_agent?sysparm_fields=sys_id,name,description${scopeFilter}`,
        'sn_aia_agent'
      ),
      
      // 4. Fetch Trigger Configurations (minimal fields)
      servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/sn_aia_trigger_configuration?sysparm_fields=sys_id,name,usecase,target_table,condition${scopeFilter}`,
        'sn_aia_trigger_configuration'
      )
    ]);
    
    // Step 2: Fetch relationships - just the basic mapping data needed for visualization
    const [teamMembers, agentTools] = await Promise.all([
      // 1. Fetch Team Members (m2m) - essential mapping only
      servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/sn_aia_team_member?sysparm_fields=sys_id,team,agent${scopeFilter}`,
        'sn_aia_team_member'
      ),
      
      // 2. Fetch Agent-Tool relationships - minimal info for visualization
      servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/sn_aia_agent_tool_m2m?sysparm_fields=sys_id,agent,tool,name${scopeFilter}`,
        'sn_aia_agent_tool_m2m'
      )
    ]);
    
    // Step 3: Get tool IDs from agent_tool_m2m
    const toolIds = agentTools.map((m2m: any) => {
      return m2m.tool?.value;
    }).filter((id: string) => id);
    
    // Step 4: Fetch only minimal tools data needed for visualization
    const tools = toolIds.length > 0 ? await servicenowRequestWithDebug(
      `${instanceUrl}/api/now/table/sn_aia_tool?sysparm_fields=sys_id,name,description,type,target_document_table${scopeFilter}&sysparm_query=sys_idIN${toolIds.join(',')}`,
      'sn_aia_tool'
    ) : [];
    
    // Only get capability IDs for visualization, not all the detailed capability data
    const targetCapabilityIds = tools
      .filter((tool: any) => tool.type === 'capability' && tool.target_document?.value)
      .map((tool: any) => tool.target_document.value);
      
    // Just fetch names for capabilities - minimal data for visualization
    const capabilities = targetCapabilityIds.length > 0 ? 
      await servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/sys_one_extend_capability?sysparm_fields=sys_id,name&sysparm_query=sys_idIN${targetCapabilityIds.join(',')}`,
        'sys_one_extend_capability'
      ) : [];
    
    // Build simplified data structure optimized for visualization
    
    // Step 1: Build use cases array with minimal details
    const processedUseCases = useCases.map((useCase: any) => {
      // Get team ID from use case
      const teamId = useCase.team?.value;
      
      // Find agents for this use case via team members - simplified for visualization
      const teamAgentIds = teamMembers
        .filter((member: any) => member.team?.value === teamId)
        .map((member: any) => member.agent?.value);
        
      const useCaseAgents = agents
        .filter((agent: any) => teamAgentIds.includes(agent.sys_id))
        .map((agent: any) => ({
          sys_id: agent.sys_id,
          name: agent.name
        }));
      
      // Find triggers for this use case - minimal data for visualization
      const useCaseTriggers = triggerConfigs
        .filter((trigger: any) => trigger.usecase?.value === useCase.sys_id)
        .map((trigger: any) => ({
          sys_id: trigger.sys_id,
          name: trigger.name || 'Trigger', // Fallback name
          condition: trigger.condition,
          target_table: trigger.target_table
        }));
      
      // Build minimal use case object for visualization
      return {
        sys_id: useCase.sys_id,
        name: useCase.name,
        description: useCase.description,
        agents: useCaseAgents,
        triggers: useCaseTriggers,
        
        // For visualization, we'll add a process_flow object that can be used for rendering
        process_flow: {
          sequence_number: parseInt(useCase.sys_id.substring(0, 2), 16) % 10, // Just a visualization helper
          phase: teamId ? (teams.find((t: any) => t.sys_id === teamId)?.name || 'Unknown Phase').split(' ')[0] : 'Unknown'
        }
      };
    });
    
    // Step 2: Build simplified agents object for visualization
    const agentsMap: Record<string, any> = {};
    
    agents.forEach((agent: any) => {
      // Get tools for this agent - minimal info for visualization
      const agentToolsForAgent = agentTools
        .filter((m2m: any) => m2m.agent?.value === agent.sys_id)
        .map((m2m: any) => {
          const toolId = m2m.tool?.value;
          const toolInfo = tools.find((t: any) => t.sys_id === toolId);
          
          return {
            sys_id: toolId,
            name: m2m.name || (toolInfo ? toolInfo.name : 'Unknown Tool'),
            type: toolInfo?.type || 'unknown'
          };
        });
      
      // Minimal agent fields for visualization
      agentsMap[agent.sys_id] = {
        sys_id: agent.sys_id,
        name: agent.name,
        description: agent.description,
        tools: agentToolsForAgent
      };
    });
    
    // Step 3: Build minimal tools map for visualization
    const toolsMap: Record<string, any> = {};
    
    tools.forEach((tool: any) => {
      // Only include minimal tool fields for visualization
      toolsMap[tool.sys_id] = {
        sys_id: tool.sys_id,
        name: tool.name,
        description: tool.description,
        type: tool.type,
        target_document_table: tool.target_document_table
      };
    });
    
    // Step 4: Build minimal capabilities map for visualization
    const capabilitiesMap: Record<string, any> = {};
    
    capabilities.forEach((capability: any) => {
      // Only include minimal capability fields for visualization
      capabilitiesMap[capability.sys_id] = {
        sys_id: capability.sys_id,
        name: capability.name
      };
    });
    
    // Step 5: Build minimal triggers map for visualization
    const triggersMap: Record<string, any> = {};
    
    triggerConfigs.forEach((trigger: any) => {
      // Only include essential trigger fields for visualization
      triggersMap[trigger.sys_id] = {
        sys_id: trigger.sys_id,
        name: trigger.name,
        usecase: trigger.usecase?.value,
        target_table: trigger.target_table,
        condition: trigger.condition
      };
    });
    
    // Create a visualization-optimized data structure
    const finalData = {
      script_execution_info: {
        executed_at: new Date().toISOString(),
        scope: appScope || 'all',
        source: 'api-v30.0-minimal-viz'
      },
      use_cases: processedUseCases,
      agents: agentsMap,
      tools: toolsMap,
      capabilities: capabilitiesMap,
      triggers: triggersMap,
      // Add execution timestamp for UI display
      execution: {
        timestamp: new Date().toISOString(),
        source: 'agentic-data-api'
      }
    };
    
    return NextResponse.json({
      success: true,
      message: 'Successfully fetched Agentic AI visualization data from ServiceNow',
      data: finalData
    });
  } catch (error: any) {
    console.error('Error fetching ServiceNow data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch Agentic AI data', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 