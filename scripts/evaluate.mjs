#!/usr/bin/env node

/**
 * Tessl Skill Evaluation Script
 *
 * Evaluates agent skills using Tessl CLI.
 *
 * Usage:
 *   node scripts/evaluate.mjs              # List all skills
 *   node scripts/evaluate.mjs all          # Lint all skills
 *   node scripts/evaluate.mjs all review   # Review all skills
 *   node scripts/evaluate.mjs <skill-name> # Lint specific skill
 *   node scripts/evaluate.mjs <skill-name> review # Review specific skill
 */

import { execSync } from 'child_process';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';

const SKILLS_DIR = 'skills';

// Get all skill directories
function getSkills() {
  const dirs = readdirSync(SKILLS_DIR, { withFileTypes: true });
  return dirs
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name)
    .sort();
}

// Check if tessl is installed
function checkTessl() {
  try {
    execSync('npx tessl --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// Run tessl command
function runTessl(skillPath, command = 'lint') {
  const fullCmd = `npx tessl skill ${command} ${skillPath}`;
  try {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Evaluating: ${skillPath}`);
    console.log(`Command: ${fullCmd}`);
    console.log('='.repeat(60));
    execSync(fullCmd, { stdio: 'inherit' });
    return true;
  } catch (error) {
    return false;
  }
}

// Main function
function main() {
  const args = process.argv.slice(2);
  const command = args.includes('review') ? 'review' : 'lint';

  // Check if tessl is installed
  if (!checkTessl()) {
    console.error('Error: Tessl CLI is not installed.');
    console.error('Run: npm install');
    process.exit(1);
  }

  const skills = getSkills();

  // No args - list skills
  if (args.length === 0) {
    console.log('Available skills:\n');
    for (const skill of skills) {
      const skillPath = join(SKILLS_DIR, skill);
      console.log(`  ${skill}`);
    }
    console.log('\nUsage:');
    console.log('  npm run eval -- <skill-name>       # Lint specific skill');
    console.log('  npm run eval -- <skill-name> review # Review specific skill');
    console.log('  npm run eval:all                   # Lint all skills');
    console.log('  npm run eval:review                # Review all skills');
    return;
  }

  // "all" - evaluate all skills
  if (args[0] === 'all') {
    console.log(`Evaluating all skills (${command})...\n`);

    let passed = 0;
    let failed = 0;

    for (const skill of skills) {
      const skillPath = join(SKILLS_DIR, skill);
      if (runTessl(skillPath, command)) {
        passed++;
      } else {
        failed++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`Summary: ${passed} passed, ${failed} failed out of ${skills.length} skills`);
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

  const skillPath = join(SKILLS_DIR, skillName);
  process.exit(runTessl(skillPath, command) ? 0 : 1);
}

main();
