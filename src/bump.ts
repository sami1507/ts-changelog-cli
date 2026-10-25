import type { ParsedCommit } from "./commit.js";

export type BumpLevel = "major" | "minor" | "patch" | "none";

const SEMVER_PATTERN = /^v?(\d+)\.(\d+)\.(\d+)$/;

/** Picks the smallest semver bump that covers every commit in the list. */
export function suggestBump(commits: readonly ParsedCommit[]): BumpLevel {
  if (commits.some((commit) => commit.breaking)) {
    return "major";
  }
  if (commits.some((commit) => commit.type === "feat")) {
    return "minor";
  }
  if (commits.some((commit) => commit.type === "fix" || commit.type === "perf")) {
    return "patch";
  }
  return "none";
}

/** Returns the version that follows `current` after applying `level`. */
export function nextVersion(current: string, level: BumpLevel): string {
  const match = SEMVER_PATTERN.exec(current);
  if (!match) {
    throw new Error(`Invalid semver version: "${current}"`);
  }

  const [major, minor, patch] = match.slice(1).map(Number) as [number, number, number];
  switch (level) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
    case "none":
      return `${major}.${minor}.${patch}`;
  }
}
