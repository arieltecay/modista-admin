import type { ToolbarAction } from '../../editor-utils';

export type ToolbarActionGroup = ToolbarAction['group'];

export interface ToolbarProps {
  onAction: (action: ToolbarAction) => void;
}
