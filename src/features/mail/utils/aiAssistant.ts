import type { MailMessage, MessageInsight } from '../types';

const ESCALATION_RE = /срочно|важно|эскалац|критичн|немедленн/i;
const MEETING_RE = /встреч|созвон|звонок|собер[её]мся|обсудим на/i;
const TASK_RE = /предлагаю|нужно|прошу|подготовьте|подготовить|организуйте|согласуйте|согласовать|направьте|подтвердите|подтвердить/i;

function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Deterministic client-side heuristic that stands in for a real "Цифровой помощник"
 * backend: no network calls, just keyword/structure analysis of the mock message text.
 */
export function analyzeMessage(message: MailMessage): MessageInsight {
  const haystack = `${message.subject} ${message.body}`;
  const isEscalation = ESCALATION_RE.test(haystack);
  const isMeetingRequest = MEETING_RE.test(haystack);
  const isAwaitingReply = message.unread && message.folderId === 'inbox' && message.senderName !== 'Я';

  const sentences = splitSentences(message.body);
  const summary = sentences[0] || message.preview || message.subject;

  const taskSentences = sentences.filter((s) => TASK_RE.test(s));
  const actionItems = (taskSentences.length > 0 ? taskSentences : sentences.slice(1, 2)).slice(0, 3);
  const hasTask = actionItems.length > 0;

  let expectation: string;
  if (isMeetingRequest) {
    expectation = 'Подтвердить участие и согласовать удобное время встречи.';
  } else if (isEscalation) {
    expectation = 'Оперативно отреагировать и взять вопрос в работу — тема отмечена как срочная.';
  } else if (hasTask) {
    expectation = 'Ознакомиться с поручениями ниже и подготовить ответ по каждому пункту.';
  } else {
    expectation = 'Письмо информационное — специального ответа не требуется, можно ознакомиться в свободное время.';
  }

  const quickReplies: string[] = [];
  if (isMeetingRequest) {
    quickReplies.push('Готов(а) встретиться, предложите, пожалуйста, удобное время.');
  }
  if (isEscalation) {
    quickReplies.push('Беру в работу немедленно, вернусь с обновлением в течение часа.');
  }
  if (hasTask && quickReplies.length < 2) {
    quickReplies.push('Спасибо, ознакомился(ась). Подготовлю ответ по всем пунктам до конца дня.');
  }
  quickReplies.push('Спасибо за письмо, беру на заметку.');

  return {
    summary,
    expectation,
    actionItems: hasTask ? actionItems : [],
    quickReplies: quickReplies.slice(0, 3),
    isEscalation,
    isMeetingRequest,
    isAwaitingReply,
    hasTask,
  };
}

export interface MailboxOverview {
  awaitingReply: MailMessage[];
  escalations: MailMessage[];
  tasks: MailMessage[];
  meetings: MailMessage[];
}

export function analyzeMailbox(messages: MailMessage[]): MailboxOverview {
  const overview: MailboxOverview = { awaitingReply: [], escalations: [], tasks: [], meetings: [] };

  for (const message of messages) {
    const insight = analyzeMessage(message);
    if (insight.isAwaitingReply) overview.awaitingReply.push(message);
    if (insight.isEscalation) overview.escalations.push(message);
    if (insight.hasTask) overview.tasks.push(message);
    if (insight.isMeetingRequest) overview.meetings.push(message);
  }

  return overview;
}
