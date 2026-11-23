export interface ComposerProps {
  value: string;
  sending: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  /** When set, replying is not possible and this explains why. */
  blockedReason?: string;
}
