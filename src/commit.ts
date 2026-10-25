/**
 * Parsing for Conventional Commits (https://www.conventionalcommits.org).
 */

export interface ParsedCommit {
  /** Full commit hash, or an empty string when the message was parsed on its own. */
  hash: string;
  /** Commit type such as `feat`, `fix` or `chore`. */
  type: string;
  /** Optional scope written in parentheses, e.g. `api` in `feat(api): ...`. */
  scope?: string;
  /** Short description that follows the `type(scope): ` prefix. */
  subject: string;
  /** True for a `feat!:` header or a `BREAKING CHANGE:` footer. */
  breaking: boolean;
  /** Everything after the header line, trimmed. */
  body: string;
}

const HEADER_PATTERN = /^(?<type>[a-z]+)(?:\((?<scope>[^()\s]+)\))?(?<bang>!)?: (?<subject>\S.*)$/;
const BREAKING_FOOTER = /^BREAKING[ -]CHANGE: /m;

// Control characters used by `git log --format=%H%x1f%B%x1e`.
const RECORD_SEPARATOR = "\x1e";
const UNIT_SEPARATOR = "\x1f";

/**
 * Parses a single commit message. Returns `null` when the header is not a
 * valid Conventional Commit header.
 */
export function parseCommitMessage(message: string, hash = ""): ParsedCommit | null {
  const [header = "", ...rest] = message.trim().split("\n");
  const match = HEADER_PATTERN.exec(header.trim());
  if (!match?.groups) {
    return null;
  }

  const { type, scope, bang, subject } = match.groups;
  const body = rest.join("\n").trim();
  return {
    hash,
    type,
    ...(scope ? { scope } : {}),
    subject,
    breaking: bang === "!" || BREAKING_FOOTER.test(body),
    body,
  };
}

/**
 * Parses the output of `git log --format=%H%x1f%B%x1e`.
 * Commits that do not follow the Conventional Commits format are skipped.
 */
export function parseGitLog(output: string): ParsedCommit[] {
  return output
    .split(RECORD_SEPARATOR)
    .map((record) => record.trim())
    .filter((record) => record.length > 0)
    .flatMap((record) => {
      const separatorIndex = record.indexOf(UNIT_SEPARATOR);
      if (separatorIndex === -1) {
        return [];
      }
      const hash = record.slice(0, separatorIndex);
      const commit = parseCommitMessage(record.slice(separatorIndex + 1), hash);
      return commit ? [commit] : [];
    });
}
