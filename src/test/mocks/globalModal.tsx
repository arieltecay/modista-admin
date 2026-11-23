import type { ReactNode } from 'react';

// Stand-in for components/shared/GlobalModal in tests. Headless UI's enter/leave animation gets
// stuck in jsdom under load, so tab tests check our open/close logic with this plain dialog.
// Escape and backdrop clicks call onClose, like the real one. The real modal runs in e2e/.
interface MockModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
}

const GlobalModal = ({ isOpen, onClose, title, children, footer }: MockModalProps) =>
  isOpen ? (
    <div role="dialog" aria-label={title} onKeyDown={event => event.key === 'Escape' && onClose()}>
      <h3>{title}</h3>
      {children}
      {footer}
    </div>
  ) : null;

export default GlobalModal;
