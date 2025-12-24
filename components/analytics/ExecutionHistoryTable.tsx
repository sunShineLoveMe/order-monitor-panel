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
  Filter,
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
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "error":
        return <XCircle className="w-4 h-4 text-red-400" />;
      case "running":
        return <Play className="w-4 h-4 text-amber-400 animate-pulse" />;
      case "waiting":
        return <Clock className="w-4 h-4 text-slate-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      error: "bg-red-500/20 text-red-400 border-red-500/30",
      running: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      waiting: "bg-slate-500/20 text-slate-400 border-slate-500/30",
    };
    const labels: Record<string, string> = {
      success: "成功",
      error: "失败",
      running: "运行中",
      waiting: "等待",
    };
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
          styles[status] || styles.waiting
        }`}
      >
        {getStatusIcon(status)}
        {labels[status] || status}
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
    <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-xl overflow-hidden">
      {/* 表头和过滤器 */}
      <div className="p-4 border-b border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h3 className="text-lg font-semibold text-white">执行历史明细</h3>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索订单/工作流..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 w-48"
              />
            </div>

            {/* 状态过滤 */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="all">全部状态</option>
              <option value="success">成功</option>
              <option value="error">失败</option>
              <option value="running">运行中</option>
              <option value="waiting">等待</option>
            </select>
          </div>
        </div>
      </div>

      {/* 表格 */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-800/50">
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                订单ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                工作流
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                状态
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400"
                onClick={() => {
                  setSortBy("executionTime");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <span className="flex items-center gap-1">
                  耗时
                  {sortBy === "executionTime" && (
                    sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </span>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider cursor-pointer hover:text-cyan-400"
                onClick={() => {
                  setSortBy("startedAt");
                  setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <span className="flex items-center gap-1">
                  开始时间
                  {sortBy === "startedAt" && (
                    sortOrder === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                  )}
                </span>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                触发方式
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {paginatedExecutions.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                  暂无执行记录
                </td>
              </tr>
            ) : (
              paginatedExecutions.map((exec) => (
                <tr
                  key={exec.id}
                  className="hover:bg-slate-800/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-cyan-400">
                      {exec.orderId || "-"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-white text-sm">{exec.workflowName}</span>
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(exec.status)}</td>
                  <td className="px-4 py-3">
                    <span className="text-slate-300 text-sm font-mono">
                      {formatTime(exec.executionTime)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-400 text-sm">
                      {formatDate(exec.startedAt)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-slate-400 text-sm capitalize">
                      {exec.triggerType}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors">
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
        <div className="px-4 py-3 border-t border-slate-700/50 flex items-center justify-between">
          <span className="text-sm text-slate-400">
            共 {filteredExecutions.length} 条记录，第 {currentPage} / {totalPages} 页
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm text-slate-300 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一页
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm text-slate-300 bg-slate-800 border border-slate-600 rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
