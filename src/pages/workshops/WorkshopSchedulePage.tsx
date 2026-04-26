import { type FC, useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTurnosByCourse, createTurno, updateTurno, deleteTurno } from '@/services/turnos/turnoService';
import { getCourseById } from '@/services/courses/coursesService';
import toast from 'react-hot-toast';
import Spinner from '@/components/shared/Spinner';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import { 
  HiLockClosed, 
  HiLockOpen, 
  HiTrash, 
  HiPlus,
  HiChevronLeft
} from 'react-icons/hi';
import type { WorkshopCourse, Turno, NewTurno } from './types';

const WorkshopSchedulePage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<WorkshopCourse | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [newTurno, setNewTurno] = useState<NewTurno>({
    diaSemana: 'Lunes',
    horaInicio: '09:00',
    horaFin: '11:00',
    cupoMaximo: 4,
    courseId: id || ''
  });

  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, 
    turnoId: '', 
    turnoLabel: '' 
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!id) return;

        const foundCourse: any = await getCourseById(id);
        setCourse(foundCourse);

        const response = await getTurnosByCourse(id, { includeBlocked: true });
        const turnosData = Array.isArray(response) ? response : (response?.data || []);
        setTurnos(turnosData);

        if (foundCourse) {
          setNewTurno(prev => ({ ...prev, courseId: foundCourse._id || foundCourse.uuid || id }));
        }
      } catch (err: any) {
        toast.error('Error al cargar la agenda');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleAddTurno = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const response: { data: Turno } = await createTurno(newTurno);
      setTurnos([...turnos, response.data]);
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
    <div className="bg-gray-50/30 min-h-screen p-4 md:p-10">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(`/admin/workshops/${id}`)}
          className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 mb-6 transition-colors group font-medium"
        >
          <HiChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-lg">Volver al Taller</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Agenda: {course?.title} ✂️
            </h1>
            <p className="text-gray-500 text-lg mt-1 font-medium">Administra los horarios y cupos disponibles.</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className={`flex items-center gap-2 px-8 py-4 rounded-2xl font-bold transition-all shadow-xl active:scale-95 ${
              isAdding 
                ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                : 'bg-[#00a76f] text-white hover:bg-[#008f5d] shadow-[#00a76f]/20'
            }`}
          >
            {isAdding ? 'Cancelar' : <><HiPlus className="w-6 h-6" /> Agregar Turno</>}
          </button>
        </div>

        {isAdding && (
          <form onSubmit={handleAddTurno} className="bg-white p-10 rounded-[2.5rem] shadow-xl border border-emerald-50 mb-12 animate-in slide-in-from-top-4 duration-300">
            <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tight">Configurar Nuevo Horario</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Día</label>
                <select
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700"
                  value={newTurno.diaSemana}
                  onChange={e => setNewTurno({ ...newTurno, diaSemana: e.target.value })}
                >
                  {dias.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Hora Inicio</label>
                <input
                  type="time"
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700"
                  value={newTurno.horaInicio}
                  onChange={e => setNewTurno({ ...newTurno, horaInicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Hora Fin</label>
                <input
                  type="time"
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700"
                  value={newTurno.horaFin}
                  onChange={e => setNewTurno({ ...newTurno, horaFin: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Cupos</label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-gray-700"
                  value={newTurno.cupoMaximo}
                  onChange={e => setNewTurno({ ...newTurno, cupoMaximo: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <div className="mt-10 flex justify-end">
              <button type="submit" className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl active:scale-95">
                Guardar Horario
              </button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {(!turnos || turnos.length === 0) && !isAdding && (
            <div className="bg-white p-20 text-center rounded-[3rem] border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold text-xl">No hay horarios configurados.</p>
            </div>
          )}

          {Array.isArray(turnos) && [...turnos].sort((a, b) => dias.indexOf(a.diaSemana) - dias.indexOf(b.diaSemana)).map(turno => (
            <div
              key={turno._id}
              className={`bg-white p-7 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-6 transition-all duration-300 ${
                turno.isBlocked ? 'opacity-50' : 'hover:shadow-2xl hover:-translate-y-1'
              }`}
            >
              <div className="flex items-center gap-8 w-full sm:w-auto">
                <div className={`w-20 h-20 rounded-[1.75rem] flex items-center justify-center flex-shrink-0 font-black text-2xl transition-colors ${
                  turno.isBlocked ? 'bg-gray-100 text-gray-400' : 'bg-indigo-50 text-indigo-600 shadow-inner'
                }`}>
                  {turno.diaSemana.substring(0, 2)}
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{turno.diaSemana}</h3>
                  <p className="text-gray-400 text-lg font-bold tracking-tight">{turno.horaInicio} - {turno.horaFin} hs</p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-12 w-full sm:w-auto">
                <div className="text-right min-w-[100px]">
                  <p className="text-[10px] text-gray-300 uppercase font-black tracking-[0.2em] mb-1">Cupos</p>
                  <p className="text-3xl font-black text-gray-900 tracking-tighter">
                    <span className={turno.cuposInscriptos >= turno.cupoMaximo ? 'text-red-500' : 'text-emerald-500'}>
                      {turno.cuposInscriptos}
                    </span>
                    <span className="text-gray-200 mx-2">/</span>
                    <span className="text-gray-300">{turno.cupoMaximo}</span>
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => handleToggleBlock(turno)}
                    className={`p-4 rounded-2xl transition-all border-2 shadow-sm ${
                      turno.isBlocked 
                        ? 'bg-gray-100 border-transparent text-gray-400 hover:bg-gray-200' 
                        : 'bg-white border-gray-50 text-gray-300 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50'
                    }`}
                    title={turno.isBlocked ? 'Habilitar' : 'Bloquear'}
                  >
                    {turno.isBlocked ? (
                      <HiLockClosed className="w-7 h-7" />
                    ) : (
                      <HiLockOpen className="w-7 h-7" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(turno)}
                    className="p-4 bg-white border-2 border-gray-50 text-gray-300 rounded-2xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all shadow-sm"
                    title="Eliminar Horario"
                  >
                    <HiTrash className="w-7 h-7" />
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
