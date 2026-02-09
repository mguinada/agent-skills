#!/usr/bin/env node

/**
 * LLM-based Skill Evaluator
 *
 * Uses Groq API with openai/gpt-oss-20b model to judge Agent Skills quality.
 *
 * Evaluation Criteria:
 *
 * DESCRIPTION (4 criteria):
 * - specificity: Are capabilities concretely described?
 * - trigger_term_quality: Natural language users would say
 * - completeness: Covers both "what" and "when"
 * - distinctiveness_conflict_risk: Clear differentiation from other skills
 *
 * CONTENT (4 criteria):
 * - conciseness: Lean, efficient, assumes Claude's competence
 * - actionability: Copy-paste ready examples, verification commands
 * - workflow_clarity: Clear sequencing and decision points
 * - progressive_disclosure: Overview with signaled references
 *
 * STRUCTURE (4 criteria):
 * - frontmatter_quality: All required fields, proper format
 * - trigger_clarity: Clear "Use when" conditions
 * - example_quality: Working, tested code samples
 * - completeness: Covers edge cases, error handling
 */

const BASE_URL = process.env.OPEN_AI_LLM_URL || 'https://api.groq.com/openai/v1';
const API_KEY = process.env.LLM_API_KEY;

if (!API_KEY) {
  console.error('Error: LLM_API_KEY environment variable is required');
  console.error('Set it in .env file or with: export LLM_API_KEY=your_key_here');
  process.exit(1);
}

const EVALUATION_PROMPT = `Analyze this Agent Skill for quality:

Name: {name}
Description: {description}
Tags: {tags}
Author: {author}
Version: {version}

Content:
{body}

Evaluate on scale of 1-3 (3=excellent, 2=good, 1=needs improvement):

DESCRIPTION (4 criteria):
- specificity: Concrete actions vs vague language
- trigger_term_quality: Natural user language variations
- completeness: Covers "what" and "when"
- distinctiveness_conflict_risk: Clear scope differentiation

CONTENT (4 criteria):
- conciseness: Efficient, explains only what Claude wouldn't know
- actionability: Working code samples, verification commands
- workflow_clarity: Clear structure, decision trees
- progressive_disclosure: Overview with references for depth

STRUCTURE (4 criteria):
- frontmatter_quality: Required fields present, valid format
- trigger_clarity: Clear "Use when" conditions
- example_quality: Complete, tested code examples
- completeness: Edge cases, error handling covered

Calculate scores:
- Description: (sum / 12) × 100
- Content: (sum / 12) × 100
- Structure: (sum / 12) × 100
- Overall: average of all three

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "description": { "specificity": 3, "trigger_term_quality": 3, "completeness": 3, "distinctiveness_conflict_risk": 3, "score": 100, "feedback": "..." },
  "content": { "conciseness": 3, "actionability": 3, "workflow_clarity": 3, "progressive_disclosure": 3, "score": 100, "feedback": "..." },
  "structure": { "frontmatter_quality": 3, "trigger_clarity": 3, "example_quality": 3, "completeness": 3, "score": 100, "feedback": "..." },
  "overall_score": 100,
  "assessment": "Overall assessment...",
  "suggestions": ["Specific improvement 1", "Specific improvement 2"]
}`;

/**
 * Call Groq API for chat completion
 * @param {string} prompt - The prompt to send
 * @returns {Promise<string>} The response text
 */
async function callLLM(prompt) {
  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 2048,
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 401) {
      throw new Error('Invalid LLM_API_KEY. Please check your API key.');
    }
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();

  // Debug: log the response structure
  if (process.env.DEBUG_LLM) {
    console.error('LLM Response:', JSON.stringify(data, null, 2));
  }

  // Handle different response formats
  // Standard OpenAI format: data.choices[0].message.content
  if (data.choices && data.choices[0] && data.choices[0].message) {
    return data.choices[0].message.content || '{}';
  }

  // Alternative format: direct content field
  if (data.content) {
    return data.content;
  }

  // Alternative format: direct response text
  if (data.response) {
    return data.response;
  }

  // Fallback: return the whole data as JSON string for inspection
  console.error('Unexpected API response format:', JSON.stringify(data, null, 2));
  throw new Error('Unexpected API response format. Set DEBUG_LLM=1 to inspect response.');
}

/**
 * Evaluate a skill using LLM
 * @param {Object} frontmatter - Parsed frontmatter fields
 * @param {string} body - Skill content body
 * @returns {Promise<Object>} Evaluation result with scores and feedback
 */
