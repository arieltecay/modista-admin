import { type FC, useState, useEffect, FormEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTurnosByCourse, createTurno, updateTurno, deleteTurno } from '@/services/turnos/turnoService';
import { getCourseById } from '@/services/courses/coursesService';
import toast from 'react-hot-toast';
import Spinner from '@/components/shared/Spinner';
import ConfirmDeleteModal from '@/components/shared/ConfirmDeleteModal';
import type { WorkshopCourse, Turno, NewTurno } from './types';

const WorkshopSchedulePage: FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<WorkshopCourse | null>(null);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTurno, setNewTurno] = useState<NewTurno>({ diaSemana: 'Lunes', horaInicio: '09:00', horaFin: '11:00', cupoMaximo: 4, courseId: id || '' });
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
      } catch (e) { toast.error('Error al cargar agenda'); } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const handleAddTurno = async (e: FormEvent) => {
    e.preventDefault();
    try {
      const res = await createTurno({ ...newTurno, courseId: id });
      setTurnos([...turnos, res.data]);
      setIsAdding(false);
      toast.success('Agregado');
    } catch { toast.error('Error'); }
  };

  if (loading) return <div className="flex justify-center p-20"><Spinner /></div>;

  return (
    <div className="p-4 sm:p-8">
      <header className="mb-8">
        <button onClick={() => navigate(`/admin/workshops/${id}`)} className="text-gray-500 mb-4 flex items-center">← Volver</button>
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Agenda: {course?.title}</h1>
          <button onClick={() => setIsAdding(!isAdding)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg">{isAdding ? 'Cancelar' : '+ Turno'}</button>
        </div>
      </header>

      {isAdding && (
        <form onSubmit={handleAddTurno} className="bg-white p-6 rounded-xl border mb-8 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <select value={newTurno.diaSemana} onChange={e => setNewTurno({ ...newTurno, diaSemana: e.target.value })} className="border p-2 rounded">
              {dias.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <input type="time" value={newTurno.horaInicio} onChange={e => setNewTurno({ ...newTurno, horaInicio: e.target.value })} className="border p-2 rounded" />
            <input type="time" value={newTurno.horaFin} onChange={e => setNewTurno({ ...newTurno, horaFin: e.target.value })} className="border p-2 rounded" />
            <input type="number" value={newTurno.cupoMaximo} onChange={e => setNewTurno({ ...newTurno, cupoMaximo: parseInt(e.target.value) })} className="border p-2 rounded" />
          </div>
          <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-lg w-full">Guardar</button>
        </form>
      )}

      <div className="space-y-4">
        {turnos.map(t => (
          <div key={t._id} className="bg-white p-4 rounded-xl border flex justify-between items-center">
            <div>
              <h3 className="font-bold">{t.diaSemana}</h3>
              <p className="text-sm text-gray-500">{t.horaInicio} - {t.horaFin}hs</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold">{t.cuposInscriptos} / {t.cupoMaximo}</p>
              <button onClick={async () => { if (confirm('Eliminar?')) { await deleteTurno(t._id); setTurnos(turnos.filter(x => x._id !== t._id)); } }} className="text-red-500 text-xs mt-2">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorkshopSchedulePage;
