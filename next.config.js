const { PHASE_DEVELOPMENT_SERVER } = require("next/constants");

const isGithubPages = process.env.GITHUB_PAGES === "true";
const githubPagesBasePath = "/label-print-frontend";

/** @type {(phase: string) => import('next').NextConfig} */
module.exports = (phase) => ({
  output: phase === PHASE_DEVELOPMENT_SERVER ? undefined : "export",
  trailingSlash: true,
  basePath: isGithubPages ? githubPagesBasePath : undefined,
  assetPrefix: isGithubPages ? `${githubPagesBasePath}/` : undefined,
});
