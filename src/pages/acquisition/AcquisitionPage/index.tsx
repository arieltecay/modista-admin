import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AcquisitionFilters } from '../components/AcquisitionFilters';
import { ChannelTable } from '../components/ChannelTable';
import { FunnelView } from '../components/FunnelView';
import { JourneyDetail } from '../components/JourneyDetail';
import { JourneyTable } from '../components/JourneyTable';
import { LiveActivity } from '../components/LiveActivity';
import { OverviewCards } from '../components/OverviewCards';
import { QualityPanel } from '../components/QualityPanel';
import { SectionState } from '../components/SectionState';
import { useAcquisitionReports, useJourneyDetail, useJourneyList } from '../hooks/useAcquisitionReports';
import { useLiveAcquisition } from '../hooks/useLiveAcquisition';
import type { Resource } from '../hooks/useReport';
import type { FiltersPatch } from '../types';
import { applyPatch, parseFilters, serializeFilters } from '../utils/filters';

/** Props every report card needs, derived from how its request is going. */
const stateOf = <T,>(resource: Resource<T>) => ({
  isLoading: resource.isLoading,
  hasError: resource.hasError,
  isStale: resource.hasError && resource.data !== null,
  onRetry: resource.refresh,
});

const AcquisitionPage = () => {
  const today = useMemo(() => new Date(), []);
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => parseFilters(searchParams, today), [searchParams, today]);
  const filtersKey = JSON.stringify(filters);

  // Page and open journey belong to the filters they were chosen under; new filters start over.
  const [pageState, setPageState] = useState({ filtersKey, page: 1 });
  const [openState, setOpenState] = useState<{ filtersKey: string; visitId: string | null }>({ filtersKey, visitId: null });
  const page = pageState.filtersKey === filtersKey ? pageState.page : 1;
  const openVisitId = openState.filtersKey === filtersKey ? openState.visitId : null;
  const [liveWindow, setLiveWindow] = useState(15);

  const reports = useAcquisitionReports(filters);
  const journeys = useJourneyList(filters, page);
  const journey = useJourneyDetail(openVisitId);
  const live = useLiveAcquisition(liveWindow);

  const changeFilters = (patch: FiltersPatch) => setSearchParams(serializeFilters(applyPatch(filters, patch)), { replace: true });
  const refreshAll = () => [...Object.values(reports), journeys, live].forEach((resource) => resource.refresh());
  const isRefreshing = [...Object.values(reports), journeys, live].some((resource) => resource.isRefreshing);

  const overview = reports.overview.data;
  const channels = reports.channels.data;
  const funnel = reports.funnel.data;
  const quality = reports.quality.data;
  const journeyList = journeys.data;

  return (
    <main className="space-y-6 pb-8">
      <header>
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">Adquisición y conversión</h1>
        <p className="mt-1 text-sm text-slate-500">
          De dónde llegan las visitas, qué canales generan leads y ventas reales, y qué tan confiables son los datos.
        </p>
      </header>

      <AcquisitionFilters filters={filters} onChange={changeFilters} onRefresh={refreshAll} isRefreshing={isRefreshing} />

      <SectionState
        title="Resumen"
        isEmpty={overview !== null && overview.data.visits === 0 && overview.data.leads === 0 && overview.data.revenue === 0}
        emptyMessage="No hay visitas medibles en este período."
        {...stateOf(reports.overview)}
      >
        {overview && (
          <OverviewCards
            overview={overview.data}
            coverage={overview.coverage}
            reportingMode={overview.reportingMode}
            outcomeWindowDays={overview.outcomeWindowDays}
            outcomesComplete={overview.outcomesComplete}
          />
        )}
      </SectionState>

      <SectionState
        title="Canales"
        isEmpty={channels !== null && channels.data.channels.length === 0}
        emptyMessage="No hay canales con actividad en este período."
        {...stateOf(reports.channels)}
      >
        {channels && <ChannelTable rows={channels.data.channels} unlinked={channels.data.unlinked} isCohort={channels.reportingMode === 'acquisition_cohort'} />}
      </SectionState>

      <SectionState
        title="Embudo"
        isEmpty={funnel !== null && (funnel.data.steps[0]?.visits ?? 0) === 0}
        emptyMessage="No hay visitas para armar el embudo en este período."
        {...stateOf(reports.funnel)}
      >
        {funnel && <FunnelView steps={funnel.data.steps} independentCounts={funnel.data.independentCounts} />}
      </SectionState>

      <SectionState title="Actividad reciente" isEmpty={false} emptyMessage="" {...stateOf(live)}>
        {live.data && <LiveActivity data={live.data.data} windowMinutes={liveWindow} timezone={filters.timezone} onWindowChange={setLiveWindow} />}
      </SectionState>

      <SectionState title="Calidad de datos" isEmpty={false} emptyMessage="" {...stateOf(reports.quality)}>
        {quality && <QualityPanel {...quality.data} timezone={filters.timezone} />}
      </SectionState>

      <SectionState
        title="Recorridos"
        isEmpty={journeyList !== null && journeyList.data.journeys.length === 0}
        emptyMessage="No hay recorridos en este período."
        {...stateOf(journeys)}
      >
        {journeyList && (
          <JourneyTable
            journeys={journeyList.data.journeys}
            pagination={journeyList.pagination}
            timezone={filters.timezone}
            onSelect={(visitId) => setOpenState({ filtersKey, visitId })}
            onPageChange={(nextPage) => setPageState({ filtersKey, page: nextPage })}
          />
        )}
        {openVisitId && journey.isLoading && <p role="status" className="text-sm text-slate-500">Cargando recorrido…</p>}
        {openVisitId && journey.hasError && !journey.data && <p role="alert" className="text-sm text-red-700">No se pudo cargar el recorrido.</p>}
        {openVisitId && journey.data && (
          <JourneyDetail detail={journey.data.data} timezone={filters.timezone} onClose={() => setOpenState({ filtersKey, visitId: null })} />
        )}
      </SectionState>
    </main>
  );
};

export default AcquisitionPage;
