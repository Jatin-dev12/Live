// Test script to clean up the last 4 database entries
// This will remove any entries that might have array fields from previous versions

console.log('🧹 Database Cleanup Script');
console.log('This script will delete the last 4 entries from the leads database');
console.log('');
console.log('To run the cleanup, make a DELETE request to:');
console.log('DELETE /api/leads/cleanup/last-four');
console.log('');
console.log('Example using curl:');
console.log('curl -X DELETE http://localhost:3000/api/leads/cleanup/last-four');
console.log('');
console.log('Example using fetch:');
console.log(`
fetch('/api/leads/cleanup/last-four', {
    method: 'DELETE'
})
.then(response => response.json())
.then(data => {
    console.log('Cleanup result:', data);
});
`);
console.log('');
console.log('⚠️  WARNING: This will permanently delete the last 4 entries!');
console.log('Make sure you want to proceed before running this endpoint.');