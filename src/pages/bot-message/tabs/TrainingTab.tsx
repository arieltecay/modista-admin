import { useCallback, useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa';
import { botInstructionService } from '../../../services/bot-instruction/botInstructionService';
import { notify } from '../../../components/shared/Toast';
import { BotInstruction, BotInstructionFormData } from '../types';
import InstructionModal from '../components/InstructionModal';
import { RuleCard } from '../components/RuleCard';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadState } from '../components/LoadState';
import { HowItWorks } from '../components/HowItWorks';
import { toInstructions } from '../utils/rules';
import type { LoadStatus } from './types';

const CHANNELS = [
  { channel: 'WhatsApp', text: 'usa todas las reglas activas, las FAQ y los cursos para redactar cada respuesta. Si coincide una respuesta fija, la envía antes de Mila.' },
  { channel: 'Instagram', text: 'responde solo cuando el mensaje contiene una frase de una regla habilitada; si no, queda en la Bandeja para el equipo. Si la regla tiene respuesta fija, la envía tal cual, sin Gemini.' },
  { channel: 'Comentarios:', text: 'Mila contesta una sola vez por mensaje privado. No publica respuestas bajo la publicación.' },
];

const toRule = (instruction: BotInstruction) => ({
  id: instruction._id,
  title: instruction.title,
  content: instruction.content,
  order: instruction.order,
  isActive: instruction.isActive,
  instagramDirect: instruction.instagramAutoReply ?? false,
  instagramComments: instruction.instagramCommentReply ?? false,
  enrollmentLookup: instruction.instagramEnrollmentLookup ?? false,
  keywords: instruction.instagramKeywords ?? [],
  replyMode: instruction.instagramResponseMode === 'fixed' ? 'fixed' as const : 'gemini' as const,
  fixedResponse: instruction.instagramFixedResponse ?? '',
  whatsappFixedReplyEnabled: instruction.whatsappFixedReplyEnabled ?? false,
  whatsappKeywords: instruction.whatsappKeywords ?? [],
  whatsappFixedResponse: instruction.whatsappFixedResponse ?? '',
});

/** "Respuestas automáticas": the bot instructions shown as rules. Same service and payloads as before. */
const TrainingTab = () => {
  const [instructions, setInstructions] = useState<BotInstruction[]>([]);
  const [status, setStatus] = useState<LoadStatus>('loading');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<BotInstruction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toDelete, setToDelete] = useState<BotInstruction | null>(null);

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setInstructions(toInstructions(await botInstructionService.getInstructions()));
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (data: BotInstructionFormData) => {
    setBusy(true);
    try {
      if (editing) {
        await botInstructionService.updateInstruction(editing._id, data);
        notify.success('Instrucción actualizada');
      } else {
        await botInstructionService.createInstruction(data);
        notify.success('Nueva instrucción creada');
      }
      await load();
      setIsModalOpen(false);
    } catch {
      notify.error('Error al guardar la instrucción');
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await botInstructionService.deleteInstruction(toDelete._id);
      await load();
      notify.success('Sección eliminada');
      setToDelete(null);
    } catch {
      notify.error('Error al eliminar');
    } finally {
      setBusy(false);
    }
  };

  const open = (instruction: BotInstruction | null) => {
    setEditing(instruction);
    setIsModalOpen(true);
  };
  const byId = (id: string) => instructions.find(instruction => instruction._id === id) ?? null;

  return (
    <div className="space-y-4">
      <HowItWorks items={CHANNELS} />
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-800">Reglas ({instructions.length})</h2>
        <button type="button" onClick={() => open(null)} className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          <FaPlus aria-hidden="true" /> Nueva regla
        </button>
      </div>

      <LoadState
        status={status}
        loadingLabel="Cargando reglas…"
        errorMessage="No se pudieron cargar las respuestas automáticas."
        isEmpty={instructions.length === 0}
        emptyMessage={<><p className="font-medium">Todavía no hay reglas.</p><p>Mientras tanto, Mila usa su personalidad por defecto en WhatsApp y no responde en Instagram.</p></>}
        onRetry={load}
        skeletonClass="h-56 rounded-2xl"
        skeletonLayoutClass="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {instructions.map(instruction => (
            <RuleCard key={instruction._id} rule={toRule(instruction)} onEdit={id => open(byId(id))} onDelete={id => setToDelete(byId(id))} />
          ))}
        </div>
      </LoadState>

      <InstructionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={save} instruction={editing} loading={busy} />
      <ConfirmDialog
        isOpen={toDelete !== null}
        title="Eliminar regla"
        message={`Mila deja de usar "${toDelete?.title ?? ''}". No se puede deshacer.`}
        confirmLabel="Eliminar"
        busy={busy}
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </div>
  );
};

export default TrainingTab;
