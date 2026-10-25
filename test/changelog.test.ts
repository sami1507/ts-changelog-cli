import { describe, expect, it } from "vitest";
import { renderRelease } from "../src/changelog.js";
import { parseCommitMessage, type ParsedCommit } from "../src/commit.js";

function commit(message: string, hash: string): ParsedCommit {
  const parsed = parseCommitMessage(message, hash);
  if (!parsed) {
    throw new Error(`fixture is not a conventional commit: ${message}`);
  }
  return parsed;
}

describe("renderRelease", () => {
  it("groups entries by type and lists breaking changes first", () => {
    const markdown = renderRelease({
      version: "2.0.0",
      date: "2026-10-25",
      commits: [
        commit("fix(parser): trim whitespace", "1111111aaaa"),
        commit("feat!: remove v1 endpoints", "2222222bbbb"),
        commit("feat(cli): add json output", "3333333cccc"),
      ],
    });

    expect(markdown).toContain("## [2.0.0] - 2026-10-25");
    expect(markdown.indexOf("### BREAKING CHANGES")).toBeLessThan(markdown.indexOf("### Features"));
    expect(markdown).toContain("### Bug Fixes\n\n- **parser:** trim whitespace (1111111)");
    expect(markdown).toContain("- **cli:** add json output (3333333)");
  });

  it("links commit hashes when a repository URL is provided", () => {
    const markdown = renderRelease({
      version: "1.0.1",
      date: "2026-10-25",
      repoUrl: "https://github.com/owner/repo",
      commits: [commit("fix: crash on empty log", "abcdef1234")],
    });

    expect(markdown).toContain("([abcdef1](https://github.com/owner/repo/commit/abcdef1234))");
  });

  it("omits sections that have no entries", () => {
    const markdown = renderRelease({ version: "1.0.0", date: "2026-01-01", commits: [] });
    expect(markdown).not.toContain("###");
  });
});
