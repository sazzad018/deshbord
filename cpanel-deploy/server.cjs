// CommonJS wrapper for ES Module
// This file allows cPanel's CommonJS environment to load our ESM code

(async () => {
  try {
    // Dynamically import the ES module
    const app = await import('./index.js');
    console.log('Application started successfully');
  } catch (error) {
    console.error('Failed to start application:', error);
    process.exit(1);
  }
})();
