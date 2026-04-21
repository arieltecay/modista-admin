import React, { useState } from 'react';
import { InformationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const FormattingGuide: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleGuide = () => setIsOpen(!isOpen);

  const examples = [
    { label: 'Negrita', code: '**texto**', result: '<strong>texto</strong>' },
    { label: 'Cursiva', code: '_texto_', result: '<em>texto</em>' },
    { label: 'Enlace', code: '[click acá](https://...)', result: '<span class="text-pink-600 underline">click acá</span>' },
    { label: 'Botón', code: '[btn:Inscribirme](https://...)', result: '<span class="bg-pink-500 text-white px-2 py-0.5 rounded-full text-xs">Inscribirme</span>' },
    { label: 'Imagen', code: '[img:Ver detalle](https://...)', result: '<span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded border text-[10px]">📷 Miniatura</span>' },
    { label: 'Lista', code: '* Elemento\n- Otro elemento', result: '• Elemento<br>• Otro elemento' },
  ];

  return (
    <div className="relative inline-block ml-2">
      <button
        type="button"
        onClick={toggleGuide}
        className="text-blue-500 hover:text-blue-700 transition-colors flex items-center text-xs font-semibold focus:outline-none"
        title="Guía de formato"
      >
        <InformationCircleIcon className="w-4 h-4 mr-1" />
        Guía de formato
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/5" 
            onClick={toggleGuide}
          />
          <div className="absolute right-0 bottom-full mb-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 p-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex justify-between items-center mb-3 border-b border-gray-50 pb-2">
              <h4 className="font-bold text-gray-800 text-sm flex items-center">
                <span className="bg-blue-100 text-blue-600 p-1 rounded mr-2">
                  <InformationCircleIcon className="w-3.5 h-3.5" />
                </span>
                Atajos de Formato
              </h4>
              <button onClick={toggleGuide} className="text-gray-400 hover:text-gray-600">
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-3">
              {examples.map((ex, i) => (
                <div key={i} className="text-xs">
                  <p className="text-gray-500 font-medium mb-1 uppercase tracking-wider">{ex.label}</p>
                  <div className="grid grid-cols-2 gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                    <code className="text-blue-600 font-mono">{ex.code}</code>
                    <div 
                      className="text-gray-800 italic text-right overflow-hidden truncate"
                      dangerouslySetInnerHTML={{ __html: ex.result }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-gray-50">
              <p className="text-[10px] text-gray-400 leading-tight">
                Usa estos códigos para que tus descripciones se vean increíbles en la web.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FormattingGuide;
