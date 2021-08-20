import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";
import { loadConfiguration } from "@selinarnd/local-config";

loadEnvironmentVariables();
setupMocks();

function loadEnvironmentVariables() {
  if (fs.existsSync(path.resolve(__dirname, "..", "config.test.json"))) {
    loadConfiguration("test");
  } else {
    dotenv.config({ path: path.resolve(__dirname, "..", "tests.env") });
  }
}


function setupMocks() {
  jest.mock("@selinarnd/nest-logging");
  }
