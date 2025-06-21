import fs from "fs";
import path from "path";

const currentDir = process.cwd(); // Use current working directory

// Read and parse JSON file
function readJsonFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
    process.exit(1);
  }
}

// Create symbolic link
function createSymlink(source, target) {
  try {
    if (fs.existsSync(target)) {
      fs.unlinkSync(target); // Remove existing symlink if necessary
    }
    fs.symlinkSync(source, target, "junction");
    console.log(`Symlink created: ${target} -> ${source}`);
  } catch (error) {
    console.error("Error creating symlink:", error.message);
    process.exit(1);
  }
}

// Read foundry-config.json
const configPath = path.resolve(currentDir, "./foundry-config.json");
const configData = readJsonFile(configPath);
const { installPath, userdataPath, systemName } = configData;

if (!userdataPath) {
  console.error("Error: userdataPath is missing in foundry-config.json");
  process.exit(1);
}

// Read module.bd.json
const modulePath = path.resolve(currentDir, "./src/module.bd.json");
const moduleData = readJsonFile(modulePath);
const { id } = moduleData;

if (!id) {
  console.error("Error: id is missing in module.bd.json");
  process.exit(1);
}

// Define symlink source and target for module
const sourcePath = path.resolve(currentDir, `./dist/${id}`);
const targetPath = path.join(userdataPath, "Data", "modules", id);

// Ensure target directory exists
const modulesDir = path.dirname(targetPath);
if (!fs.existsSync(modulesDir)) {
  fs.mkdirSync(modulesDir, { recursive: true });
}

// Create the symbolic link for module
createSymlink(sourcePath, targetPath);

// Create "foundry" and "systemName" folders
const foundryDir = path.resolve(currentDir, "foundry");
const systemDir = path.resolve(currentDir, "system");

if (!fs.existsSync(foundryDir)) {
  fs.mkdirSync(foundryDir, { recursive: true });
}
if (!fs.existsSync(systemDir)) {
  fs.mkdirSync(systemDir, { recursive: true });
}

// Create symlink "resources" in "foundry" pointing to "installPath/resources"
const resourcesSource = path.join(installPath, "resources");
const resourcesTarget = path.join(foundryDir, "resources");
createSymlink(resourcesSource, resourcesTarget);

// Create symlink "systemName" in "systemName" pointing to "../systemName"
const systemLinkSource = path.resolve("../", systemName);
const systemLinkTarget = path.join("system", systemName);
createSymlink(systemLinkSource, systemLinkTarget);
