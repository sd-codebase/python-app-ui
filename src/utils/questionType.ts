// Decide which answer input a question needs.
// NEET / JEE Main questions have no `type`; they keep the original behaviour
// (options -> choose one, has_integer_answer -> number input).

export type AnswerKind = 'single' | 'multiple' | 'true_false' | 'numerical';

const TYPE_TRUE_FALSE = 'true/false';
const TYPE_MULTIPLE_CORRECT = 'multiple correct';
const TYPE_NUMERICAL = 'numerical types/integer types';

export const ABCD = ['a', 'b', 'c', 'd'];
export const TRUE_FALSE = ['True', 'False'];

export const resolveAnswerKind = (
  hasIntegerAnswer?: boolean | null,
  type?: string | null,
): AnswerKind => {
  const t = (type || '').trim().toLowerCase();
  if (hasIntegerAnswer || t === TYPE_NUMERICAL) return 'numerical';
  if (t === TYPE_TRUE_FALSE) return 'true_false';
  if (t === TYPE_MULTIPLE_CORRECT) return 'multiple';
  return 'single';
};

/** True when at least one option has visible text. */
export const hasOptionText = (options?: Record<string, string> | null): boolean =>
  !!options && Object.values(options).some((v) => v != null && String(v).trim() !== '');

/** "a, c" / "c,a" / "A C" -> ['a', 'c'] */
export const parseOptionList = (value?: string | null): string[] =>
  (value || '')
    .replace(/[,;]/g, ' ')
    .split(/\s+/)
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean);

/** Keeps only a valid partly-typed number: digits, one dot, leading minus. */
export const isNumericDraft = (value: string): boolean => /^-?\d*\.?\d*$/.test(value);
