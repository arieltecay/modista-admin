import { formatTextToHtml } from '../../parser';
import { GUIDE_ENTRIES } from '../../syntax-spec';

/**
 * Guía generada desde la SPEC: cada ejemplo se renderiza con el parser real,
 * por lo que lo que se muestra es siempre el render verdadero (cero deriva).
 */
const GuidePanel = () => (
  <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-gray-100 bg-white p-3">
    {GUIDE_ENTRIES.map((entry) => (
      <div
        key={entry.label}
        className="grid grid-cols-[110px_1fr] items-center gap-2 text-xs sm:grid-cols-[130px_1fr_1fr]"
      >
        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
          {entry.label}
        </span>
        <code className="whitespace-pre-wrap break-all rounded bg-gray-50 px-1.5 py-1 font-mono text-blue-600">
          {entry.code}
        </code>
        <span
          className="hidden text-[#444842] font-atelier-sans sm:block"
          dangerouslySetInnerHTML={{ __html: formatTextToHtml(entry.code) }}
        />
      </div>
    ))}
    <p className="border-t border-gray-50 pt-2 text-[10px] leading-tight text-gray-400">
      Si un código queda incompleto o mal escrito, la web lo muestra como texto plano: nunca se
      rompe la página.
    </p>
  </div>
);

export default GuidePanel;
