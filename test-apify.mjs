import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envFile = fs.readFileSync(path.join(__dirname, '.env.local'), 'utf-8');
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('='))
);

const token = env.APIFY_API_TOKEN;
console.log('Token starts with:', token ? token.substring(0, 10) + '...' : 'MISSING');

async function testTrigger(actorId) {
  console.log(`\nTesting trigger for: ${actorId}`);
  const url = `https://api.apify.com/v2/acts/${actorId}/runs?token=${token}`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ queries: 'test', maxPagesPerQuery: 1 })
    });
    
    const data = await response.json();
    console.log(`Status: ${response.status}`);
    if (response.ok) {
      console.log('SUCCESS! Run ID:', data.data.id);
    } else {
      console.log('FAILED:', data.error?.message || data.message || JSON.stringify(data));
    }
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

async function runTests() {
  await testTrigger('apify~google-search-scraper');
  await testTrigger('epctex~linkedin-search-scraper');
  await testTrigger('apify~linkedin-profile-scraper');
  await testTrigger('bebity~linkedin-jobs-scraper');
}

runTests();
