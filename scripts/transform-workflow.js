#!/usr/bin/env node

/**
 * ServiceNow Agentic AI Workflow Transformer
 * 
 * This script takes the raw JSON output from the ServiceNow background script
 * and enhances it with process flow information for visualization.
 * 
 * Usage: node transform-workflow.js input.json output.json [app-type]
 * 
 * Where:
 *   - input.json: Raw output from ServiceNow background script
 *   - output.json: Enhanced JSON with process flow information
 *   - app-type: Optional app type for specialized processing (e.g., "rfx")
 */

const fs = require('fs');
const path = require('path');

// Read command line arguments
const inputFile = process.argv[2];
const outputFile = process.argv[3] || 'public/workflow-data.json';
const appType = process.argv[4]?.toLowerCase() || '';

if (!inputFile) {
  console.error('Error: Input file is required.');
  console.log('Usage: node transform-workflow.js input.json [output.json] [app-type]');
  process.exit(1);
}

console.log(`Processing ${inputFile} into ${outputFile}...`);

// Load and parse the input JSON
let workflowData;
try {
  const inputData = fs.readFileSync(inputFile, 'utf8');
  workflowData = JSON.parse(inputData);
} catch (error) {
  console.error(`Error reading or parsing input file: ${error.message}`);
  process.exit(1);
}

// Function to enhance use cases with process flow information
function enhanceWithProcessFlow(workflowData, appType) {
  const useCases = workflowData.use_cases;
  if (!useCases || useCases.length === 0) {
    console.warn('No use cases found in input data.');
    return workflowData;
  }

  // Special case for RFx app - hardcoded sequence based on domain knowledge
  if (appType === 'rfx') {
    // Known sequence for RFx app from the process diagram
    const rfxSequence = {
      'RFX Request Intake Manager': {
        sequence: 1,
        phase: 'creation',
        inputs: ['User Requirements'],
        outputs: ['Validated RFx Request']
      },
      'RFX Document Generation': {
        sequence: 2,
        phase: 'creation',
        inputs: ['Validated RFx Request'],
        outputs: ['RFx Document']
      },
      'RFX Vendor Q&A Management': {
        sequence: 3,
        phase: 'interaction',
        inputs: ['RFx Document'],
        outputs: ['Vendor Q&A Responses']
      },
      'RFX Vendor Evaluation': {
        sequence: 4,
        phase: 'evaluation',
        inputs: ['Vendor Q&A Responses', 'RFx Document'],
        outputs: ['Evaluation Results']
      },
      'RFX Vendor Finalist Selection': {
        sequence: 5,
        phase: 'decision',
        inputs: ['Evaluation Results'],
        outputs: ['Selected Vendor', 'Award Recommendation']
      }
    };

    // Apply sequence information to each use case
    for (let i = 0; i < useCases.length; i++) {
      const useCase = useCases[i];
      const sequenceInfo = rfxSequence[useCase.name] || { 
        sequence: i + 99, 
        phase: 'unknown',
        inputs: ['Input Data'],
        outputs: ['Output Data']
      };

      useCase.process_flow = {
        sequence_number: sequenceInfo.sequence,
        phase: sequenceInfo.phase,
        input_artifacts: sequenceInfo.inputs,
        output_artifacts: sequenceInfo.outputs,
        previous_use_cases: [],
        next_use_cases: []
      };
    }

    // Sort use cases by sequence number
    useCases.sort((a, b) => a.process_flow.sequence_number - b.process_flow.sequence_number);

    // Link use cases together in sequence
    for (let i = 0; i < useCases.length; i++) {
      // Link to previous use case
      if (i > 0) {
        useCases[i].process_flow.previous_use_cases = [useCases[i-1].sys_id];
        // Also update the next_use_cases of the previous use case
        useCases[i-1].process_flow.next_use_cases = [useCases[i].sys_id];
      }
    }
  } else {
    // Generic process flow enhancement for other apps
    // This is a simple example that can be expanded

    // 1. First give each use case a sequence number based on creation date
    useCases.sort((a, b) => new Date(a.sys_created_on) - new Date(b.sys_created_on));
    
    for (let i = 0; i < useCases.length; i++) {
      useCases[i].process_flow = {
        sequence_number: i + 1,
        phase: 'generic',
        input_artifacts: [`Input for ${useCases[i].name}`],
        output_artifacts: [`Output from ${useCases[i].name}`],
        previous_use_cases: [],
        next_use_cases: []
      };

      // Link to previous use case
      if (i > 0) {
        useCases[i].process_flow.previous_use_cases = [useCases[i-1].sys_id];
        // Also update the next_use_cases of the previous use case
        useCases[i-1].process_flow.next_use_cases = [useCases[i].sys_id];
      }
    }
  }

  return workflowData;
}

// Add transformation logic here
const enhancedData = enhanceWithProcessFlow(workflowData, appType);

// Add metadata about the transformation
enhancedData.transform_info = {
  transformed_at: new Date().toISOString(),
  transform_version: '1.0.0',
  original_source: path.basename(inputFile),
  app_type: appType || 'generic'
};

// Write the output
try {
  // Create directory if it doesn't exist
  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFile, JSON.stringify(enhancedData, null, 2));
  console.log(`Enhanced workflow data written to ${outputFile}`);
} catch (error) {
  console.error(`Error writing output file: ${error.message}`);
  process.exit(1);
} 