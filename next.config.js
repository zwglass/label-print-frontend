const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

const githubPagesBasePath = process.env.GITHUB_PAGES_BASE_PATH || "";

/** @type {(phase: string) => import('next').NextConfig} */
module.exports = (phase) => ({
  output: phase === PHASE_DEVELOPMENT_SERVER ? undefined : "export",
  trailingSlash: true,
  basePath: githubPagesBasePath || undefined,
  assetPrefix: githubPagesBasePath ? `${githubPagesBasePath}/` : undefined,
});
