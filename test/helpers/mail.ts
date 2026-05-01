/**
 * E2E テスト用 Mailpit ヘルパー。
 *
 * MusashiPaint の Docker compose は `axllent/mailpit` コンテナを同梱しており、
 * Mailpit HTTP API をポート 8025、SMTP をポート 1025 で公開している。
 * WordPress (`wp_mail`) は SMTP 経由で配信するよう設定されているため、テスト実行中に
 * トリガーされたメールはすべて Mailpit で受信され、JSON API から観測可能。
 *
 * 使い方:
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
 * 参考: https://mailpit.axllent.org/docs/api-v1/
 */

export const MAILPIT_BASE_URL: string =
  process.env.MAILPIT_BASE_URL || 'http://localhost:8025';

/**
 * `/api/v1/messages` と `/api/v1/message/{id}` が返す Mailpit アドレスエントリ。
 */
export interface MailpitAddress {
  Name: string;
  Address: string;
}

/**
 * `GET /api/v1/messages` が返すサマリーエントリ。
 *
 * Mailpit の一覧エンドポイントは本文フィールドを切り詰めるため、
 * 必要に応じて `getMailpitMessageById` で text/HTML 全文を取得すること。
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
 * `GET /api/v1/message/{ID}` が返す完全なメッセージ。
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
 * Mailpit に保持されている全メッセージを削除する。
 * 各テストがクリーンな受信箱で開始できるよう `test.beforeEach` から呼び出す想定。
 *
 * Mailpit は成功時に空ボディの 200 を返す。
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
 * Mailpit から現在のメッセージ一覧を取得する。任意で `to`（受信者アドレスのいずれか）
 * および/または `subject`（部分一致・大文字小文字無視）によるインメモリフィルタを適用可能。
 *
 * Mailpit の検索構文を使わずクライアント側でフィルタリングすることで、
 * ヘルパーの挙動を予測可能にし、検索文法による思わぬ挙動を避ける。
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
 * Mailpit ID を指定してメッセージ全文（Text / HTML / Headers を含む）を取得する。
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
 * `filter` に合致するメッセージが届くまで、または `timeout` ミリ秒が経過するまで
 * Mailpit をポーリングする。
 *
 * 戻り値は `/api/v1/message/{id}` への追加呼び出しでメッセージ全文
 * （Text + HTML + Headers）を取得したもの。タイムアウト内に届かなければ throw する。
 */
export async function waitForMailpitMessage(
  filter: MailpitFilter,
  timeout = 10_000,
): Promise<MailpitMessage> {
  const intervalMs = 250;
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const matches = await getMailpitMessages(filter);
    if (matches.length > 0) {
      return getMailpitMessageById(matches[0].ID);
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(
    `Mailpit message matching ${JSON.stringify(filter)} did not arrive within ${timeout}ms.`,
  );
}
