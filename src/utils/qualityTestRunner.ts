/**
 * Quality Test Runner
 *
 * This script runs the quality test and outputs the results to a file
 */

import { runQualityTestAndOutput } from "./qualityTest";
import { writeFileSync } from "fs";

async function main() {
  console.log("Running Barakatna Platform quality test...");

  try {
    const results = await runQualityTestAndOutput();

    // Write results to file
    writeFileSync("quality-test-results.md", results);

    console.log(
      "Quality test completed. Results written to quality-test-results.md",
    );
  } catch (error) {
    console.error("Error running quality test:", error);
    process.exit(1);
  }
}

main();
