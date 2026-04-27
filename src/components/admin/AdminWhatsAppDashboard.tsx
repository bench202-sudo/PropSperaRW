import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import {
  RefreshIcon, SearchIcon, TrendingUpIcon,
  ChevronLeftIcon, ChevronRightIcon, DownloadIcon,
} from '@/components/icons/Icons';

// ── Types ─────────────────────────────────────────────────────────────────────

interface WhatsAppClick {
  id: string;
  property_id: string;
  property_title: string | null;
  agent_id: string | null;
  clicked_at: string;
  user_identifier: string | null;
  source: string | null;
}

type SortField = 'clicked_at' | 'property_title';
type SortDir = 'asc' | 'desc';

const PAGE_SIZE = 10;

// ── Component ─────────────────────────────────────────────────────────────────

const AdminWhatsAppDashboard: React.FC = () => {
  const [clicks, setClicks] = useState<WhatsAppClick[]>([]);
  const [agentNames, setAgentNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('clicked_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchClicks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('whatsapp_clicks')
        .select('*')
        .order('clicked_at', { ascending: false });

      if (fetchError) {
        // Surface the actual Supabase error (e.g. "relation does not exist" means migration not yet run)
        setError(`Failed to load WhatsApp click data: ${fetchError.message}`);
        return;
      }

      const rows = data ?? [];
      setClicks(rows);

      // Resolve agent names for all unique agent IDs in this result set
      const uniqueAgentIds = [...new Set(rows.map((r) => r.agent_id).filter(Boolean))] as string[];
      if (uniqueAgentIds.length > 0) {
        const { data: agentData } = await supabase
          .from('agents')
          .select('id, user:user_id(full_name)')
          .in('id', uniqueAgentIds);

        if (agentData) {
          const nameMap: Record<string, string> = {};
          agentData.forEach((a: any) => {
            nameMap[a.id] = a.user?.full_name ?? a.id;
          });
          setAgentNames(nameMap);
        }
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClicks();
  }, [fetchClicks]);

  // ── Stats ──────────────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const total = clicks.length;

    const today = new Date().toISOString().split('T')[0];
    const todayCount = clicks.filter(
      (c) => c.clicked_at && new Date(c.clicked_at).toISOString().split('T')[0] === today
    ).length;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekCount = clicks.filter(
      (c) => c.clicked_at && new Date(c.clicked_at) >= weekAgo
    ).length;

    // Top property by click count
    const countByProperty: Record<string, { title: string; count: number }> = {};
    clicks.forEach((c) => {
      const key = c.property_id;
      if (!countByProperty[key]) {
        countByProperty[key] = { title: c.property_title ?? c.property_id, count: 0 };
      }
      countByProperty[key].count++;
    });
    const topProperty = Object.values(countByProperty).sort((a, b) => b.count - a.count)[0];

    return { total, todayCount, weekCount, topProperty };
  }, [clicks]);

  // ── Filtered & sorted list ─────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let result = [...clicks];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (c) =>
          (c.property_title && c.property_title.toLowerCase().includes(q)) ||
          (c.agent_id && c.agent_id.toLowerCase().includes(q)) ||
          (c.property_id && c.property_id.toLowerCase().includes(q))
      );
    }

    result.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';
      if (sortField === 'clicked_at') {
        valA = new Date(a.clicked_at ?? '').getTime();
        valB = new Date(b.clicked_at ?? '').getTime();
      } else {
        valA = (a.property_title ?? '').toLowerCase();
        valB = (b.property_title ?? '').toLowerCase();
      }
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [clicks, searchQuery, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ── Helpers ────────────────────────────────────────────────────────────────

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleExportCSV = () => {
    const headers = ['Date / Time', 'Property Title', 'Property ID', 'Agent Name', 'Agent ID', 'Session ID', 'Source'];
    const rows = filtered.map((c) => [
      c.clicked_at ? new Date(c.clicked_at).toLocaleString() : '',
      c.property_title ?? '',
      c.property_id,
      c.agent_id ? (agentNames[c.agent_id] ?? c.agent_id) : '',
      c.agent_id ?? '',
      c.user_identifier ?? '',
      c.source ?? 'web',
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `whatsapp-clicks-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const SortIcon = ({ field }: { field: SortField }) =>
    sortField === field ? (
      <span className="ml-1 text-blue-500">{sortDir === 'asc' ? '↑' : '↓'}</span>
    ) : (
      <span className="ml-1 text-gray-300">↕</span>
    );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="p-5 space-y-5">
      {/* Disclaimer banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-start gap-2">
        <svg className="shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <span>
          <strong>Click tracking only.</strong> These events record when a buyer tapped the WhatsApp contact button — not whether a message was actually sent or received.
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-red-600 text-lg leading-none">×</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Total Clicks</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Today</p>
          <p className="text-2xl font-bold text-emerald-600">{stats.todayCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Last 7 Days</p>
          <p className="text-2xl font-bold text-blue-600">{stats.weekCount}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUpIcon size={13} className="text-purple-500" />
            <p className="text-xs text-gray-500 uppercase tracking-wide">Top Property</p>
          </div>
          {stats.topProperty ? (
            <>
              <p className="text-sm font-semibold text-gray-900 truncate">{stats.topProperty.title}</p>
              <p className="text-xs text-gray-400">{stats.topProperty.count} click{stats.topProperty.count !== 1 ? 's' : ''}</p>
            </>
          ) : (
            <p className="text-sm text-gray-400">—</p>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <SearchIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search property or agent…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={fetchClicks}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          <RefreshIcon size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
        <button
          onClick={handleExportCSV}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors disabled:opacity-50 whitespace-nowrap"
        >
          <DownloadIcon size={16} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
        </div>
      ) : paginated.length === 0 ? (
        <div className="text-center py-16">
          <svg className="mx-auto mb-3 text-gray-300" width="48" height="48" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <p className="text-gray-500 font-medium">No WhatsApp clicks recorded yet</p>
          <p className="text-gray-400 text-sm mt-1">Clicks will appear here when buyers tap the WhatsApp button on a property page.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700"
                    onClick={() => toggleSort('clicked_at')}
                  >
                    Date / Time <SortIcon field="clicked_at" />
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-gray-700"
                    onClick={() => toggleSort('property_title')}
                  >
                    Property <SortIcon field="property_title" />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Agent
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Session
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Source
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginated.map((click) => (
                  <tr key={click.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700 whitespace-nowrap">
                      <span title={click.clicked_at ? new Date(click.clicked_at).toLocaleString() : ''}>
                        {click.clicked_at ? formatTimeAgo(click.clicked_at) : '—'}
                      </span>
                      <br />
                      <span className="text-xs text-gray-400">
                        {click.clicked_at
                          ? new Date(click.clicked_at).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric',
                            })
                          : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-gray-900 line-clamp-2">
                        {click.property_title ?? (
                          <span className="text-gray-400 italic text-xs">{click.property_id}</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {click.agent_id ? (
                        <span className="text-gray-800 font-medium" title={click.agent_id}>
                          {agentNames[click.agent_id] ?? (
                            <span className="text-gray-400 font-mono text-xs">{click.agent_id.slice(0, 8)}…</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs font-mono">
                      {click.user_identifier ? (
                        <span className="truncate block max-w-[100px]" title={click.user_identifier}>
                          {click.user_identifier.slice(0, 8)}…
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                        {click.source ?? 'web'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-500">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeftIcon size={16} />
                </button>
                <span className="text-gray-700 font-medium">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronRightIcon size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminWhatsAppDashboard;
