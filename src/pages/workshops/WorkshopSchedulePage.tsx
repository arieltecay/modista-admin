import { type FC, useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTurnosByCourse, createTurno, updateTurno, deleteTurno } from '@/services/turnos/turnoService';
import { getCourseById } from '@/services/courses/coursesService';
import toast from 'react-hot-toast';
import Spinner from '@/components/shared/Spinner';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import { 
  LockClosedIcon, 
  LockOpenIcon, 
  TrashIcon, 
  PlusIcon,
  ChevronLeftIcon
} from '@heroicons/react/24/outline';
import type { WorkshopCourse, Turno, NewTurno } from './types';

const WorkshopSchedulePage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<WorkshopCourse | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTurno, setNewTurno] = useState<NewTurno>({ 
    diaSemana: 'Lunes', 
    horaInicio: '09:00', 
    horaFin: '11:00', 
    cupoMaximo: 4, 
    courseId: id || '' 
  });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, turnoId: '', turnoLabel: '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const foundCourse: any = await getCourseById(id);
        setCourse(foundCourse);
        const response = await getTurnosByCourse(id, { includeBlocked: true });
        setTurnos(response.data || []);
      } catch (e) { 
        toast.error('Error al cargar agenda'); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [id]);

  const handleAddTurno = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await createTurno({ ...newTurno, courseId: id });
      setTurnos([...turnos, res.data]);
      setIsAdding(false);
      toast.success('Horario agregado con éxito');
    } catch { 
      toast.error('Error al agregar horario'); 
    }
  };

  const handleToggleBlock = async (turno: Turno) => {
    try {
      const updated: { data: Turno } = await updateTurno(turno._id, { isBlocked: !turno.isBlocked });
      setTurnos(turnos.map(t => t._id === turno._id ? updated.data : t));
      toast.success(updated.data.isBlocked ? 'Horario bloqueado' : 'Horario habilitado');
    } catch {
      toast.error('Error al actualizar estado');
    }
  };

  const handleDelete = (turno: Turno) => {
    setDeleteModal({
      isOpen: true,
      turnoId: turno._id,
      turnoLabel: `${turno.diaSemana} ${turno.horaInicio} - ${turno.horaFin}`
    });
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteTurno(deleteModal.turnoId);
      setTurnos(turnos.filter(t => t._id !== deleteModal.turnoId));
      toast.success('Horario eliminado');
    } catch {
      toast.error('Error al eliminar');
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, turnoId: '', turnoLabel: '' });
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Spinner /></div>;

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumb - Tamaño más compacto */}
        <button
          onClick={() => navigate(`/admin/workshops/${id}`)}
          className="flex items-center gap-1.5 text-gray-400 hover:text-gray-600 mb-4 transition-colors group"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          <span className="text-base font-medium">Volver</span>
        </button>

        {/* Header - Tamaños reducidos */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              Agenda: {course?.title} ✂️
            </h1>
            <p className="text-gray-400 text-sm mt-0.5 font-medium">Administra horarios y cupos disponibles.</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95 ${
              isAdding 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                : 'bg-[#00a76f] text-white hover:bg-[#008f5d]'
            }`}
          >
            {isAdding ? 'Cancelar' : <><PlusIcon className="w-4 h-4 stroke-[3px]" /> Agregar Turno</>}
          </button>
        </div>

        {/* Formulario de Adición - Más compacto */}
        {isAdding && (
          <form onSubmit={handleAddTurno} className="bg-white p-6 rounded-3xl shadow-lg border border-emerald-50 mb-8 animate-in slide-in-from-top-2 duration-300">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Configurar Horario</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Día</label>
                <select
                  className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm text-gray-700"
                  value={newTurno.diaSemana}
                  onChange={e => setNewTurno({ ...newTurno, diaSemana: e.target.value })}
                >
                  {dias.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Inicio</label>
                <input
                  type="time"
                  className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm"
                  value={newTurno.horaInicio}
                  onChange={e => setNewTurno({ ...newTurno, horaInicio: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Fin</label>
                <input
                  type="time"
                  className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm"
                  value={newTurno.horaFin}
                  onChange={e => setNewTurno({ ...newTurno, horaFin: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Cupos</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-3 bg-gray-50 border-2 border-transparent focus:border-emerald-500 focus:bg-white rounded-xl outline-none transition-all font-bold text-sm"
                  value={newTurno.cupoMaximo}
                  onChange={e => setNewTurno({ ...newTurno, cupoMaximo: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="mt-8 flex justify-end">
              <button type="submit" className="px-8 py-2.5 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all shadow-md active:scale-95">
                Guardar
              </button>
            </div>
          </form>
        )}

        {/* Lista de Turnos - Diseño refinado y compacto */}
        <div className="space-y-4">
          {(!turnos || turnos.length === 0) && !isAdding && (
            <div className="bg-white p-12 text-center rounded-[2rem] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold">No hay horarios configurados.</p>
            </div>
          )}

          {Array.isArray(turnos) && [...turnos].sort((a, b) => dias.indexOf(a.diaSemana) - dias.indexOf(b.diaSemana)).map(turno => (
            <div
              key={turno._id}
              className={`bg-white p-4 rounded-[1.5rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 transition-all duration-300 ${
                turno.isBlocked ? 'opacity-50' : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 font-bold text-lg transition-colors ${
                  turno.isBlocked ? 'bg-gray-100 text-gray-400' : 'bg-gray-50 text-indigo-600'
                }`}>
                  {turno.diaSemana.substring(0, 2)}
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-gray-800 tracking-tight">{turno.diaSemana}</h3>
                  <p className="text-gray-400 text-sm font-semibold tracking-tight">{turno.horaInicio} - {turno.horaFin} hs</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-8 w-full sm:w-auto">
                <div className="text-right min-w-[70px]">
                  <p className="text-[10px] text-gray-300 uppercase font-black tracking-widest mb-0.5">Cupos</p>
                  <p className="text-xl font-black text-gray-900 tracking-tighter">
                    <span className={turno.cuposInscriptos >= turno.cupoMaximo ? 'text-red-500' : 'text-emerald-500'}>
                      {turno.cuposInscriptos}
                    </span>
                    <span className="text-gray-200 mx-1">/</span>
                    <span className="text-gray-300">{turno.cupoMaximo}</span>
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleBlock(turno)}
                    className={`p-3 rounded-xl transition-all border ${
                      turno.isBlocked 
                        ? 'bg-gray-100 border-transparent text-gray-400 hover:bg-gray-200' 
                        : 'bg-white border-gray-50 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50'
                    }`}
                    title={turno.isBlocked ? 'Habilitar' : 'Bloquear'}
                  >
                    {turno.isBlocked ? (
                      <LockClosedIcon className="w-5 h-5 stroke-[2.5px]" />
                    ) : (
                      <LockOpenIcon className="w-5 h-5 stroke-[2.5px]" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(turno)}
                    className="p-3 bg-white border border-gray-50 text-gray-300 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all"
                    title="Eliminar"
                  >
                    <TrashIcon className="w-5 h-5 stroke-[2.5px]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDelete}
        itemName={deleteModal.turnoLabel}
        itemType="el horario"
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default WorkshopSchedulePage;
