#!/usr/bin/env node

/**
 * Agent Skills Evaluation Script
 *
 * Validates Agent Skills format (SKILL.md) skills.
 *
 * Usage:
 *   node scripts/evaluate-agent-skills.mjs              # List all skills
 *   node scripts/evaluate-agent-skills.mjs all          # Lint all skills
 *   node scripts/evaluate-agent-skills.mjs all review   # Detailed review all skills
 *   node scripts/evaluate-agent-skills.mjs <skill-name> # Lint specific skill
 *   node scripts/evaluate-agent-skills.mjs <skill-name> review # Review specific skill
 *   node scripts/evaluate-agent-skills.mjs <skill-name> llm    # LLM evaluation
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load .env file if it exists
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([A-Z_]+)=(.*)$/);
    if (match && !line.startsWith('#')) {
      process.env[match[1]] = match[2];
    }
  }
}

// LLM evaluator - only import when --llm flag is present
let llmEvaluator = null;
async function loadLLMEvaluator() {
  if (!llmEvaluator) {
    const module = await import('./llm-evaluator.mjs');
    llmEvaluator = module;
  }
  return llmEvaluator;
}

const SKILLS_DIR = 'skills';

// Required frontmatter fields
const REQUIRED_FIELDS = ['name', 'description', 'version', 'tags'];
const RECOMMENDED_FIELDS = ['author'];

// Get all skill directories
function getSkills() {
  const dirs = readdirSync(SKILLS_DIR, { withFileTypes: true });
  return dirs
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name)
    .sort();
}

// Parse YAML frontmatter from SKILL.md
function parseSkillFile(skillPath) {
  try {
    const content = readFileSync(skillPath, 'utf-8');
    const frontmatterMatch = content.match(/^---\n([\s\S]+?)\n---/);

    if (!frontmatterMatch) {
      return { error: 'No YAML frontmatter found' };
    }

    const frontmatter = frontmatterMatch[1];
    const body = content.slice(frontmatterMatch[0].length).trim();

    // Simple YAML parser (for basic key-value pairs)
    const fields = {};
    const lines = frontmatter.split('\n');
    for (const line of lines) {
      const match = line.match(/^(\w+):\s*(.+)$/);
      if (match) {
        const [, key, value] = match;
        // Handle arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          fields[key] = value.slice(1, -1).split(',').map(v => v.trim());
        } else {
          fields[key] = value;
        }
      }
    }

    return { frontmatter: fields, body, content };
  } catch (error) {
    return { error: error.message };
  }
}

// Validate a skill (simple format for non-LLM evaluation)
function validateSkill(skillName, verbose = false) {
  const skillPath = join(SKILLS_DIR, skillName);
  const skillFile = join(skillPath, 'SKILL.md');

  const result = {
    skill: skillName,
    passed: true,
    warnings: [],
    errors: [],
    score: 0
  };

  // Check SKILL.md exists
  try {
    readFileSync(skillFile, 'utf-8');
  } catch {
    result.errors.push('SKILL.md not found');
    result.passed = false;
    return result;
  }

  // Parse skill file
  const parsed = parseSkillFile(skillFile);

  if (parsed.error) {
    result.errors.push(`Failed to parse: ${parsed.error}`);
    result.passed = false;
    return result;
  }

  const { frontmatter, body } = parsed;

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!frontmatter[field]) {
      result.errors.push(`Missing required field: ${field}`);
      result.passed = false;
    }
  }

  // Check recommended fields
  for (const field of RECOMMENDED_FIELDS) {
    if (!frontmatter[field]) {
      result.warnings.push(`Missing recommended field: ${field}`);
    }
  }

  // Content quality checks
  if (verbose) {
    // Check for code examples
    if (!body.includes('```') && !body.toLowerCase().includes('example')) {
      result.warnings.push('No code examples detected');
    }

    // Check for step-by-step structure
    const hasSteps = /\d+\./.test(body) || /##?\s*(Step|Phase|Stage)/i.test(body);
    if (!hasSteps) {
      result.warnings.push('No clear step-by-step structure detected');
    }

    // Check description quality (trigger hints)
    if (frontmatter.description) {
      const desc = frontmatter.description.toLowerCase();
      if (!desc.includes('use when') && !desc.includes('triggers on')) {
        result.warnings.push('Description missing trigger hint (e.g., "Use when...")');
      }
    }

    // Check body length
    const lineCount = body.split('\n').length;
    if (lineCount < 20) {
      result.warnings.push(`SKILL.md body is short (${lineCount} lines)`);
    }
  }

  // Calculate score
  const maxScore = 100;
  let score = maxScore;

  // Deduct for errors
  score -= result.errors.length * 20;

  // Deduct for warnings
  score -= result.warnings.length * 5;

  result.score = Math.max(0, score);

  return result;
}

// Validate a skill with detailed checks
function validateSkillDetailed(skillName) {
  const skillPath = join(SKILLS_DIR, skillName);
  const skillFile = join(skillPath, 'SKILL.md');

  const checks = [];
  let passed = true;
  let overallScore = 100;

  // Check SKILL.md exists
  try {
    readFileSync(skillFile, 'utf-8');
  } catch {
    return {
      skill: skillName,
      passed: false,
      checks: [{ name: 'skill_md_exists', status: 'error', message: 'SKILL.md not found' }]
    };
  }

  // Parse skill file
  const parsed = parseSkillFile(skillFile);

  if (parsed.error) {
    return {
      skill: skillName,
      passed: false,
      checks: [{ name: 'parse_error', status: 'error', message: `Failed to parse: ${parsed.error}` }]
    };
  }

  const { frontmatter, body, content } = parsed;

  // Check SKILL.md line count
  const lineCount = content.split('\n').length;
  if (lineCount <= 500) {
    checks.push({ name: 'skill_md_line_count', status: 'pass', message: `SKILL.md line count is ${lineCount} (<= 500)` });
  } else {
    checks.push({ name: 'skill_md_line_count', status: 'fail', message: `SKILL.md line count is ${lineCount} (> 500)` });
    passed = false;
  }

  // Check frontmatter is valid
  checks.push({ name: 'frontmatter_valid', status: 'pass', message: 'YAML frontmatter is valid' });

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (frontmatter[field]) {
      checks.push({ name: `${field}_field`, status: 'pass', message: `'${field}' field is valid: '${frontmatter[field]}'` });
    } else {
      checks.push({ name: `${field}_field`, status: 'fail', message: `Missing required field: ${field}` });
      passed = false;
    }
  }

  // Check recommended fields
  for (const field of RECOMMENDED_FIELDS) {
    if (frontmatter[field]) {
      checks.push({ name: `${field}_field`, status: 'pass', message: `'${field}' field is present: '${frontmatter[field]}'` });
    } else {
      checks.push({ name: `${field}_field`, status: 'warn', message: `Missing recommended field: ${field}` });
      overallScore -= 5;
    }
  }

  // Check tags format
  if (frontmatter.tags) {
    if (Array.isArray(frontmatter.tags) && frontmatter.tags.length > 0) {
      checks.push({ name: 'tags_format', status: 'pass', message: `Tags array has ${frontmatter.tags.length} items` });
    } else {
      checks.push({ name: 'tags_format', status: 'warn', message: 'Tags should be a non-empty array' });
      overallScore -= 5;
    }
  }

  // Check version format
  if (frontmatter.version) {
    const versionRegex = /^\d+\.\d+\.\d+(-.*)?$/;
    if (versionRegex.test(frontmatter.version)) {
      checks.push({ name: 'version_format', status: 'pass', message: `Version follows semver: ${frontmatter.version}` });
    } else {
      checks.push({ name: 'version_format', status: 'warn', message: `Version doesn't follow semver: ${frontmatter.version}` });
      overallScore -= 5;
    }
  }

  // Check description quality
  if (frontmatter.description) {
    const desc = frontmatter.description;
    const descLower = desc.toLowerCase();

    if (desc.length >= 20 && desc.length <= 200) {
      checks.push({ name: 'description_length', status: 'pass', message: `Description length is ${desc.length} chars` });
    } else {
      checks.push({ name: 'description_length', status: 'warn', message: `Description length is ${desc.length} chars (should be 20-200)` });
      overallScore -= 5;
    }

    if (descLower.includes('use when') || descLower.includes('triggers on')) {
      checks.push({ name: 'description_trigger_hint', status: 'pass', message: 'Description includes trigger hint' });
    } else {
      checks.push({ name: 'description_trigger_hint', status: 'warn', message: 'Description missing trigger hint (e.g., "Use when...")' });
      overallScore -= 5;
    }
  }

  // Check body content
  if (body) {
    const bodyLines = body.split('\n').length;
    if (bodyLines >= 20) {
      checks.push({ name: 'body_length', status: 'pass', message: `Body has ${bodyLines} lines (>= 20)` });
    } else {
      checks.push({ name: 'body_length', status: 'warn', message: `Body is short (${bodyLines} lines)` });
      overallScore -= 5;
    }

    // Check for examples
    if (body.includes('```') || body.toLowerCase().includes('example')) {
      checks.push({ name: 'has_examples', status: 'pass', message: 'Content includes code examples' });
    } else {
      checks.push({ name: 'has_examples', status: 'warn', message: 'No code examples detected' });
      overallScore -= 5;
    }

    // Check for structure
    const hasStructure = /^#{1,3}\s/m.test(body) || /^\d+\./m.test(body);
    if (hasStructure) {
      checks.push({ name: 'has_structure', status: 'pass', message: 'Content has clear structure (headings or numbered steps)' });
    } else {
      checks.push({ name: 'has_structure', status: 'warn', message: 'No clear structure detected' });
      overallScore -= 5;
    }
  }

  // Calculate final score
  overallScore = Math.max(0, overallScore);

  return {
    skill: skillName,
    passed,
    checks,
    score: overallScore,
    frontmatter,
    body
  };
}

// Format validation result
function formatResult(result, verbose = false) {
  const icon = result.passed ? '✔' : '✗';
  const score = verbose ? ` [${result.score}%]` : '';
  console.log(`  ${icon} ${result.skill}${score}`);

  if (verbose || !result.passed) {
    for (const error of result.errors) {
      console.log(`    ✗ ${error}`);
    }
    for (const warning of result.warnings) {
      console.log(`    ⚠ ${warning}`);
    }
  }
}

// Format detailed validation result with checks
function formatDetailedResult(result) {
  console.log(`\nValidation Checks`);
  for (const check of result.checks) {
    const icon = check.status === 'pass' ? '✔' : check.status === 'warn' ? '⚠' : '✗';
    console.log(`  ${icon} ${check.name} - ${check.message}`);
  }
}

// Evaluate skill with LLM
async function evaluateWithLLM(skillName, frontmatter, body) {
  const llm = await loadLLMEvaluator();
  try {
    const evaluation = await llm.evaluateSkill(frontmatter, body);
    console.log(llm.formatEvaluation(evaluation));
    return evaluation;
  } catch (error) {
    console.error(`\n  ✗ LLM evaluation failed: ${error.message}`);
    return null;
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('review');
  const useLLM = args.includes('llm');

  const skills = getSkills();

  // No args - list skills
  if (args.length === 0 || (args.length === 1 && args[0] === 'review') || (args.length === 1 && args[0] === 'llm')) {
    console.log('Available skills:\n');
    for (const skill of skills) {
      console.log(`  ${skill}`);
    }
    console.log('\nUsage:');
    console.log('  npm run eval -- <skill-name>         # Lint specific skill');
    console.log('  npm run eval -- <skill-name> review  # Detailed review');
    console.log('  npm run eval -- <skill-name> llm     # Validation + LLM evaluation');
    console.log('  npm run eval:all                     # Lint all skills');
    console.log('  npm run eval:review                  # Review all skills');
    console.log('  npm run eval:llm                     # Validate + LLM evaluate all skills');
    return;
  }

  // "all" - evaluate all skills
  if (args[0] === 'all') {
    console.log(`Evaluating all skills${verbose ? ' (detailed review)' : ''}${useLLM ? ' with LLM' : ''}...\n`);

    let passed = 0;
    let failed = 0;
    let totalScore = 0;

    for (const skill of skills) {
      let result;
      if (useLLM) {
        console.log(`${'='.repeat(60)}`);
        console.log(`Evaluating: ${skill}`);
        console.log(`${'='.repeat(60)}`);
        console.log(`Running: Rule-based validation + LLM qualitative analysis\n`);

        result = validateSkillDetailed(skill);

        console.log(`\n${'─'.repeat(40)} PART 1: Rule-based Validation ${'─'.repeat(40)}`);
        formatDetailedResult(result);

        if (result.frontmatter && result.body) {
          console.log(`\n${'─'.repeat(40)} PART 2: LLM Qualitative Analysis ${'─'.repeat(40)}`);
          await evaluateWithLLM(skill, result.frontmatter, result.body);
        }

        console.log(`\n✔ Skill evaluation completed successfully!\n`);
      } else {
        result = validateSkill(skill, verbose);
        formatResult(result, verbose);
      }

      if (result.passed) passed++;
      else failed++;
      totalScore += result.score;
    }

    if (!useLLM) {
      const avgScore = skills.length > 0 ? Math.round(totalScore / skills.length) : 0;
      const status = failed === 0 ? '✔ PASSED' : '✗ FAILED';

      console.log(`\n${'='.repeat(60)}`);
      console.log(`Summary: ${passed} passed, ${failed} failed out of ${skills.length} skills`);
      console.log(`Average Score: ${avgScore}%`);
      console.log(`Status: ${status}`);
      console.log('='.repeat(60));
    }

    process.exit(failed > 0 ? 1 : 0);
    return;
  }

  // Specific skill
  const skillName = args[0];
  if (!skills.includes(skillName)) {
    console.error(`Error: Skill "${skillName}" not found.`);
    console.error('\nAvailable skills:');
    for (const skill of skills) {
      console.error(`  ${skill}`);
    }
    process.exit(1);
    return;
  }

  if (useLLM) {
    console.log(`${'='.repeat(60)}`);
    console.log(`Evaluating: ${skillName}`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Running: Rule-based validation + LLM qualitative analysis\n`);

    const result = validateSkillDetailed(skillName);

    console.log(`\n${'─'.repeat(40)} PART 1: Rule-based Validation ${'─'.repeat(40)}`);
    formatDetailedResult(result);

    if (result.frontmatter && result.body) {
      console.log(`\n${'─'.repeat(40)} PART 2: LLM Qualitative Analysis ${'─'.repeat(40)}`);
      await evaluateWithLLM(skillName, result.frontmatter, result.body);
    }

    console.log(`\n${result.passed ? '✔' : '✗'} Skill evaluation ${result.passed ? 'completed' : 'failed'}!`);
    console.log('='.repeat(60));

    process.exit(result.passed ? 0 : 1);
  } else {
    const result = validateSkill(skillName, verbose);
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Evaluating: ${skillName}`);
    console.log('='.repeat(60));
    formatResult(result, verbose);
    console.log(`\nScore: ${result.score}%`);
    console.log(`Status: ${result.passed ? '✔ PASSED' : '✗ FAILED'}`);
    console.log('='.repeat(60));

    process.exit(result.passed ? 0 : 1);
  }
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
