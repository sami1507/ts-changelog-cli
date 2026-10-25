#!/usr/bin/env node
import { parseArgs } from "node:util";
import { nextVersion, suggestBump } from "./bump.js";
import { renderRelease } from "./changelog.js";
import { readCommits } from "./git.js";

const USAGE = `Usage: changelog-gen [options]

Options:
  --range <rev>       Git revision range, e.g. v1.2.0..HEAD (default: full history)
  --current <semver>  Currently released version (default: 0.0.0)
  --repo <url>        Repository URL used to link commit hashes
  --json              Print the suggested bump and next version as JSON
  -h, --help          Show this help
`;

async function main(argv: string[]): Promise<number> {
  const { values } = parseArgs({
    args: argv,
    options: {
      range: { type: "string" },
      current: { type: "string", default: "0.0.0" },
      repo: { type: "string" },
      json: { type: "boolean", default: false },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
  });

  if (values.help) {
    process.stdout.write(USAGE);
    return 0;
  }

  const commits = await readCommits({ range: values.range });
  const bump = suggestBump(commits);
  const version = nextVersion(values.current, bump);

  if (values.json) {
    process.stdout.write(`${JSON.stringify({ bump, version, commits: commits.length }, null, 2)}\n`);
  } else {
    const date = new Date().toISOString().slice(0, 10);
    process.stdout.write(renderRelease({ version, date, commits, repoUrl: values.repo }));
  }
  return 0;
}

main(process.argv.slice(2)).then(
  (code) => {
    process.exitCode = code;
  },
  (error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`changelog-gen: ${message}\n`);
    process.exitCode = 1;
  },
);
