import { describe, expect, it } from 'vitest';
import { fixedReplyIssue, fixedReplyLength } from './fixedReply';

describe('fixedReply limits (same as the API)', () => {
  it('needs text after trimming', () => {
    expect(fixedReplyIssue('')).toBe('empty');
    expect(fixedReplyIssue(' \n ')).toBe('empty');
    expect(fixedReplyIssue('Hola')).toBeUndefined();
  });

  it('allows 900 characters and rejects 901', () => {
    expect(fixedReplyIssue('a'.repeat(900))).toBeUndefined();
    expect(fixedReplyIssue('a'.repeat(901))).toBe('tooLong');
  });

  it('counts a simple emoji as one character but rejects texts over 1000 bytes', () => {
    expect(fixedReplyLength('👋👋')).toBe(2);
    expect(fixedReplyIssue('👋'.repeat(250))).toBeUndefined();
    expect(fixedReplyIssue('👋'.repeat(251))).toBe('tooLong');
  });
});
