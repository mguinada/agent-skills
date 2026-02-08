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
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

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

// Validate a skill
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

// Main function
function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('review');

  const skills = getSkills();

  // No args - list skills
  if (args.length === 0 || (args.length === 1 && args[0] === 'review')) {
    console.log('Available skills:\n');
    for (const skill of skills) {
      console.log(`  ${skill}`);
    }
    console.log('\nUsage:');
    console.log('  npm run eval -- <skill-name>       # Lint specific skill');
    console.log('  npm run eval -- <skill-name> review # Detailed review');
    console.log('  npm run eval:all                   # Lint all skills');
    console.log('  npm run eval:review                # Review all skills');
    return;
  }

  // "all" - evaluate all skills
  if (args[0] === 'all') {
    console.log(`Evaluating all skills${verbose ? ' (detailed review)' : ''}...\n`);

    let passed = 0;
    let failed = 0;
    let totalScore = 0;

    for (const skill of skills) {
      const result = validateSkill(skill, verbose);
      formatResult(result, verbose);

      if (result.passed) passed++;
      else failed++;
      totalScore += result.score;
    }

    const avgScore = skills.length > 0 ? Math.round(totalScore / skills.length) : 0;
    const status = failed === 0 ? '✔ PASSED' : '✗ FAILED';

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Summary: ${passed} passed, ${failed} failed out of ${skills.length} skills`);
    console.log(`Average Score: ${avgScore}%`);
    console.log(`Status: ${status}`);
    console.log('='.repeat(60));

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

main();
