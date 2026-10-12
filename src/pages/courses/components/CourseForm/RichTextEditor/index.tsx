import { useState } from 'react';
import { EyeIcon, EyeSlashIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { GuidePanel, PreviewPanel, Toolbar } from './components';
import { insertSyntax } from './editor-utils';
import { SPEC_VERSION } from './syntax-spec';
import type { ToolbarAction } from './editor-utils';
import type { RichTextEditorProps } from './types';

/**
 * Editor de texto enriquecido para longDescription.
 * Toolbar (inserta sintaxis en el cursor) + guía generada desde la SPEC +
 * preview 1:1 con la web (mismo parser espejo — SPEC_VERSION en docs/).
 */
const RichTextEditor = ({ value, onChange, onBlur, textareaRef, registerRef }: RichTextEditorProps) => {
  const [showGuide, setShowGuide] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const applyAction = (action: ToolbarAction) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const result = insertSyntax(textarea, action);
    onChange(result.value);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
          Formato enriquecido · SPEC v{SPEC_VERSION}
        </p>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => setShowGuide((prev) => !prev)}
            className="flex items-center rounded-lg px-2 py-1 text-xs font-semibold text-blue-500 transition-colors hover:bg-blue-50"
          >
            <InformationCircleIcon className="mr-1 h-4 w-4" />
            Guía
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((prev) => !prev)}
            className={`flex items-center rounded-lg px-2 py-1 text-xs font-semibold transition-colors ${
              showPreview ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            {showPreview ? (
              <EyeSlashIcon className="mr-1 h-4 w-4" />
            ) : (
              <EyeIcon className="mr-1 h-4 w-4" />
            )}
            Vista previa
          </button>
        </div>
      </div>

      <Toolbar onAction={applyAction} />

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        ref={(element) => {
          textareaRef.current = element;
          registerRef(element);
        }}
        rows={8}
        className="w-full rounded-2xl border-none bg-gray-50 px-4 py-3 font-medium transition-all focus:ring-2 focus:ring-indigo-500"
        placeholder="Explica todo lo que incluye el curso... Usá la barra de arriba para darle formato."
      />

      {showGuide && <GuidePanel />}
      {showPreview && <PreviewPanel value={value} />}
    </div>
  );
};

export default RichTextEditor;
