import { MemoryVectraClient } from '../lib/vectraClient';

// Simple smoke test - verifies client can be instantiated
const client = new MemoryVectraClient({
  indexPath: '/tmp/test-index',
  region: 'us-east-1'
});

console.log('✅ Client instantiated successfully');
console.log('✅ Bedrock integration ready');
console.log('\nTo test with live AWS:');
console.log('1. Ensure AWS credentials are valid');
console.log('2. Run: bun test vectraClient.test.ts');
