// =======================================================================
// AI Application Architecture Exporter (v28 - Correct Agent Linking)
// =======================================================================
// Purpose: Exports AI framework components using a reference model.
// Changes:
//   - Fetches the 'team' field from sn_aia_usecase.
//   - Corrected Step 6 Use Case loop to link agents based on the
//     use case's specific 'team' field, instead of adding all agents.
//   - Kept workaround for unreliable 'active' flag reading on usecase/team/agent.
// Usage:   Run as a ServiceNow Background Script. Verify 'appSysId'.
// =======================================================================

(function () {

    // *** Configuration ***
    var appSysId = '33df17ef47d8ea10d93447c4416d43cd'; // YOUR TARGET APPLICATION SCOPE SYS ID
    var logPrefix = '[AI Arch Export v28]: '; // Updated version

    // --- Data Storage ---
    var output = {
        script_execution_info: { run_time: new GlideDateTime().getDisplayValue(), target_app_scope_id: appSysId, filter_strategy: "Components fetched by scope. Assumed active if fetched. Uses UseCase.team for agent linking. Output uses reference model.", version: "v28" },
        use_cases: [], agents: {}, tools: {}, capabilities: {}, skills: {}, genai_configs: {}, flows: {}, triggers: {}
    };
    var fetchedData = {
        usecases: {}, teams: {}, agents: {}, team_members: [], agent_tools_m2m: [], tools: {}, triggers: {}, capabilities: {}, capability_definitions: {}, skills: {}, genai_configs: {}, flows: {}
    };

    // --- Helper Functions --- (No changes from v27)
    function queryRecords(tableName, scopeId) { gs.info(logPrefix + 'Querying records from ' + tableName + (scopeId ? ' (with Scope Filter)' : '')); var gr = new GlideRecord(tableName); if (scopeId) { gr.addQuery('sys_scope', scopeId); } gr.query(); gs.info(logPrefix + 'Query complete for ' + tableName + '. Found: ' + gr.getRowCount() + ' records.'); return gr; }
    function queryRecordsByIds(tableName, sysIds) { if (!sysIds || sysIds.length === 0) { gs.info(logPrefix + 'Skipping query for ' + tableName + ' - no IDs provided.'); return null; } gs.info(logPrefix + 'Querying ' + sysIds.length + ' records from ' + tableName + ' by Sys ID...'); var gr = new GlideRecord(tableName); gr.addQuery('sys_id', 'IN', sysIds.join(',')); gr.query(); gs.info(logPrefix + 'Query complete for ' + tableName + ' by IDs. Found: ' + gr.getRowCount() + ' records.'); return gr; }
    function extractData(gr, fields) { var data = {}; fields.forEach(function (f) { if (gr.isValidField(f)) { data[f] = gr.getValue(f); } else if (f === 'display_name' && gr.isValidField('name')) { data[f] = gr.getDisplayValue('name') || gr.getValue('name'); } }); if (!data.sys_id && gr.isValidField('sys_id')) data.sys_id = gr.getUniqueValue(); if (!data.name && gr.isValidField('name')) data.name = gr.getValue('name'); return data; }
    function parseJsonString(jsonString, defaultValue) { try { if (!jsonString || typeof jsonString !== 'string') return defaultValue; return JSON.parse(jsonString); } catch (e) { gs.warn(logPrefix + 'Failed to parse JSON string: ' + jsonString + ' Error: ' + e.message); return defaultValue; } }
    function extractPlaceholders(text) { if (!text) return []; var regex = /\{\{([^}]+)\}\}/g; var matches = []; var match; while ((match = regex.exec(text)) !== null) { matches.push(match[1].trim()); } return matches.filter(function (value, index, self) { return self.indexOf(value) === index; }); }
    function addUniqueRef(targetArray, refObject) { if (!refObject || !refObject.sys_id) return; if (!targetArray.some(function (item) { return item.sys_id === refObject.sys_id; })) { targetArray.push(refObject); } }


    // --- Main Execution ---
    gs.info(logPrefix + 'Starting AI framework component export for App Scope Sys ID: ' + appSysId);

    // Steps 1-5: Fetching and processing data into fetchedData
    // 1. Fetch Core AI Framework Components & Extract Details
    // ** Added 'team' to usecaseFields **
    var usecaseFields = ['sys_id', 'name', 'description', 'active', 'team', 'sys_created_on', 'sys_updated_on', 'sys_scope'];
    var grUsecase = queryRecords('sn_aia_usecase', appSysId); var ucCount = 0; while (grUsecase.next()) { fetchedData.usecases[grUsecase.getUniqueValue()] = extractData(grUsecase, usecaseFields); ucCount++; } gs.info(logPrefix + 'Processed ' + ucCount + ' records from sn_aia_usecase');

    var teamFields = ['sys_id', 'name', 'description', 'active', 'sys_created_on', 'sys_updated_on', 'sys_scope']; var grTeam = queryRecords('sn_aia_team', appSysId); var teamCount = 0; while (grTeam.next()) { fetchedData.teams[grTeam.getUniqueValue()] = extractData(grTeam, teamFields); teamCount++; } gs.info(logPrefix + 'Processed ' + teamCount + ' records from sn_aia_team');
    var agentFields = ['sys_id', 'name', 'description', 'active', 'sys_created_on', 'sys_updated_on', 'sys_scope']; var grAgent = queryRecords('sn_aia_agent', appSysId); var agentCount = 0; while (grAgent.next()) { fetchedData.agents[grAgent.getUniqueValue()] = extractData(grAgent, agentFields); agentCount++; } gs.info(logPrefix + 'Processed ' + agentCount + ' records from sn_aia_agent');
    var triggerFields = ['sys_id', 'name', 'description', 'active', 'usecase', 'target_table', 'condition', 'run_as', 'objective_template']; var grTrigger = queryRecords('sn_aia_trigger_configuration', appSysId); var triggerCount = 0; while (grTrigger.next()) { fetchedData.triggers[grTrigger.getUniqueValue()] = extractData(grTrigger, triggerFields); triggerCount++; } gs.info(logPrefix + 'Processed ' + triggerCount + ' records from sn_aia_trigger_configuration');

    // M2M Fetching (Remains the same)
    (function fetchM2MRecords(tableName, targetArray) { gs.info(logPrefix + 'Fetching records from ' + tableName + ' (with Scope Filter)'); var gr = new GlideRecord(tableName); gr.addQuery('sys_scope', appSysId); gr.query(); var count = 0; var specificFields = []; if (tableName === 'sn_aia_team_member') specificFields = ['sys_id', 'team', 'agent']; if (tableName === 'sn_aia_agent_tool_m2m') specificFields = ['sys_id', 'agent', 'tool', 'inputs', 'execution_mode', 'display_output', 'output_transformation_strategy', 'name', 'description']; while (gr.next()) { var recordData = extractData(gr, specificFields); targetArray.push(recordData); count++; } gs.info(logPrefix + 'Fetched ' + count + ' records from ' + tableName); })('sn_aia_team_member', fetchedData.team_members);
    (function fetchM2MRecords(tableName, targetArray) { gs.info(logPrefix + 'Fetching records from ' + tableName + ' (with Scope Filter)'); var gr = new GlideRecord(tableName); gr.addQuery('sys_scope', appSysId); gr.query(); var count = 0; var specificFields = []; if (tableName === 'sn_aia_team_member') specificFields = ['sys_id', 'team', 'agent']; if (tableName === 'sn_aia_agent_tool_m2m') specificFields = ['sys_id', 'agent', 'tool', 'inputs', 'execution_mode', 'display_output', 'output_transformation_strategy', 'name', 'description']; while (gr.next()) { var recordData = extractData(gr, specificFields); targetArray.push(recordData); count++; } gs.info(logPrefix + 'Fetched ' + count + ' records from ' + tableName); })('sn_aia_agent_tool_m2m', fetchedData.agent_tools_m2m);

    // Fetch Referenced Tools & Targets (Remains the same logic as v27)
    // 2. Tools
    var toolIds = fetchedData.agent_tools_m2m.map(function (m2m) { return m2m.tool; }).filter(function (id, i, self) { return id && self.indexOf(id) === i; }); if (toolIds.length > 0) { gs.info(logPrefix + 'Identifying and fetching referenced sn_aia_tool records...'); var toolFields = ['sys_id', 'name', 'description', 'active', 'type', 'target_document', 'target_document_table', 'input_schema', 'script']; var grTool = queryRecordsByIds('sn_aia_tool', toolIds); if (grTool) { gs.info(logPrefix + 'Processing ' + grTool.getRowCount() + ' unique referenced tools.'); while (grTool.next()) { fetchedData.tools[grTool.getUniqueValue()] = extractData(grTool, toolFields); } } } else { gs.info(logPrefix + 'No referenced tools found via Agent M2M links.'); }
    // 3. Tool Targets
    var capabilityIds = []; var skillIds = []; var flowIds = []; for (var toolId in fetchedData.tools) { var tool = fetchedData.tools[toolId]; if (tool.target_document && tool.target_document_table) { if (tool.target_document_table == 'sys_one_extend_capability') { capabilityIds.push(tool.target_document); } else if (tool.target_document_table == 'sn_nowassist_skill_config') { skillIds.push(tool.target_document); } else if (tool.target_document_table == 'sys_flow_design') { flowIds.push(tool.target_document); } } } capabilityIds = capabilityIds.filter(function (id, i, self) { return id && self.indexOf(id) === i; }); skillIds = skillIds.filter(function (id, i, self) { return id && self.indexOf(id) === i; }); flowIds = flowIds.filter(function (id, i, self) { return id && self.indexOf(id) === i; });
    if (capabilityIds.length > 0) { var capabilityFields = ['sys_id', 'name', 'description', 'active', 'type', 'short_description']; var grCapability = queryRecordsByIds('sys_one_extend_capability', capabilityIds); if (grCapability) { gs.info(logPrefix + 'Processing ' + grCapability.getRowCount() + ' unique referenced capabilities.'); while (grCapability.next()) { fetchedData.capabilities[grCapability.getUniqueValue()] = extractData(grCapability, capabilityFields); } } }
    if (skillIds.length > 0) { var skillFields = ['sys_id', 'name', 'description', 'active', 'short_description']; var grSkill = queryRecordsByIds('sn_nowassist_skill_config', skillIds); if (grSkill) { gs.info(logPrefix + 'Processing ' + grSkill.getRowCount() + ' unique referenced skills.'); while (grSkill.next()) { fetchedData.skills[grSkill.getUniqueValue()] = extractData(grSkill, skillFields); } } }
    if (flowIds.length > 0) { var flowFields = ['sys_id', 'name', 'description', 'active', 'internal_name']; var grFlow = queryRecordsByIds('sys_flow_design', flowIds); if (grFlow) { gs.info(logPrefix + 'Processing ' + grFlow.getRowCount() + ' unique referenced flows.'); while (grFlow.next()) { fetchedData.flows[grFlow.getUniqueValue()] = extractData(grFlow, flowFields); } } }
    // 4. Capability Definitions
    var activeCapabilityIds = Object.keys(fetchedData.capabilities); var capDefinitionIds = []; if (activeCapabilityIds.length > 0) { gs.info(logPrefix + 'Fetching Capability Definitions linked to fetched Capabilities...'); var grCapDef = new GlideRecord('sys_one_extend_capability_definition'); grCapDef.addQuery('capability', 'IN', activeCapabilityIds); grCapDef.query(); gs.info(logPrefix + 'Found ' + grCapDef.getRowCount() + ' potentially relevant capability definitions.'); var capDefFields = ['sys_id', 'name', 'description', 'active', 'capability', 'api', 'api_type', 'preprocessor', 'postprocessor']; var capDefCount = 0; while (grCapDef.next()) { var capDefData = extractData(grCapDef, capDefFields); fetchedData.capability_definitions[grCapDef.getUniqueValue()] = capDefData; capDefinitionIds.push(grCapDef.getUniqueValue()); var parentCapId = capDefData.capability; if (fetchedData.capabilities[parentCapId]) { fetchedData.capabilities[parentCapId]._temp_cap_def = JSON.parse(JSON.stringify(capDefData)); } capDefCount++; } gs.info(logPrefix + 'Processed ' + capDefCount + ' capability definitions.'); }
    // 5. GenAI Configs
    var activeGenAiConfigIds = []; var capDefToGenAiMap = {}; var skillToGenAiMap = {}; var capabilityToGenAiMap = {}; gs.info(logPrefix + 'Querying sys_generative_ai_config for potential links...'); var grGenAi = new GlideRecord('sys_generative_ai_config'); grGenAi.addQuery('sys_scope', appSysId); grGenAi.query(); gs.info(logPrefix + 'Checking ' + grGenAi.getRowCount() + ' GenAI Configs in scope for links to fetched components...'); var genAiCount = 0; var genAiFields = ['sys_id', 'name', 'active', 'prompt', 'model', 'temperature', 'max_tokens', 'additional_configurations', 'parent', 'definition', 'definition_table']; while (grGenAi.next()) { var genAiId = grGenAi.getUniqueValue(); var isActive = grGenAi.getValue('active') == '1'; if (!isActive) continue; var addConfigStr = grGenAi.getValue('additional_configurations'); var parentId = grGenAi.getValue('parent'); var definitionId = grGenAi.getValue('definition'); var definitionTable = grGenAi.getValue('definition_table'); var linkedToActiveComponent = false; if (definitionTable === 'sys_one_extend_capability_definition' && fetchedData.capability_definitions[definitionId]) { linkedToActiveComponent = true; capDefToGenAiMap[definitionId] = genAiId; } if (addConfigStr) { var addConfig = parseJsonString(addConfigStr, null); if (addConfig && addConfig.skill_config_id && fetchedData.skills[addConfig.skill_config_id]) { linkedToActiveComponent = true; skillToGenAiMap[addConfig.skill_config_id] = genAiId; } } if (parentId && fetchedData.capabilities[parentId]) { linkedToActiveComponent = true; capabilityToGenAiMap[parentId] = genAiId; } if (linkedToActiveComponent) { if (activeGenAiConfigIds.indexOf(genAiId) === -1) activeGenAiConfigIds.push(genAiId); fetchedData.genai_configs[genAiId] = extractData(grGenAi, genAiFields); var genConf = fetchedData.genai_configs[genAiId]; genConf.prompt_inputs = extractPlaceholders(genConf.prompt); genConf.additional_configurations_json = parseJsonString(genConf.additional_configurations, {}); genAiCount++; } } gs.info(logPrefix + 'Identified and processed ' + genAiCount + ' unique ACTIVE GenAI Config records linked to fetched components.');


    // --- 6. Build Reference-Based Output ---
    gs.info(logPrefix + 'Building reference-based output structure...');

    // Populate final output objects (No change needed here)
    function populateOutput(sourceData, targetObject) { for (var id in sourceData) { if (sourceData.hasOwnProperty(id)) { targetObject[id] = {}; for (var key in sourceData[id]) { if (sourceData[id].hasOwnProperty(key)) { targetObject[id][key] = sourceData[id][key]; } } } } }
    populateOutput(fetchedData.agents, output.agents); populateOutput(fetchedData.tools, output.tools); populateOutput(fetchedData.capabilities, output.capabilities); populateOutput(fetchedData.skills, output.skills); populateOutput(fetchedData.genai_configs, output.genai_configs); populateOutput(fetchedData.flows, output.flows); populateOutput(fetchedData.triggers, output.triggers);

    // Post-process final output objects for references (No change needed here)
    /* ... Agent Tool Refs ... */ for (var agentId in output.agents) { output.agents[agentId].tools = []; fetchedData.agent_tools_m2m.forEach(function (m2m) { if (m2m.agent === agentId && output.tools[m2m.tool]) { var toolRef = { sys_id: m2m.tool, name: output.tools[m2m.tool].name }; toolRef.agent_tool_m2m_config = { sys_id: m2m.sys_id, inputs: m2m.inputs ? parseJsonString(m2m.inputs, m2m.inputs) : [], execution_mode: m2m.execution_mode, display_output: m2m.display_output, output_transformation_strategy: m2m.output_transformation_strategy, name_in_agent: m2m.name, description_in_agent: m2m.description }; addUniqueRef(output.agents[agentId].tools, toolRef); } }); }
    /* ... Tool Target Refs ... */ for (var toolId in output.tools) { var tool = output.tools[toolId]; var originalTool = fetchedData.tools[toolId]; if (!originalTool) continue; var targetId = originalTool.target_document; var targetTable = originalTool.target_document_table; var targetRef = null; if (targetTable === 'sys_one_extend_capability' && output.capabilities[targetId]) { targetRef = { sys_id: targetId, name: output.capabilities[targetId].name, type: targetTable }; } else if (targetTable === 'sn_nowassist_skill_config' && output.skills[targetId]) { targetRef = { sys_id: targetId, name: output.skills[targetId].name, type: targetTable }; } else if (targetTable === 'sys_flow_design' && output.flows[targetId]) { targetRef = { sys_id: targetId, name: output.flows[targetId].name, type: targetTable }; } tool.target_details_ref = targetRef; delete tool.target_document; delete tool.target_document_table; }
    /* ... Cap/Skill GenAI Refs ... */ for (var capId in output.capabilities) { var cap = output.capabilities[capId]; var originalCapData = fetchedData.capabilities[capId]; if (originalCapData && originalCapData._temp_cap_def) { cap.capability_definition = originalCapData._temp_cap_def; var capDefId = cap.capability_definition.sys_id; var genAiIdViaDef = capDefToGenAiMap[capDefId]; if (genAiIdViaDef && output.genai_configs[genAiIdViaDef]) { cap.genai_config_ref = { sys_id: genAiIdViaDef, name: output.genai_configs[genAiIdViaDef].name }; } if (cap.capability_definition) delete cap.capability_definition.capability; } var genAiIdViaParent = capabilityToGenAiMap[capId]; if (genAiIdViaParent && output.genai_configs[genAiIdViaParent]) { cap.genai_config_ref = { sys_id: genAiIdViaParent, name: output.genai_configs[genAiIdViaParent].name }; } delete cap._temp_cap_def; } for (var skillId in output.skills) { var skill = output.skills[skillId]; var genAiIdViaSkill = skillToGenAiMap[skillId]; if (genAiIdViaSkill && output.genai_configs[genAiIdViaSkill]) { skill.genai_config_ref = { sys_id: genAiIdViaSkill, name: output.genai_configs[genAiIdViaSkill].name }; } }

    // Assemble Use Case Hierarchy with References to components
    // Pre-build Team -> Agents map (no change)
    var teamToAgentsMap = {};
    fetchedData.team_members.forEach(function (member) {
        if (fetchedData.agents[member.agent]) { // Check if agent was fetched
            if (!teamToAgentsMap[member.team]) { teamToAgentsMap[member.team] = []; }
            addUniqueRef(teamToAgentsMap[member.team], { sys_id: member.agent, name: fetchedData.agents[member.agent].name });
        }
    });

    // *** Assemble Use Case Loop (CORRECTED AGENT LINKING) ***
    output.use_cases = []; // Ensure it starts empty
    for (var ucId in fetchedData.usecases) {
        // Proceed if the use case object exists
        if (fetchedData.usecases[ucId]) {
            // Use stringify/parse for deep copy
            var usecase = JSON.parse(JSON.stringify(fetchedData.usecases[ucId]));
            usecase.agents = [];
            usecase.triggers = [];

            // ** MODIFIED: Get agents ONLY from the team linked to this use case **
            var associatedTeamId = fetchedData.usecases[ucId].team; // Get team sys_id from use case data
            if (associatedTeamId && teamToAgentsMap[associatedTeamId]) {
                // If team exists and has agents mapped, add those agents
                teamToAgentsMap[associatedTeamId].forEach(function (agentRef) {
                    addUniqueRef(usecase.agents, agentRef);
                });
            } else if (associatedTeamId) {
                gs.info(logPrefix + 'Use Case ' + ucId + ' linked to Team ' + associatedTeamId + ', but team has no agents mapped or was not fetched.');
            } else {
                gs.info(logPrefix + 'Use Case ' + ucId + ' has no associated team field value.');
            }
            // ** END MODIFICATION **

            // Find ACTIVE Triggers for this Use Case (Triggers 'active' flag was reliable)
            for (var triggerId in output.triggers) {
                if (output.triggers[triggerId] && output.triggers[triggerId].usecase === ucId && output.triggers[triggerId].active == '1') {
                    addUniqueRef(usecase.triggers, { sys_id: triggerId, name: output.triggers[triggerId].name });
                }
            }
            output.use_cases.push(usecase); // Add the fully processed use case
        }
    }

    gs.info(logPrefix + 'Export processing complete. Outputting JSON.');
    gs.info(JSON.stringify(output, null, 2));

})();