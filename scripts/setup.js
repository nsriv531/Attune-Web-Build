#!/usr/bin/env node
/**
 * scripts/setup.js
 * Run with: node scripts/setup.js
 * Checks Node version, copies .env, warns about fonts, installs deps.
 */
const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GREEN  = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED    = '\x1b[31m';
const CYAN   = '\x1b[36m';
const RESET  = '\x1b[0m';
const BOLD   = '\x1b[1m';

function log(color, msg) { console.log(`${color}${msg}${RESET}`); }
function ok(msg)   { log(GREEN,  `  ✓  ${msg}`); }
function warn(msg) { log(YELLOW, `  ⚠  ${msg}`); }
function err(msg)  { log(RED,    `  ✗  ${msg}`); }
function info(msg) { log(CYAN,   `  →  ${msg}`); }

console.log(`\n${BOLD}StudyLoop — project setup${RESET}\n`);

// ─── 1. Node version check ──────────────────────────────────────────────────
const [major, minor] = process.versions.node.split('.').map(Number);
if (major < 20 || (major === 20 && minor < 17)) {
  err(`Node ${process.versions.node} detected — need >=20.17.0`);
  info('Download the LTS version from https://nodejs.org and re-run setup.');
  process.exit(1);
} else {
  ok(`Node ${process.versions.node}`);
}

// ─── 2. .env.local ─────────────────────────────────────────────────────────
const root       = path.join(__dirname, '..');
const envExample = path.join(root, '.env.example');
const envLocal   = path.join(root, '.env.local');

if (!fs.existsSync(envLocal)) {
  if (fs.existsSync(envExample)) {
    fs.copyFileSync(envExample, envLocal);
    ok('.env.local created from .env.example');
    warn('Open .env.local and add your SUPABASE_URL + SUPABASE_ANON_KEY');
  }
} else {
  ok('.env.local already exists');
}

// ─── 3. Font check ─────────────────────────────────────────────────────────
const fontsDir = path.join(root, 'assets', 'fonts');
const requiredFonts = [
  'DMSans-Regular.ttf',
  'DMSans-Medium.ttf',
  'DMSans-SemiBold.ttf',
  'DMMono-Regular.ttf',
  'DMMono-Medium.ttf',
];
const missingFonts = requiredFonts.filter(f => !fs.existsSync(path.join(fontsDir, f)));

if (missingFonts.length === 0) {
  ok('All fonts present');
} else {
  warn(`Missing fonts (app still runs with system fonts):`);
  missingFonts.forEach(f => info(`  assets/fonts/${f}`));
  info('Download: https://fonts.google.com/specimen/DM+Sans');
  info('        + https://fonts.google.com/specimen/DM+Mono');
}

// ─── 4. npm install ─────────────────────────────────────────────────────────
console.log('');
log(CYAN, '  Installing dependencies...\n');

function runInstall(flags = '') {
  execSync(`npm install${flags ? ' ' + flags : ''}`, { stdio: 'inherit', cwd: root });
}

try {
  // .npmrc already sets legacy-peer-deps=true, but be explicit as a safeguard
  runInstall('--legacy-peer-deps');
  ok('npm install complete');
} catch (e) {
  err('npm install failed — check the output above');
  process.exit(1);
}

// ─── Done ───────────────────────────────────────────────────────────────────
console.log(`
${GREEN}${BOLD}  Setup complete!${RESET}

  Run the app:
  ${CYAN}npx expo start${RESET}           scan QR with Expo Go on your phone
  ${CYAN}npx expo start --web${RESET}     open in browser instantly
  ${CYAN}npx expo start --android${RESET} Android emulator
  ${CYAN}npx expo start --ios${RESET}     iOS Simulator (Mac + Xcode only)
`);
