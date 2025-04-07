import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { instanceUrl, username, password } = await request.json();
    
    // Validate inputs
    if (!instanceUrl || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }
    
    // Build the ServiceNow API URL for a basic query
    const apiUrl = `${instanceUrl}/api/now/table/sys_scope?sysparm_limit=1`;
    
    // Create basic auth headers
    const base64Credentials = Buffer.from(`${username}:${password}`).toString('base64');
    
    // Make the API call to ServiceNow
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${base64Credentials}`,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('ServiceNow API error:', response.status, response.statusText);
      return NextResponse.json(
        { error: `ServiceNow API error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Parse the response
    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      message: 'Successfully connected to ServiceNow instance',
      scopes: data.result.map((scope: any) => ({
        id: scope.sys_id,
        name: scope.name,
        scope: scope.scope
      }))
    });
  } catch (error: any) {
    console.error('Error testing ServiceNow connection:', error);
    return NextResponse.json(
      { error: error.message || 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 