#!/usr/bin/env node
/**
 * Aptly.AI - Migration Script: Evaluation Source Backfill
 *
 * Sets `evaluationSource: 'ai'` for applications that have all 4 non-null sub-scores:
 * - scoreBreakdown.skillsScore (or scoreBreakdown.skills)
 * - scoreBreakdown.experienceScore
 * - scoreBreakdown.domainScore
 * - scoreBreakdown.educationScore
 *
 * Sets `evaluationSource: 'fallback'` for all other applications.
 *
 * Usage:
 *   node scripts/migrateEvaluationSource.js --dry-run  (inspect without modifying database)
 *   node scripts/migrateEvaluationSource.js            (perform live updates)
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config();
const mongoose = require('mongoose');
const dns = require('dns');

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

const Application = require('../src/models/Application');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/jobmatch-ai';
const isDryRun = process.argv.includes('--dry-run');

function hasAll4SubScores(app) {
  const sb = app.scoreBreakdown;
  if (!sb) return false;

  const skills = sb.skillsScore ?? sb.skills;
  const exp = sb.experienceScore;
  const domain = sb.domainScore;
  const edu = sb.educationScore;

  const isValidNumber = (val) => typeof val === 'number' && !isNaN(val) && val !== null;

  return (
    isValidNumber(skills) &&
    isValidNumber(exp) &&
    isValidNumber(domain) &&
    isValidNumber(edu)
  );
}

async function runMigration() {
  console.log('\n======================================================');
  console.log(`📦 Aptly.AI - Evaluation Source Migration ${isDryRun ? '(DRY RUN)' : '(LIVE EXECUTION)'}`);
  console.log('======================================================\n');

  try {
    console.log(`📡 Connecting to MongoDB: ${MONGO_URI.replace(/\/\/.*@/, '//<credentials>@')} ...`);
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✔ Connected to MongoDB successfully.\n');
  } catch (err) {
    console.warn('⚠️ Could not connect to MongoDB: ' + err.message);
    console.warn('ℹ To run this migration on your live MongoDB database:');
    console.warn('   1. Ensure MONGO_URI in JobMatch-AI/.env (or environment) has active write credentials.');
    console.warn('   2. Inspect affected counts with dry-run:');
    console.warn('      node scripts/migrateEvaluationSource.js --dry-run');
    console.warn('   3. Execute live backfill:');
    console.warn('      node scripts/migrateEvaluationSource.js');
    process.exit(0);
  }

  try {
    // Read raw records using lean to inspect stored values without Mongoose schema default overriding
    const applications = await Application.find({}).lean();
    console.log(`🔍 Total applications found in database: ${applications.length}`);

    let countAlreadyAi = 0;
    let countAlreadyFallback = 0;
    let toUpdateAi = [];
    let toUpdateFallback = [];

    for (const app of applications) {
      const qualifiesForAi = hasAll4SubScores(app);
      const currentSource = app.evaluationSource;

      if (qualifiesForAi) {
        if (currentSource === 'ai') {
          countAlreadyAi++;
        } else {
          toUpdateAi.push(app._id);
        }
      } else {
        if (currentSource === 'fallback') {
          countAlreadyFallback++;
        } else {
          toUpdateFallback.push(app._id);
        }
      }
    }

    console.log('\n--- Migration Audit Summary ---');
    console.log(`• Records currently correctly tagged 'ai':        ${countAlreadyAi}`);
    console.log(`• Records currently correctly tagged 'fallback':  ${countAlreadyFallback}`);
    console.log(`• Records to update -> 'ai' (all 4 sub-scores):   ${toUpdateAi.length}`);
    console.log(`• Records to update -> 'fallback':                 ${toUpdateFallback.length}`);
    console.log(`• Total modifications required:                   ${toUpdateAi.length + toUpdateFallback.length}`);

    if (isDryRun) {
      console.log('\n======================================================');
      console.log('🛡️  DRY RUN COMPLETED: 0 database records were modified.');
      console.log('To execute this migration against the database, run without --dry-run:');
      console.log('  node scripts/migrateEvaluationSource.js');
      console.log('======================================================\n');
      return;
    }

    // Live Execution
    let updatedCount = 0;
    if (toUpdateAi.length > 0) {
      const resAi = await Application.updateMany(
        { _id: { $in: toUpdateAi } },
        { $set: { evaluationSource: 'ai' } }
      );
      updatedCount += resAi.modifiedCount;
      console.log(`✔ Updated ${resAi.modifiedCount} records to 'ai'.`);
    }

    if (toUpdateFallback.length > 0) {
      const resFallback = await Application.updateMany(
        { _id: { $in: toUpdateFallback } },
        { $set: { evaluationSource: 'fallback' } }
      );
      updatedCount += resFallback.modifiedCount;
      console.log(`✔ Updated ${resFallback.modifiedCount} records to 'fallback'.`);
    }

    console.log('\n======================================================');
    console.log(`✨ Migration Succeeded! Total records updated: ${updatedCount}`);
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Error during migration execution:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
    process.exit(0);
  }
}

runMigration();
