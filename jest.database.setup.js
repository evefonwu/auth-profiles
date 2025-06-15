// Database test environment setup
// Load environment variables from .env.test for database tests
const fs = require("fs");
const path = require("path");

// Manually load .env.test file
const envTestPath = path.resolve(__dirname, ".env.test");
if (fs.existsSync(envTestPath)) {
  const envContent = fs.readFileSync(envTestPath, "utf8");
  const envLines = envContent
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"));

  envLines.forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key] = value;
    }
  });
}

// Verify required environment variables
if (
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
) {
  throw new Error("Missing required environment variables for database tests");
}

// Set timeout for database tests
jest.setTimeout(30000); // 30 seconds

// Global test setup for database tests
beforeAll(async () => {
  console.log("Database tests using:", process.env.NEXT_PUBLIC_SUPABASE_URL);
});

afterAll(async () => {
  // Cleanup after all tests
  console.log("Database tests completed");
});