export async function evaluateSkill(frontmatter, body) {
  const prompt = EVALUATION_PROMPT
    .replace('{name}', frontmatter.name || 'N/A')
    .replace('{description}', frontmatter.description || 'N/A')
    .replace('{tags}', Array.isArray(frontmatter.tags) ? frontmatter.tags.join(', ') : frontmatter.tags || 'N/A')
    .replace('{author}', frontmatter.author || 'N/A')
    .replace('{version}', frontmatter.version || 'N/A')
    .replace('{body}', body);

  try {
    const content = await callLLM(prompt);

    // Try to extract JSON from response (handle markdown code blocks)
    let jsonStr = content.trim();

    // Remove markdown code blocks if present
    if (jsonStr.startsWith('```')) {
      const lines = jsonStr.split('\n');
      // Remove first and last lines if they are code block markers
      if (lines[0].includes('```')) lines.shift();
      if (lines[lines.length - 1].includes('```')) lines.pop();
      jsonStr = lines.join('\n').trim();
    }

    // Remove "json" label if present
    if (jsonStr.toLowerCase().startsWith('json')) {
      jsonStr = jsonStr.slice(4).trim();
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse LLM response as JSON: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Format LLM evaluation result for display
 * @param {Object} evaluation - Evaluation result from evaluateSkill()
 * @returns {string} Formatted output
 */
export function formatEvaluation(evaluation) {
  const lines = [];

  lines.push('\nJudge Evaluation\n');

  // Description section
  if (evaluation.description) {
    const desc = evaluation.description;
    lines.push(`  Description: ${desc.score}%`);
    if (desc.specificity !== undefined) lines.push(`    specificity: ${desc.specificity}/3 - ${getCriterionLabel(desc.specificity)}`);
    if (desc.trigger_term_quality !== undefined) lines.push(`    trigger_term_quality: ${desc.trigger_term_quality}/3 - ${getCriterionLabel(desc.trigger_term_quality)}`);
    if (desc.completeness !== undefined) lines.push(`    completeness: ${desc.completeness}/3 - ${getCriterionLabel(desc.completeness)}`);
    if (desc.distinctiveness_conflict_risk !== undefined) lines.push(`    distinctiveness_conflict_risk: ${desc.distinctiveness_conflict_risk}/3 - ${getCriterionLabel(desc.distinctiveness_conflict_risk)}`);
    if (desc.feedback) lines.push(`    Feedback: ${desc.feedback}`);
    lines.push('');
  }

  // Content section
  if (evaluation.content) {
    const cont = evaluation.content;
    lines.push(`  Content: ${cont.score}%`);
    if (cont.conciseness !== undefined) lines.push(`    conciseness: ${cont.conciseness}/3 - ${getCriterionLabel(cont.conciseness)}`);
    if (cont.actionability !== undefined) lines.push(`    actionability: ${cont.actionability}/3 - ${getCriterionLabel(cont.actionability)}`);
    if (cont.workflow_clarity !== undefined) lines.push(`    workflow_clarity: ${cont.workflow_clarity}/3 - ${getCriterionLabel(cont.workflow_clarity)}`);
    if (cont.progressive_disclosure !== undefined) lines.push(`    progressive_disclosure: ${cont.progressive_disclosure}/3 - ${getCriterionLabel(cont.progressive_disclosure)}`);
    if (cont.feedback) lines.push(`    Feedback: ${cont.feedback}`);
    lines.push('');
  }

  // Structure section
  if (evaluation.structure) {
    const struct = evaluation.structure;
    lines.push(`  Structure: ${struct.score}%`);
    if (struct.frontmatter_quality !== undefined) lines.push(`    frontmatter_quality: ${struct.frontmatter_quality}/3 - ${getCriterionLabel(struct.frontmatter_quality)}`);
    if (struct.trigger_clarity !== undefined) lines.push(`    trigger_clarity: ${struct.trigger_clarity}/3 - ${getCriterionLabel(struct.trigger_clarity)}`);
    if (struct.example_quality !== undefined) lines.push(`    example_quality: ${struct.example_quality}/3 - ${getCriterionLabel(struct.example_quality)}`);
    if (struct.completeness !== undefined) lines.push(`    completeness: ${struct.completeness}/3 - ${getCriterionLabel(struct.completeness)}`);
    if (struct.feedback) lines.push(`    Feedback: ${struct.feedback}`);
    lines.push('');
  }

  // Overall
  if (evaluation.overall_score !== undefined) {
    lines.push(`Average Score: ${evaluation.overall_score}%`);
  }

  if (evaluation.assessment) {
    lines.push(`\nOverall Assessment:\n  ${evaluation.assessment}`);
  }

  if (evaluation.suggestions && evaluation.suggestions.length > 0) {
    lines.push('\nSuggestions:');
    for (const suggestion of evaluation.suggestions) {
      lines.push(`  • ${suggestion}`);
    }
  }

  return lines.join('\n');
}

function getCriterionLabel(score) {
  switch (score) {
    case 3: return 'Excellent';
    case 2: return 'Good';
    case 1: return 'Needs Improvement';
    default: return 'Unknown';
  }
}
