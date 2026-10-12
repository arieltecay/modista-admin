import { formatTextToHtml } from '../../parser';
import type { PreviewPanelProps } from './types';

/** Preview 1:1 con el front: mismo parser, mismas clases (index.css del admin espeja el tema). */
const PreviewPanel = ({ value }: PreviewPanelProps) => (
  <div className="rounded-xl border border-indigo-100 bg-white p-4">
    <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-indigo-400">
      Vista previa — igual que en la web
    </p>
    <div
      className="text-base leading-relaxed text-[#444842] font-atelier-sans"
      dangerouslySetInnerHTML={{ __html: formatTextToHtml(value) }}
    />
  </div>
);

export default PreviewPanel;
