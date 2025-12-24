"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Search,
} from "lucide-react";
import { N8nExecution } from "@/lib/types";

interface Props {
  executions: N8nExecution[];
}

export default function ExecutionHistoryTable({ executions }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"startedAt" | "executionTime">("startedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const formatTime = (ms: number | undefined) => {
    if (!ms) return "-";
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(2)}s`;
    return `${(ms / 60000).toFixed(2)}m`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    return date.toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "running":
        return <Play className="w-4 h-4 text-cyan-400 animate-pulse" />;
      case "waiting":
        return <Clock className="w-4 h-4 text-slate-500" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      error: "bg-red-500/10 text-red-400 border-red-500/20",
      running: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      waiting: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    };
    const labels: Record<string, string> = {
      success: "SUCCESS",
      error: "ERROR",
      running: "RUNNING",
      waiting: "WAITING",
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black border transition-all duration-300 overflow-hidden relative group/badge ${
          styles[status] || styles.waiting
        }`}
      >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/badge:opacity-100 transition-opacity" />
        {getStatusIcon(status)}
        <span className="relative z-10">{labels[status] || status}</span>
      </span>
    );
  };

  // 过滤和排序
  const filteredExecutions = executions
    .filter((exec) => {
      const matchesSearch =
        exec.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exec.workflowName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exec.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || exec.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = sortBy === "startedAt" ? new Date(a.startedAt).getTime() : (a.executionTime || 0);
      const bVal = sortBy === "startedAt" ? new Date(b.startedAt).getTime() : (b.executionTime || 0);
      return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
    });

  // 分页
  const totalPages = Math.ceil(filteredExecutions.length / pageSize);
  const paginatedExecutions = filteredExecutions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden shadow-2xl animate-slide-up">
      {/* 表头和过滤器 */}
      <div className="p-6 border-b border-slate-700/50 bg-slate-800/20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-6 bg-cyan-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
            <h3 className="text-xl font-black text-white tracking-tight uppercase">执行历史明细</h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* 搜索框 */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                placeholder="Search Orders/Workflows..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-slate-950/50 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all w-64 uppercase tracking-tighter shadow-inner"
              />
            </div>

            {/* 状态过滤 */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-950/50 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all uppercase tracking-tighter"
            >
              <option value="all">ALL STATUS</option>
              <option value="success">SUCCESS</option>
              <option value="error">ERROR</option>
              <option value="running">RUNNING</option>
              <option value="waiting">WAITING</option>
            </select>
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-950/30">
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                Order ID
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                Workflow
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                Status
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-[0.2em] cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => {
                  setSortBy("executionTime");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <span className="flex items-center gap-1.5">
                  Duration
                  {sortBy === "executionTime" && (
                    sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </span>
              </th>
              <th
                className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-[0.2em] cursor-pointer hover:text-cyan-400 transition-colors"
                onClick={() => {
                  setSortBy("startedAt");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <span className="flex items-center gap-1.5">
                  Timestamp
                  {sortBy === "startedAt" && (
                    sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </span>
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                Trigger
              </th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-[0.2em]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {paginatedExecutions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-slate-600 bg-slate-900/10 tracking-[0.3em] text-[10px] uppercase font-black">
                  No Execution Records Found
                </td>
              </tr>
            ) : (
              paginatedExecutions.map((exec, idx) => (
                <tr
                  key={exec.id}
                  className="hover:bg-cyan-500/5 transition-colors group animate-fade-in"
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  <td className="px-6 py-4">
                    <span className="font-mono text-xs font-bold text-cyan-500 group-hover:text-cyan-400 transition-colors">
                      {exec.orderId || "UNRESTRICTED"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white text-sm font-bold tracking-tight group-hover:translate-x-1 transition-transform inline-block">{exec.workflowName}</span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(exec.status)}</td>
                  <td className="px-6 py-4">
                    <span className="text-slate-400 text-xs font-mono font-bold">
                      {formatTime(exec.executionTime)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-500 text-xs font-mono">
                      {formatDate(exec.startedAt)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">
                      {exec.triggerType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 text-slate-600 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all border border-transparent hover:border-cyan-500/30">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-slate-700/50 flex items-center justify-between bg-slate-950/20">
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
            Page {currentPage} of {totalPages} — Total {filteredExecutions.length} Records
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
