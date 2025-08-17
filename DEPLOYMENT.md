# npm Deployment Guide

This repository is configured with automated npm deployment using GitHub Actions. Here's how to set it up and use it.

## Setup Requirements

### 1. NPM Token Configuration

Before you can deploy, you need to set up an NPM token in your GitHub repository:

1. **Create an NPM Token:**
   - Go to [npmjs.com](https://npmjs.com) and log in
   - Go to your profile → "Access Tokens" 
   - Click "Generate New Token" → "Classic Token"
   - Select "Automation" type (for CI/CD)
   - Copy the generated token

2. **Add Token to GitHub Secrets:**
   - Go to your GitHub repository
   - Navigate to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste your NPM token
   - Click "Add secret"

### 2. GitHub Token (Automatic)

The `GITHUB_TOKEN` is automatically provided by GitHub Actions for creating releases.

## Deployment Methods

You have two workflows available for deployment:

### Method 1: Manual npm Publish (`npm-publish.yml`)

**Features:**
- Manual trigger with version bump options
- Automatic trigger on release creation or version tags
- Comprehensive testing before publish
- Version conflict detection
- Automatic GitHub release creation

**How to use:**
1. Go to Actions tab in your GitHub repository
2. Select "Publish to npm" workflow
3. Click "Run workflow"
4. Choose version bump type (patch/minor/major)
5. Click "Run workflow"

**Automatic triggers:**
- When you create a GitHub release
- When you push a version tag (e.g., `v1.2.3`)

### Method 2: Release-it Workflow (`release.yml`)

**Features:**
- Uses the `release-it` tool for automated releases
- Conventional changelog generation
- More advanced release management
- Supports prerelease versions

**How to use:**
1. Go to Actions tab in your GitHub repository
2. Select "Release with release-it" workflow
3. Click "Run workflow"
4. Choose release type (patch/minor/major/prerelease/etc.)
5. Click "Run workflow"

## Workflow Details

### npm-publish.yml Workflow

```yaml
Triggers:
- Manual (workflow_dispatch) with version type selection
- Release creation (release.published)
- Version tags (push tags v*.*.*)

Jobs:
1. test - Runs linting, typechecking, and unit tests
2. build - Builds the package and uploads artifacts
3. publish - Downloads artifacts and publishes to npm
4. notify - Provides status feedback
```

### release.yml Workflow

```yaml
Triggers:
- Manual (workflow_dispatch) with release type selection

Jobs:
1. test - Runs linting, typechecking, and unit tests
2. release - Uses release-it to handle version, changelog, and publish
```

## Local Testing

Before triggering the workflows, you can test locally:

```bash
# Install dependencies
yarn install

# Run tests
yarn lint
yarn typecheck
yarn test

# Build package
yarn prepare

# Test release (dry run)
yarn release --dry-run
```

## Version Management

### Semantic Versioning

The package follows semantic versioning (semver):
- **patch** (1.0.0 → 1.0.1) - Bug fixes
- **minor** (1.0.0 → 1.1.0) - New features
- **major** (1.0.0 → 2.0.0) - Breaking changes

### Current Version

Current version: `0.1.4`

### Pre-release Versions

You can create pre-release versions using the release-it workflow:
- **prerelease** (1.0.0 → 1.0.1-0)
- **prepatch** (1.0.0 → 1.0.1-0)
- **preminor** (1.0.0 → 1.1.0-0)
- **premajor** (1.0.0 → 2.0.0-0)

## Troubleshooting

### Common Issues

1. **NPM_TOKEN not configured**
   ```
   Error: 401 Unauthorized
   ```
   Solution: Add NPM_TOKEN to GitHub repository secrets

2. **Version already exists**
   ```
   Error: You cannot publish over the previously published versions
   ```
   Solution: The workflow will automatically bump version when triggered manually

3. **Build failures**
   - Check that all tests pass locally
   - Ensure TypeScript compilation succeeds
   - Verify linting passes

### Workflow Status

You can monitor deployment status in:
- GitHub Actions tab
- Repository's releases page
- npm package page: https://www.npmjs.com/package/react-native-joystick-lite

## Package Information

- **Package Name:** `react-native-joystick-lite`
- **Registry:** https://registry.npmjs.org/
- **Repository:** https://github.com/ashik112/react-native-joystick-lite
- **License:** MIT

## Post-Deployment

After successful deployment:
1. Package will be available on npm
2. GitHub release will be created (if triggered manually)
3. CHANGELOG.md will be updated (release-it workflow)
4. Version tag will be created in git

## Manual Deployment (Fallback)

If GitHub Actions fail, you can deploy manually:

```bash
# Build the package
yarn prepare

# Login to npm
npm login

# Publish
npm publish
```

---

*This deployment setup ensures reliable, automated publishing while maintaining quality through comprehensive testing.*
