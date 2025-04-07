import { NextResponse } from 'next/server';

// Hardcoded credentials for testing (will be removed in production)
const HARDCODED_INSTANCE_URL = 'https://nowgenticllcdemo1.service-now.com';
const HARDCODED_USERNAME = 'integrationUser';
const HARDCODED_PASSWORD = 'J5)F{b!L]3hPkrU]V_j:c[({h4QV@iQn7Ob!@o+rne0A<VV+*U.z^[r)e&@mO.o7}E1{xJSyAfDhd:A&?*LUa4TCYl;QZXNF@]_a';
const HARDCODED_SCOPE = 'x_nowge_rfx_ai';

export async function GET() {
  try {
    // Create basic auth header with hardcoded credentials
    const authHeader = `Basic ${Buffer.from(`${HARDCODED_USERNAME}:${HARDCODED_PASSWORD}`).toString('base64')}`;
    
    // Debugging information
    const debugInfo = {
      queries: {} as Record<string, string>,
      recordCounts: {} as Record<string, number>,
      errors: [] as string[]
    };
    
    // Try to fetch incidents first - basic table that should exist in all ServiceNow instances
    const incidentResponse = await fetch(
      `${HARDCODED_INSTANCE_URL}/api/now/table/incident?sysparm_limit=10`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      }
    );
    
    debugInfo.queries['incident'] = `${HARDCODED_INSTANCE_URL}/api/now/table/incident?sysparm_limit=10`;
    
    if (!incidentResponse.ok) {
      const errorText = await incidentResponse.text();
      debugInfo.errors.push(`Incident fetch failed: ${incidentResponse.status} ${incidentResponse.statusText}: ${errorText}`);
      
      return NextResponse.json({
        success: false,
        message: 'Failed to fetch incidents',
        debug_info: debugInfo
      });
    }
    
    const incidentData = await incidentResponse.json();
    debugInfo.recordCounts['incident'] = incidentData.result?.length || 0;
    
    // Try to access custom application scope tables
    const scopeInfoResponse = await fetch(
      `${HARDCODED_INSTANCE_URL}/api/now/table/sys_scope?sysparm_query=scope=${HARDCODED_SCOPE}`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      }
    );
    
    debugInfo.queries['scope_info'] = `${HARDCODED_INSTANCE_URL}/api/now/table/sys_scope?sysparm_query=scope=${HARDCODED_SCOPE}`;
    
    let scopeInfo = null;
    if (scopeInfoResponse.ok) {
      const scopeData = await scopeInfoResponse.json();
      debugInfo.recordCounts['scope_info'] = scopeData.result?.length || 0;
      
      if (scopeData.result?.length > 0) {
        scopeInfo = scopeData.result[0];
      } else {
        debugInfo.errors.push(`Scope ${HARDCODED_SCOPE} not found`);
      }
    } else {
      const errorText = await scopeInfoResponse.text();
      debugInfo.errors.push(`Scope info fetch failed: ${scopeInfoResponse.status} ${scopeInfoResponse.statusText}: ${errorText}`);
    }
    
    // Try to access the actual app tables
    const tablesResponse = await fetch(
      `${HARDCODED_INSTANCE_URL}/api/now/table/sys_db_object?sysparm_query=sys_scope=${scopeInfo?.sys_id || 'scope_not_found'}&sysparm_fields=name,label,super_class`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      }
    );
    
    debugInfo.queries['app_tables'] = `${HARDCODED_INSTANCE_URL}/api/now/table/sys_db_object?sysparm_query=sys_scope=${scopeInfo?.sys_id || 'scope_not_found'}&sysparm_fields=name,label,super_class`;
    
    let appTables = [];
    if (tablesResponse.ok) {
      const tablesData = await tablesResponse.json();
      debugInfo.recordCounts['app_tables'] = tablesData.result?.length || 0;
      appTables = tablesData.result || [];
    } else {
      const errorText = await tablesResponse.text();
      debugInfo.errors.push(`Tables fetch failed: ${tablesResponse.status} ${tablesResponse.statusText}: ${errorText}`);
    }
    
    // Test with the sn_aia_agent table specifically
    const agentsResponse = await fetch(
      `${HARDCODED_INSTANCE_URL}/api/now/table/sn_aia_agent?sysparm_query=sys_scope=${scopeInfo?.sys_id || 'scope_not_found'}&sysparm_fields=sys_id,name,description`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      }
    );
    
    debugInfo.queries['agents'] = `${HARDCODED_INSTANCE_URL}/api/now/table/sn_aia_agent?sysparm_query=sys_scope=${scopeInfo?.sys_id || 'scope_not_found'}&sysparm_fields=sys_id,name,description`;
    
    let agents = [];
    if (agentsResponse.ok) {
      const agentsData = await agentsResponse.json();
      debugInfo.recordCounts['agents'] = agentsData.result?.length || 0;
      agents = agentsData.result || [];
    } else {
      const errorText = await agentsResponse.text();
      debugInfo.errors.push(`Agents fetch failed: ${agentsResponse.status} ${agentsResponse.statusText}: ${errorText}`);
    }
    
    // Try direct table access for rfx_request specifically
    const rfxRequestsResponse = await fetch(
      `${HARDCODED_INSTANCE_URL}/api/now/table/x_nowge_rfx_ai_rfx_request?sysparm_fields=sys_id,number,short_description`,
      {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json'
        }
      }
    );
    
    debugInfo.queries['rfx_requests'] = `${HARDCODED_INSTANCE_URL}/api/now/table/x_nowge_rfx_ai_rfx_request?sysparm_fields=sys_id,number,short_description`;
    
    let rfxRequests = [];
    if (rfxRequestsResponse.ok) {
      const rfxData = await rfxRequestsResponse.json();
      debugInfo.recordCounts['rfx_requests'] = rfxData.result?.length || 0;
      rfxRequests = rfxData.result || [];
    } else {
      const errorText = await rfxRequestsResponse.text();
      debugInfo.errors.push(`RFX requests fetch failed: ${rfxRequestsResponse.status} ${rfxRequestsResponse.statusText}: ${errorText}`);
    }
    
    return NextResponse.json({
      success: true,
      message: 'ServiceNow API Diagnostic Results',
      data: {
        incidents: incidentData.result,
        scope_info: scopeInfo,
        app_tables: appTables,
        agents: agents,
        rfx_requests: rfxRequests
      },
      counts: {
        incidents: incidentData.result?.length || 0,
        app_tables: appTables.length,
        agents: agents.length,
        rfx_requests: rfxRequests.length
      },
      debug_info: debugInfo
    });
  } catch (error: any) {
    console.error('Error testing ServiceNow connection:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to test ServiceNow connection', 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 