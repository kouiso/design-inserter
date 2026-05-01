/**
 * Mailpit helper for E2E tests.
 *
 * MusashiPaint Docker compose ships an `axllent/mailpit` container exposing the
 * Mailpit HTTP API on port 8025 and SMTP on port 1025. WordPress (`wp_mail`) is
 * configured to deliver via SMTP, so any email triggered during a test run is
 * captured by Mailpit and observable via the JSON API.
 *
 * Usage:
 *   import { clearMailpit, waitForMailpitMessage } from '../helpers/mail';
 *
 *   test.beforeEach(async () => {
 *     await clearMailpit();
 *   });
 *
 *   test('sends notification mail', async ({ page }) => {
 *     await page.goto('/contact/');
 *     // ... submit form ...
 *     const msg = await waitForMailpitMessage({ to: 'admin@example.com' });
 *     expect(msg.Subject).toContain('問い合わせ');
 *   });
 *
 * Reference: https://mailpit.axllent.org/docs/api-v1/
 */

export const MAILPIT_BASE_URL: string =
  process.env.MAILPIT_BASE_URL || 'http://localhost:8025';

/**
 * Mailpit address entry as returned by `/api/v1/messages` and
 * `/api/v1/message/{id}`.
 */
export interface MailpitAddress {
  Name: string;
  Address: string;
}

/**
 * Summary entry returned by `GET /api/v1/messages`.
 *
 * Mailpit truncates body fields in the listing endpoint; full text/HTML can be
 * fetched via `getMailpitMessageById` if needed.
 */
export interface MailpitMessageSummary {
  ID: string;
  MessageID: string;
  Read: boolean;
  From: MailpitAddress;
  To: MailpitAddress[];
  Cc?: MailpitAddress[];
  Bcc?: MailpitAddress[];
  Subject: string;
  Created: string;
  Tags?: string[];
  Size: number;
  Attachments: number;
  Snippet?: string;
}

/**
 * Full message returned by `GET /api/v1/message/{ID}`.
 */
export interface MailpitMessage extends MailpitMessageSummary {
  ReplyTo?: MailpitAddress[];
  ReturnPath?: string;
  Date?: string;
  Text?: string;
  HTML?: string;
  Inline?: unknown[];
  Headers?: Record<string, string[]>;
}

interface MessagesListResponse {
  total: number;
  unread: number;
  count: number;
  messages_count: number;
  start: number;
  tags?: string[];
  messages: MailpitMessageSummary[];
}

export interface MailpitFilter {
  to?: string;
  subject?: string;
}

/**
 * Delete every message currently held by Mailpit. Should be called from
 * `test.beforeEach` so each test observes a clean inbox.
 *
 * Mailpit returns 200 with an empty body on success.
 */
export async function clearMailpit(): Promise<void> {
  const res = await fetch(`${MAILPIT_BASE_URL}/api/v1/messages`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(
      `Mailpit DELETE /api/v1/messages failed: ${res.status} ${res.statusText}`,
    );
  }
}

/**
 * Fetch the current message list from Mailpit, optionally narrowed by an
 * in-memory filter on `to` (any recipient address) and/or `subject` (substring,
 * case-insensitive).
 *
 * Filtering is applied client-side rather than via Mailpit search syntax to
 * keep the helper predictable and free of search-grammar surprises.
 */
export async function getMailpitMessages(
  filter?: MailpitFilter,
): Promise<MailpitMessageSummary[]> {
  const res = await fetch(`${MAILPIT_BASE_URL}/api/v1/messages`);
  if (!res.ok) {
    throw new Error(
      `Mailpit GET /api/v1/messages failed: ${res.status} ${res.statusText}`,
    );
  }
  const body = (await res.json()) as MessagesListResponse;
  let messages = body.messages || [];

  if (filter?.to) {
    const wanted = filter.to.toLowerCase();
    messages = messages.filter((m) =>
      (m.To || []).some((addr) => (addr.Address || '').toLowerCase() === wanted),
    );
  }

  if (filter?.subject) {
    const needle = filter.subject.toLowerCase();
    messages = messages.filter((m) =>
      (m.Subject || '').toLowerCase().includes(needle),
    );
  }

  return messages;
}

/**
 * Fetch the full message (including Text, HTML, and Headers) by Mailpit ID.
 */
export async function getMailpitMessageById(id: string): Promise<MailpitMessage> {
  const res = await fetch(`${MAILPIT_BASE_URL}/api/v1/message/${encodeURIComponent(id)}`);
  if (!res.ok) {
    throw new Error(
      `Mailpit GET /api/v1/message/${id} failed: ${res.status} ${res.statusText}`,
    );
  }
  return (await res.json()) as MailpitMessage;
}

/**
 * Poll Mailpit until a message matching `filter` arrives, or `timeout` ms pass.
 *
 * Returns the FULL message (Text + HTML + Headers) by chaining a follow-up
 * call to `/api/v1/message/{id}`. Throws if no message arrives within the
 * timeout.
 */
export async function waitForMailpitMessage(
  filter: MailpitFilter,
  timeout = 10_000,
): Promise<MailpitMessage> {
  const intervalMs = 250;
  const deadline = Date.now() + timeout;

  let lastSeen = 0;
  while (Date.now() < deadline) {
    const matches = await getMailpitMessages(filter);
    if (matches.length > 0) {
      return getMailpitMessageById(matches[0].ID);
    }
    lastSeen = matches.length;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `Timed out after ${timeout}ms waiting for Mailpit message ` +
      `matching ${JSON.stringify(filter)} (last seen=${lastSeen}).`,
  );
}
