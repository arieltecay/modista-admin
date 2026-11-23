import { useState } from 'react';
import type { ReactElement } from 'react';
import { FaComments, FaRobot, FaUserCheck, FaWhatsapp } from 'react-icons/fa';
import ConversationsTab from './tabs/ConversationsTab';
import TrainingTab from './tabs/TrainingTab';
import TemplatesTab from './tabs/TemplatesTab';
import EnrollmentTab from './tabs/EnrollmentTab';
import { SectionTabs } from './components/SectionTabs';
import { SectionErrorBoundary } from './components/SectionErrorBoundary';

type TabId = 'inbox' | 'rules' | 'templates' | 'enrollment';

const TABS: { id: TabId; label: string; icon: ReactElement }[] = [
  { id: 'inbox', label: 'Bandeja', icon: <FaComments /> },
  { id: 'rules', label: 'Respuestas automáticas', icon: <FaRobot /> },
  { id: 'templates', label: 'Plantillas de WhatsApp', icon: <FaWhatsapp /> },
  { id: 'enrollment', label: 'Inscripciones', icon: <FaUserCheck /> },
];

const OTHER_TABS: Record<Exclude<TabId, 'inbox'>, () => ReactElement> = {
  rules: () => <TrainingTab />,
  templates: () => <TemplatesTab />,
  enrollment: () => <EnrollmentTab />,
};

/** "Mensajes": inbox and automatic replies of WhatsApp and Instagram. Same routes and API as before. */
const BotMessagePage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('inbox');

  return (
    <div className="flex flex-col gap-4 md:h-[calc(100vh-8rem)]">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Mensajes</h1>
        <p className="mt-1 text-sm text-slate-500">Conversaciones y respuestas automáticas de Mila en WhatsApp e Instagram.</p>
      </header>

      <SectionTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {/* The inbox stays mounted (hidden) so the open conversation and the draft survive tab changes. */}
      <div id="panel-inbox" role="tabpanel" aria-labelledby="tab-inbox" hidden={activeTab !== 'inbox'} className="min-h-0 flex-1">
        <SectionErrorBoundary resetKey={activeTab}>
          <ConversationsTab active={activeTab === 'inbox'} />
        </SectionErrorBoundary>
      </div>
      {activeTab !== 'inbox' && (
        <div id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} className="min-h-0 flex-1 overflow-y-auto">
          <SectionErrorBoundary key={activeTab}>{OTHER_TABS[activeTab]()}</SectionErrorBoundary>
        </div>
      )}
    </div>
  );
};

export default BotMessagePage;
