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

// Helper function with debugging - moved outside the block to fix linter error
async function servicenowRequestWithDebug(
  url: string, 
  tableName: string, 
  authHeader: string,
  debugInfo: { 
    queries: Record<string, string>, 
    recordCounts: Record<string, number> 
  }
) {
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
  } catch (error: any) {
    debugInfo.queries[`${tableName}_error`] = error.message;
    return [];
  }
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
    
    // Build scope filter - for custom app always filter to the x_nowge_rfx_ai scope
    const scopeFilter = `&sysparm_query=sys_scope=x_nowge_rfx_ai`;
    
    // Debugging information
    const debugInfo = {
      queries: {} as Record<string, string>,
      recordCounts: {} as Record<string, number>
    };
    
    // Fetch standard Agentic AI data
    const [useCases, agents, triggers, tools, agentTools] = await Promise.all([
      // 1. Fetch Use Cases
      servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/sn_aia_usecase?sysparm_fields=sys_id,name,description,active,team,sys_created_on,sys_updated_on,sys_scope${scopeFilter}`,
        'sn_aia_usecase',
        authHeader,
        debugInfo
      ),
      
      // 2. Fetch Agents
      servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/sn_aia_agent?sysparm_fields=sys_id,name,description,active,role,instructions,sys_created_on,sys_updated_on,sys_scope${scopeFilter}`,
        'sn_aia_agent',
        authHeader,
        debugInfo
      ),
      
      // 3. Fetch Triggers
      servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/sn_aia_trigger_configuration?sysparm_fields=sys_id,name,description,active,usecase,target_table,condition,run_as,objective_template${scopeFilter}`,
        'sn_aia_trigger_configuration',
        authHeader,
        debugInfo
      ),
      
      // 4. Fetch Tools
      servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/sn_aia_tool?sysparm_fields=sys_id,name,description,active,type,target_document,target_document_table,input_schema,script${scopeFilter}`,
        'sn_aia_tool',
        authHeader,
        debugInfo
      ),
      
      // 5. Fetch Agent-Tool relationships
      servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/sn_aia_agent_tool_m2m?sysparm_fields=sys_id,agent,tool,inputs,execution_mode,display_output,output_transformation_strategy,name,description${scopeFilter}`,
        'sn_aia_agent_tool_m2m',
        authHeader,
        debugInfo
      )
    ]);
    
    // Fetch custom RFX tables
    const [rfxRequests, rfxQuestions, rfxVendorResponses] = await Promise.all([
      // 1. Fetch RFX Requests (main process entity)
      servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/x_nowge_rfx_ai_rfx_request?sysparm_fields=sys_id,number,short_description,description,state,assigned_to,sys_created_on,sys_updated_on${scopeFilter}`,
        'rfx_request',
        authHeader,
        debugInfo
      ),
      
      // 2. Fetch RFX Questions
      servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/x_nowge_rfx_ai_rfx_question?sysparm_fields=sys_id,number,question,rfx_request,state,category,sys_created_on,sys_updated_on${scopeFilter}`,
        'rfx_question',
        authHeader,
        debugInfo
      ),
      
      // 3. Fetch RFX Vendor Responses
      servicenowRequestWithDebug(
        `${instanceUrl}/api/now/table/x_nowge_rfx_ai_vendor_response?sysparm_fields=sys_id,number,rfx_request,vendor,response,state,sys_created_on,sys_updated_on${scopeFilter}`,
        'rfx_vendor_response',
        authHeader,
        debugInfo
      )
    ]);
    
    // Fetch business rules to identify process automation steps
    const businessRules = await servicenowRequestWithDebug(
      `${instanceUrl}/api/now/table/sys_script?sysparm_fields=sys_id,name,collection,when,action_insert,action_update,action_query,action_delete,script${scopeFilter}`,
      'business_rules',
      authHeader,
      debugInfo
    );
    
    // Structure agents with their tools
    const agentsMap: Record<string, any> = {};
    agents.forEach((agent: any) => {
      agentsMap[agent.sys_id] = {
        sys_id: agent.sys_id,
        name: agent.name,
        description: agent.description,
        role: agent.role,
        instructions: agent.instructions,
        active: agent.active,
        tools: []
      };
    });
    
    // Add tools to agents
    agentTools.forEach((m2m: any) => {
      const agentId = m2m.agent?.value;
      const toolId = m2m.tool?.value;
      
      if (agentId && toolId && agentsMap[agentId]) {
        agentsMap[agentId].tools.push({
          sys_id: toolId,
          name: m2m.name || tools.find((t: any) => t.sys_id === toolId)?.name || 'Unknown Tool',
          agent_tool_m2m_config: {
            sys_id: m2m.sys_id,
            inputs: m2m.inputs,
            execution_mode: m2m.execution_mode,
            display_output: m2m.display_output,
            output_transformation_strategy: m2m.output_transformation_strategy,
            name_in_agent: m2m.name,
            description_in_agent: m2m.description
          }
        });
      }
    });
    
    // Transform tools for the output format
    const toolsMap: Record<string, any> = {};
    tools.forEach((tool: any) => {
      toolsMap[tool.sys_id] = {
        sys_id: tool.sys_id,
        name: tool.name,
        description: tool.description,
        active: tool.active,
        type: tool.type,
        target_document: tool.target_document?.value,
        target_document_table: tool.target_document_table,
        input_schema: tool.input_schema,
        script: tool.script
      };
    });
    
    // Group RFX questions by request
    const questionsMap: Record<string, any[]> = {};
    rfxQuestions.forEach((question: any) => {
      const requestId = question.rfx_request?.value;
      if (requestId) {
        if (!questionsMap[requestId]) {
          questionsMap[requestId] = [];
        }
        questionsMap[requestId].push({
          sys_id: question.sys_id,
          number: question.number,
          question: question.question,
          category: question.category,
          state: question.state
        });
      }
    });
    
    // Group vendor responses by request
    const responsesMap: Record<string, any[]> = {};
    rfxVendorResponses.forEach((response: any) => {
      const requestId = response.rfx_request?.value;
      if (requestId) {
        if (!responsesMap[requestId]) {
          responsesMap[requestId] = [];
        }
        responsesMap[requestId].push({
          sys_id: response.sys_id,
          number: response.number,
          vendor: response.vendor?.display_value || 'Unknown Vendor',
          response: response.response,
          state: response.state
        });
      }
    });
    
    // Find business rules related to the RFX process
    const rfxBusinessRules = businessRules.filter((rule: any) => {
      return rule.name.toLowerCase().includes('rfx') || 
             rule.collection.toLowerCase().includes('x_nowge_rfx_ai');
    }).map((rule: any) => ({
      sys_id: rule.sys_id,
      name: rule.name,
      collection: rule.collection,
      when: rule.when,
      script: rule.script?.substring(0, 100) + '...' // Truncate script for readability
    }));
    
    // Build enhanced RFX process flow from requests
    const processedRequests = rfxRequests.map((request: any, index: number) => {
      // Infer process flow based on request
      return {
        sys_id: request.sys_id,
        number: request.number,
        title: request.short_description,
        description: request.description,
        state: request.state,
        assigned_to: request.assigned_to?.display_value,
        questions: questionsMap[request.sys_id] || [],
        vendor_responses: responsesMap[request.sys_id] || [],
        process_flow: {
          sequence_number: index + 1,
          phase: inferPhaseFromState(request.state),
          previous_use_cases: index > 0 ? [rfxRequests[index - 1].sys_id] : [],
          next_use_cases: index < rfxRequests.length - 1 ? [rfxRequests[index + 1].sys_id] : [],
          input_artifacts: inferInputArtifacts(request),
          output_artifacts: inferOutputArtifacts(request)
        }
      };
    });
    
    // Collect all use cases (both from standard tables and RFX custom tables)
    const enhancedUseCases = [
      // Standard use cases if any
      ...useCases.map((useCase: any) => ({
        sys_id: useCase.sys_id,
        name: useCase.name,
        description: useCase.description,
        active: useCase.active,
        process_flow: {
          sequence_number: 0, // Will update later
          phase: "Standard",
          previous_use_cases: [],
          next_use_cases: [],
          input_artifacts: [],
          output_artifacts: []
        }
      })),
      
      // Custom RFX use cases derived from requests
      ...processedRequests.map((request: any) => ({
        sys_id: request.sys_id,
        name: request.title || request.number,
        description: request.description,
        state: request.state,
        process_flow: request.process_flow,
        artifacts: {
          inputs: request.process_flow.input_artifacts,
          outputs: request.process_flow.output_artifacts
        }
      }))
    ];
    
    // Update sequence numbers for all use cases
    enhancedUseCases.forEach((useCase, index) => {
      useCase.process_flow.sequence_number = index + 1;
    });
    
    // Create the final data structure
    const finalData = {
      script_execution_info: {
        executed_at: new Date().toISOString(),
        scope: 'x_nowge_rfx_ai',
        source: 'custom-rfx-api'
      },
      use_cases: enhancedUseCases,
      agents: agentsMap,
      tools: toolsMap,
      triggers: {},
      custom_data: {
        rfx_requests: processedRequests,
        business_rules: rfxBusinessRules
      },
      transform_info: {
        transformed_at: new Date().toISOString(),
        transform_version: '1.0.0',
        app_type: 'rfx',
        source: 'custom-rfx-api'
      },
      debug_info: debugInfo
    };
    
    return NextResponse.json({
      success: true,
      message: 'Successfully fetched RFX data from ServiceNow',
      data: finalData
    });
  } catch (error: any) {
    console.error('Error fetching ServiceNow data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch RFX data', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Helper functions to infer process information
function inferPhaseFromState(state: string): string {
  const stateMap: Record<string, string> = {
    'draft': 'Drafting',
    'submitted': 'Submission',
    'published': 'Publication',
    'in_progress': 'In Progress',
    'review': 'Review',
    'closed': 'Closed',
    'cancelled': 'Cancelled'
  };
  
  return stateMap[state?.toLowerCase()] || 'Unknown';
}

function inferInputArtifacts(request: any): string[] {
  const artifacts: string[] = ['RFX Requirements'];
  
  if (request.state === 'review') {
    artifacts.push('Draft Responses');
  }
  
  return artifacts;
}

function inferOutputArtifacts(request: any): string[] {
  const artifacts: string[] = [];
  
  if (request.state === 'draft') {
    artifacts.push('RFX Draft');
  } else if (request.state === 'published') {
    artifacts.push('Published RFX');
  } else if (request.state === 'closed') {
    artifacts.push('Vendor Selection');
    artifacts.push('Award Notification');
  }
  
  return artifacts;
} 