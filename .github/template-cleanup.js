#!/usr/bin/env node

/**
 * Template cleanup script
 * This script runs when someone uses this template to create a new repository
 */

const fs = require("fs");
const path = require("path");

function updatePackageJson() {
  const packagePath = path.join(process.cwd(), "package.json");
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

  // Update package.json with user's repository info
  const repoName =
    process.env.GITHUB_REPOSITORY?.split("/")[1] || "my-react-app";
  const repoUrl = process.env.GITHUB_REPOSITORY
    ? `https://github.com/${process.env.GITHUB_REPOSITORY}.git`
    : "https://github.com/username/my-react-app.git";

  packageJson.name = repoName;
  packageJson.repository.url = repoUrl;
  packageJson.bugs.url = repoUrl.replace(".git", "/issues");
  packageJson.homepage = repoUrl.replace(".git", "#readme");

  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + "\n");
  console.log("✅ Updated package.json with repository information");
}

function updateReadme() {
  const readmePath = path.join(process.cwd(), "README.md");
  let readme = fs.readFileSync(readmePath, "utf8");

  const repoName =
    process.env.GITHUB_REPOSITORY?.split("/")[1] || "my-react-app";
  const repoUrl = process.env.GITHUB_REPOSITORY || "username/my-react-app";

  // Update repository references in README
  readme = readme.replace(
    /IQKV\/standard-blank-ui-project-layout/g,
    repoUrl
  );
  readme = readme.replace(
    /# 🚀 React UI Blank Project Layout/g,
    `# 🚀 ${repoName}`
  );

  fs.writeFileSync(readmePath, readme);
  console.log("✅ Updated README.md with repository information");
}

function cleanupTemplateFiles() {
  const filesToRemove = [".github/template-cleanup.js"];

  filesToRemove.forEach((file) => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Removed template file: ${file}`);
    }
  });
}

// Run cleanup
try {
  updatePackageJson();
  updateReadme();
  cleanupTemplateFiles();
  console.log("🎉 Template setup complete! Happy coding!");
} catch (error) {
  console.error("❌ Template cleanup failed:", error.message);
  process.exit(1);
}
