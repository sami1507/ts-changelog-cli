import { describe, expect, it } from "vitest";
import { parseCommitMessage, parseGitLog } from "../src/commit.js";

describe("parseCommitMessage", () => {
  it("parses a type with a scope", () => {
    expect(parseCommitMessage("feat(api): add pagination")).toMatchObject({
      type: "feat",
      scope: "api",
      subject: "add pagination",
      breaking: false,
    });
  });

  it("marks a bang header as breaking", () => {
    expect(parseCommitMessage("refactor!: drop legacy endpoint")?.breaking).toBe(true);
  });

  it("detects a BREAKING CHANGE footer", () => {
    const message = "fix: correct tax rounding\n\nBREAKING CHANGE: totals are now rounded half-even";
    expect(parseCommitMessage(message)).toMatchObject({ type: "fix", breaking: true });
  });

  it("returns null for messages that are not conventional", () => {
    expect(parseCommitMessage("Update README")).toBeNull();
    expect(parseCommitMessage("Feat: capitalised type")).toBeNull();
  });

  it("keeps the body without the header line", () => {
    const parsed = parseCommitMessage("docs: explain setup\n\nSteps\n- install\n- run");
    expect(parsed?.body).toBe("Steps\n- install\n- run");
  });
});

describe("parseGitLog", () => {
  it("splits records and skips non-conventional commits", () => {
    const output = [
      "aaa1111\x1ffeat(cli): add --json flag\n\x1e",
      "bbb2222\x1fWIP\x1e",
      "ccc3333\x1ffix: handle empty range\n\x1e",
    ].join("\n");

    const commits = parseGitLog(output);
    expect(commits.map((commit) => [commit.hash, commit.type])).toEqual([
      ["aaa1111", "feat"],
      ["ccc3333", "fix"],
    ]);
  });
});
