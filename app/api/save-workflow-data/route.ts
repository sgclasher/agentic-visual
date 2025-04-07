import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    // Get JSON data from the request
    const requestData = await request.json();
    
    // Check if data is wrapped in a response object (new format)
    const dataToSave = requestData.data || requestData;
    
    // File path in the public directory
    const filePath = path.join(process.cwd(), 'public', 'workflow-data.json');
    
    // Write the data to the file
    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'Workflow data saved successfully',
      path: '/workflow-data.json'
    });
  } catch (error: any) {
    console.error('Error saving workflow data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to save workflow data',
        details: error.message
      },
      { status: 500 }
    );
  }
} 