import type { ParsedCommit } from "./commit.js";

/** Section titles in the order they appear in a release. */
export const SECTION_TITLES: Readonly<Record<string, string>> = {
  feat: "Features",
  fix: "Bug Fixes",
  perf: "Performance Improvements",
  refactor: "Code Refactoring",
  revert: "Reverts",
  docs: "Documentation",
};

export interface ReleaseOptions {
  version: string;
  /** ISO date, e.g. `2026-10-25`. Passed in so output stays deterministic. */
  date: string;
  commits: readonly ParsedCommit[];
  /** Repository URL, e.g. `https://github.com/owner/repo`, used to link commits. */
  repoUrl?: string;
}

function formatEntry(commit: ParsedCommit, repoUrl?: string): string {
  const scope = commit.scope ? `**${commit.scope}:** ` : "";

  let reference = "";
  if (commit.hash) {
    const short = commit.hash.slice(0, 7);
    reference = repoUrl ? ` ([${short}](${repoUrl}/commit/${commit.hash}))` : ` (${short})`;
  }
  return `- ${scope}${commit.subject}${reference}`;
}

/** Renders one release block as Markdown. */
export function renderRelease({ version, date, commits, repoUrl }: ReleaseOptions): string {
  const lines = [`## [${version}] - ${date}`, ""];

  const breaking = commits.filter((commit) => commit.breaking);
  if (breaking.length > 0) {
    lines.push("### BREAKING CHANGES", "", ...breaking.map((commit) => formatEntry(commit, repoUrl)), "");
  }

  for (const [type, title] of Object.entries(SECTION_TITLES)) {
    const entries = commits.filter((commit) => commit.type === type);
    if (entries.length === 0) {
      continue;
    }
    lines.push(`### ${title}`, "", ...entries.map((commit) => formatEntry(commit, repoUrl)), "");
  }

  return `${lines.join("\n").trimEnd()}\n`;
}
