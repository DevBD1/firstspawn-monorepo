process.stdin.isTTY = true;
process.stdout.isTTY = true;

// Mock setRawMode on stdin to prevent drizzle-kit from crashing
process.stdin.setRawMode = function(mode) {
  return this;
};

// Mock readline to automatically answer 'n' to any questions
const readline = require('readline');
const originalCreateInterface = readline.createInterface;
readline.createInterface = function(options) {
  const rl = originalCreateInterface(options);
  
  rl.on('line', (line) => {
    console.log(`[Auto-Responder] Received prompt line: ${line}`);
  });
  
  // Send 'n' to the input stream when prompted
  setTimeout(() => {
    if (options.input) {
      options.input.emit('data', 'n\n');
    }
  }, 1000);

  return rl;
};

// Dynamically locate and load drizzle-kit bin.cjs
const path = require('path');
const drizzleKitMain = require.resolve('drizzle-kit');
const drizzleKitBin = path.join(path.dirname(drizzleKitMain), 'bin.cjs');
require(drizzleKitBin);
