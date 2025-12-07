
const { execSync } = require('child_process');

const repos = ['backend', 'frontend', 'microservice'];

repos.forEach(dir => {
  console.log(`\n=== ${dir.toUpperCase()} ===`);
  try {
    const output = execSync(`git -C ${dir} status`, { stdio: 'inherit' });
  } catch (e) {
    console.error(`Failed to check status for ${dir}`);
  }
});
