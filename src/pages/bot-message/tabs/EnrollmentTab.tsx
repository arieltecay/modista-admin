import React, { useEffect, useState } from 'react';
import { botEnrollmentService } from '../../../services/bot-enrollment/botEnrollmentService';
import EnrollmentSettings from '../components/EnrollmentSettings';
import { notify } from '../../../components/shared/Toast';

type LoadedConfig = Awaited<ReturnType<typeof botEnrollmentService.getConfig>>;

const EnrollmentTab: React.FC = () => {
  const [config, setConfig] = useState<LoadedConfig | null>(null);
  const [failed, setFailed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    botEnrollmentService.getConfig().then(setConfig).catch(() => setFailed(true));
  }, []);

  if (failed) return <p className="p-4 text-sm text-red-600">No se pudo cargar la configuración de inscripciones.</p>;
  if (!config) return <p className="p-4 text-sm text-gray-500">Cargando...</p>;

  return (
    <EnrollmentSettings
      key={JSON.stringify(config)}
      value={config}
      defaults={config.defaults}
      saving={saving}
      onSave={async value => {
        setSaving(true);
        try {
          setConfig(await botEnrollmentService.saveConfig(value));
          notify.success('Configuración de inscripciones guardada');
        } catch {
          notify.error('No se pudo guardar la configuración');
        } finally {
          setSaving(false);
        }
      }}
    />
  );
};

export default EnrollmentTab;
