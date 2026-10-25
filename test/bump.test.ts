import { describe, expect, it } from "vitest";
import { nextVersion, suggestBump } from "../src/bump.js";
import { parseCommitMessage, type ParsedCommit } from "../src/commit.js";

function commit(message: string): ParsedCommit {
  const parsed = parseCommitMessage(message);
  if (!parsed) {
    throw new Error(`fixture is not a conventional commit: ${message}`);
  }
  return parsed;
}

describe("suggestBump", () => {
  it("returns major when any commit is breaking", () => {
    expect(suggestBump([commit("feat: a"), commit("fix!: b")])).toBe("major");
  });

  it("returns minor when a feature is present", () => {
    expect(suggestBump([commit("fix: a"), commit("feat: b")])).toBe("minor");
  });

  it("returns patch for fixes and performance work", () => {
    expect(suggestBump([commit("perf: a")])).toBe("patch");
    expect(suggestBump([commit("fix: a")])).toBe("patch");
  });

  it("returns none when nothing user-facing changed", () => {
    expect(suggestBump([commit("chore: update deps"), commit("docs: readme")])).toBe("none");
  });
});

describe("nextVersion", () => {
  it.each([
    ["1.4.2", "major", "2.0.0"],
    ["1.4.2", "minor", "1.5.0"],
    ["1.4.2", "patch", "1.4.3"],
    ["v1.4.2", "none", "1.4.2"],
  ] as const)("bumps %s by %s to %s", (current, level, expected) => {
    expect(nextVersion(current, level)).toBe(expected);
  });

  it("rejects values that are not semver", () => {
    expect(() => nextVersion("1.4", "patch")).toThrow(/Invalid semver/);
  });
});
