import type React from "react";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Server, Activity, Link as LinkIcon, Clock, Grid3X3, Table as TableIcon, ArrowUpDown } from "lucide-react";
import UptimeBar from "@/components/uptime/UptimeBar";

export type MediaNode = {
  node_id: string;
  node_url: string;
  node_version: string;
  uptime_percent: number;
  total_checks: number;
  successful: number;
  last_checked: string;
};

const API_ENDPOINT = "https://medianode-uptime-api.dakshavalidator.in/uptime-records";

const Index = () => {
  const [nodes, setNodes] = useState<MediaNode[] | null>(null);
  const [isSample, setIsSample] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");
  const [sortField, setSortField] = useState<keyof MediaNode>("uptime_percent");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();

  useEffect(() => {
    document.title = "Media-Node Uptime Tracker by Daksha";

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Track media-node uptime with percentages and status bricks.");

    // Structured data
    const ld = document.createElement("script");
    ld.type = "application/ld+json";
    ld.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Media-Node Uptime Tracker by Daksha",
      applicationCategory: "Utility",
      description: "Monitor media-node uptime and reliability.",
      url: window.location.href,
    });
    document.head.appendChild(ld);
    return () => {
      document.head.removeChild(ld);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchData = async () => {
      try {
        const res = await fetch(API_ENDPOINT, { signal: controller.signal });
        if (!res.ok) throw new Error("Bad status");
        const data: MediaNode[] = await res.json();
        setNodes(data);
        setIsSample(false);
      } catch (e) {
        setNodes([]);
        setIsSample(false);
        toast({
          title: "Failed to load data",
          description: "Couldn't reach API. Please try again later.",
        });
      }
    };
    fetchData();
    return () => controller.abort();
  }, [toast]);

  const sortedNodes = useMemo(() => {
    if (!nodes) return null;
    return [...nodes].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      const modifier = sortDirection === "asc" ? 1 : -1;
      
      if (typeof aVal === "string" && typeof bVal === "string") {
        return aVal.localeCompare(bVal) * modifier;
      }
      return ((aVal as number) - (bVal as number)) * modifier;
    });
  }, [nodes, sortField, sortDirection]);

  const avgUptime = useMemo(() => {
    if (!nodes || nodes.length === 0) return 0;
    return Math.round(nodes.reduce((a, n) => a + n.uptime_percent, 0) / nodes.length);
  }, [nodes]);

  const handleSort = (field: keyof MediaNode) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const handleGlowMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.currentTarget.querySelector('.ambient-glow') as HTMLElement | null;
    if (!el) return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    el.style.setProperty('--x', `${x}px`);
    el.style.setProperty('--y', `${y}px`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-foreground">
      <header onMouseMove={handleGlowMouseMove} className="relative overflow-hidden border-b hero-dark bg-gradient-to-r from-indigo-900/25 via-violet-900/20 to-blue-900/25">
        <div className="ambient-glow" aria-hidden="true" />
        <div className="container py-12 md:py-16">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight bg-gradient-to-r from-violet-400 via-white to-sky-400 bg-clip-text text-transparent">
                 Media-Node Uptime Tracker by Daksha
              </h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Monitor media node uptime and performance.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="uppercase tracking-wide">Avg Uptime: {avgUptime}%</Badge>
              {isSample && <Badge variant="destructive">Sample</Badge>}
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("cards")}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Cards
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="flex items-center gap-2"
            >
              <TableIcon className="h-4 w-4" />
              Table
            </Button>
          </div>
        </div>

        <section aria-labelledby="grid-heading">
          <h2 id="grid-heading" className="sr-only">Media nodes</h2>
          {!nodes ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-lg border bg-card p-6 animate-pulse">
                  <div className="h-5 w-1/2 bg-muted rounded mb-4" />
                  <div className="h-4 w-1/3 bg-muted rounded mb-6" />
                  <div className="h-3 w-full bg-muted rounded mb-3" />
                  <div className="flex gap-1 mt-4">
                    {Array.from({ length: 20 }).map((_, j) => (
                      <div key={j} className="h-3 w-3 rounded bg-muted" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : viewMode === "cards" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedNodes?.map((node) => (
                <article key={node.node_id} className="transition-transform duration-300 hover:-translate-y-1">
                  <Card className="bg-gradient-to-br from-slate-900/70 to-slate-800/50 backdrop-blur supports-[backdrop-filter]:bg-transparent border border-slate-800/60 shadow-sm hover:shadow-lg hover:border-slate-700/80 transition-shadow">
                    <CardHeader className="space-y-1">
                      <CardTitle className="text-lg flex items-center gap-2 text-slate-100">
                        <Server className="h-5 w-5 text-indigo-400" aria-hidden />
                        <a href={node.node_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 hover:underline text-white hover:text-indigo-200">
                          {node.node_url}
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                        </a>
                      </CardTitle>
                      <div className="text-xs text-slate-400 font-mono">
                        {node.node_id}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-slate-200">
                          <Activity className="h-4 w-4 text-slate-200" />
                          <span>{node.successful}/{node.total_checks} successful checks</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{node.node_version}</Badge>
                          <Badge variant={node.uptime_percent >= 95 ? "default" : "destructive"}>
                            {node.uptime_percent}%
                          </Badge>
                        </div>
                      </div>

                      <UptimeBar percent={node.uptime_percent} />
                    </CardContent>
                  </Card>
                </article>
              ))}
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <Table className="text-slate-200">
                <TableHeader>
                  <TableRow>
                    <TableHead className="cursor-pointer hover:bg-slate-800/40 text-slate-300" onClick={() => handleSort('node_url')}>
                      <div className="flex items-center gap-2">
                        Node URL
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-slate-800/40 text-slate-300" onClick={() => handleSort('node_version')}>
                      <div className="flex items-center gap-2">
                        Version
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-slate-800/40 text-center text-slate-300" onClick={() => handleSort('uptime_percent')}>
                      <div className="flex items-center justify-center gap-2">
                        Uptime
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="cursor-pointer hover:bg-slate-800/40 text-slate-300" onClick={() => handleSort('last_checked')}>
                      <div className="flex items-center gap-2">
                        Last Checked
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedNodes?.map((node) => (
                    <TableRow key={node.node_id} className="hover:bg-slate-800/40">
                      <TableCell>
                        <a 
                          href={node.node_url} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center gap-2 hover:underline text-white hover:text-indigo-200"
                        >
                          {node.node_url}
                          <LinkIcon className="h-3 w-3" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{node.node_version}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-3">
                          <Badge variant={node.uptime_percent >= 95 ? "default" : "destructive"}>
                            {node.uptime_percent}%
                          </Badge>
                          <div className="w-24">
                            <UptimeBar percent={node.uptime_percent} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-400">
                          {new Date(node.last_checked).toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={node.uptime_percent >= 95 ? "default" : "destructive"} className="text-xs">
                          {node.uptime_percent >= 95 ? "Online" : "Offline"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
