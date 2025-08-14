# TypeDoc Documentation Setup

This project is configured to automatically generate and deploy TypeScript API documentation to Cloudflare Pages.

## Local Development

### Build Documentation
```bash
bun run docs:build
```

### Watch Mode
```bash
bun run docs:watch
```

The documentation will be generated in the `docs/` directory.

## Cloudflare Pages Setup

To deploy the documentation to Cloudflare Pages, you need to:

### 1. Create a Cloudflare Pages Project

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to "Workers & Pages" → "Create application" → "Pages"
3. Connect your GitHub repository
4. Configure the build settings:
   - Build command: `bun install --frozen-lockfile && bun run build:packages && bun run docs:build`
   - Build output directory: `docs`
   - Root directory: `/`

### 2. Set up GitHub Secrets

Add the following secrets to your GitHub repository settings:

- `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token with Pages deployment permissions
  - Create at: https://dash.cloudflare.com/profile/api-tokens
  - Required permissions: "Cloudflare Pages:Edit"
  
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
  - Find at: Right sidebar in Cloudflare dashboard

### 3. GitHub Actions Workflow

The workflow is already configured in `.github/workflows/docs.yml` and will:
- Trigger on pushes to `master` or `main` branch
- Build all packages
- Generate TypeDoc documentation
- Deploy to Cloudflare Pages

## Configuration

### TypeDoc Configuration (`typedoc.json`)

The TypeDoc configuration is set up for a monorepo structure:
- Processes all packages in `packages/*`
- Generates documentation in `docs/` directory
- Uses package entry points at `src/index.ts`
- Includes navigation with categories, groups, and folders

### Customization

To customize the documentation:

1. **Update domain**: Once you have a custom domain, update the workflow to use it
2. **Add CNAME**: If using a custom domain, add it to `typedoc.json`:
   ```json
   "cname": "docs.yourdomain.com"
   ```
3. **Set hosted URL**: For better SEO and sitemap generation:
   ```json
   "hostedBaseUrl": "https://docs.yourdomain.com"
   ```

## Troubleshooting

### Build Failures
- Ensure all packages build successfully: `bun run build:packages`
- Check TypeDoc warnings: `bun run docs:build`

### Deployment Issues
- Verify GitHub secrets are correctly set
- Check Cloudflare Pages project name matches the workflow (`grill-docs`)
- Review GitHub Actions logs for specific errors

## Additional Resources

- [TypeDoc Documentation](https://typedoc.org/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)