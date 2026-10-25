import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parseGitLog, type ParsedCommit } from "./commit.js";

const execFileAsync = promisify(execFile);

export interface ReadCommitsOptions {
  /** Git revision range such as `v1.2.0..HEAD`. Omit it to read the full history. */
  range?: string;
  /** Working directory the git command runs in. Defaults to the current directory. */
  cwd?: string;
}

/** Reads Conventional Commits from the repository history. */
export async function readCommits({ range, cwd }: ReadCommitsOptions = {}): Promise<ParsedCommit[]> {
  const args = ["log", "--no-color", "--format=%H%x1f%B%x1e"];
  if (range) {
    args.push(range);
  }

  const { stdout } = await execFileAsync("git", args, {
    cwd,
    maxBuffer: 64 * 1024 * 1024,
  });
  return parseGitLog(stdout);
}
