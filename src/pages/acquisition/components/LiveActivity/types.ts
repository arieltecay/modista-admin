export interface LiveView {
  activeVisits: number;
  eventsInWindow: number;
  activeByChannel: Array<{ channelGroup: string; count: number }>;
  eventsPerMinute: Array<{ minute: string; count: number }>;
  recentEvents: Array<{ name: string; at: string; visit: string; channelGroup: string | null; path?: string }>;
}

export interface LiveActivityProps {
  data: LiveView;
  windowMinutes: number;
  timezone: string;
  onWindowChange: (minutes: number) => void;
}
