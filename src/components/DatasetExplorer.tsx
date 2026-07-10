'use client';

import React, { useState, useMemo } from 'react';
import { Dataset, DatasetColumn } from '../types';
import { PRESET_DATASETS, buildDataset } from '../data/presets';
import { Upload, FileText, CheckCircle2, AlertTriangle, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface DatasetExplorerProps {
  selectedDataset: Dataset;
  onDatasetSelect: (dataset: Dataset) => void;
}

export default function DatasetExplorer({
  selectedDataset,
  onDatasetSelect,
}: DatasetExplorerProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedColumnName, setSelectedColumnName] = useState<string>('');

  const rowsPerPage = 8;

  // Handle Preset select
  const handlePresetSelect = (id: string) => {
    const dataset = PRESET_DATASETS.find(d => d.id === id);
    if (dataset) {
      onDatasetSelect(dataset);
      setCurrentPage(1);
      setSearchQuery('');
      setSelectedColumnName('');
      setUploadError(null);
    }
  };

  // Custom CSV parser
  const parseCSV = (text: string, fileName: string): Dataset => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) {
      throw new Error('CSV must contain a header row and at least one data row.');
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = lines.slice(1).map((line) => {
      const values = line.split(',').map(v => v.trim().replace(/^["']|["']$/g, ''));
      const obj: Record<string, string | number> = {};
      headers.forEach((header, index) => {
        const val = values[index];
        const numVal = Number(val);
        obj[header] = !isNaN(numVal) && val !== '' ? numVal : val;
      });
      return obj;
    });

    const targetColumn = headers[headers.length - 1];

    return buildDataset(
      `upload_${Date.now()}`,
      fileName.replace('.csv', ''),
      `User-uploaded dataset with ${rows.length} records and ${headers.length} attributes.`,
      targetColumn,
      rows
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadError('Only CSV files are supported.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const dataset = parseCSV(text, file.name);
        dataset.source = 'upload';
        onDatasetSelect(dataset);
        setCurrentPage(1);
        setSearchQuery('');
        setSelectedColumnName('');
        setUploadError(null);
      } catch (err: any) {
        setUploadError(err.message || 'Error parsing CSV file.');
      }
    };
    reader.readAsText(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  // Filter rows
  const filteredRows = useMemo(() => {
    if (!searchQuery) return selectedDataset.rows;
    return selectedDataset.rows.filter((row) => {
      return Object.values(row).some(
        (val) => String(val).toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [selectedDataset, searchQuery]);

  // Paginated rows
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRows.slice(start, start + rowsPerPage);
  }, [filteredRows, currentPage]);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;

  // Selected column for statistics
  const currentColumn = useMemo(() => {
    const colName = selectedColumnName || selectedDataset.columns[0]?.name;
    return selectedDataset.columns.find(c => c.name === colName);
  }, [selectedDataset, selectedColumnName]);

  const distributionChartData = useMemo(() => {
    if (!currentColumn?.stats?.distribution) return [];
    return currentColumn.stats.distribution.map((bin) => ({
      range: `${bin.binStart.toFixed(1)} - ${bin.binEnd.toFixed(1)}`,
      count: bin.count,
    }));
  }, [currentColumn]);

  return (
    <div className="space-y-6">
      {/* Top Section: Dataset Selection & Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Presets Select */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-cyan-400" />
              Presets Registry
            </h3>
            <div className="space-y-3">
              {PRESET_DATASETS.map((preset) => {
                const isSelected = selectedDataset.id === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset.id)}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 relative overflow-hidden group ${
                      isSelected
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 shadow-[0_0_15px_rgba(0,243,255,0.02)]'
                        : 'bg-black/30 border-white/5 text-slate-400 hover:border-cyan-500/20 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-bold text-xs uppercase tracking-wide flex items-center justify-between">
                      {preset.name}
                      {isSelected && <CheckCircle2 className="h-4 w-4 text-cyan-400 shrink-0" />}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/5 text-[10px] text-slate-500 font-mono">
            Selected target: <span className="text-cyan-400 font-bold">{selectedDataset.targetColumn}</span>
          </div>
        </div>

        {/* File Drag and Drop Upload */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
          <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
            <Upload className="h-4.5 w-4.5 text-purple-400" />
            Upload Custom Matrix
          </h3>

          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 relative overflow-hidden ${
              dragActive
                ? 'border-cyan-400 bg-cyan-950/20'
                : 'border-white/5 hover:border-cyan-500/20 bg-black/20'
            }`}
          >
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="text-center p-4">
              <Upload className="h-8 w-8 text-slate-600 mx-auto mb-2 animate-bounce" />
              <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">Drag & drop your CSV file here</p>
              <p className="text-[10px] text-slate-500 mt-1 font-mono">Matrix size limit: 5MB</p>
            </div>
          </div>

          {uploadError && (
            <div className="mt-3 flex items-center gap-2 text-xs text-rose-400 bg-rose-950/20 border border-rose-500/20 p-2.5 rounded-xl">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}

          {selectedDataset.source === 'upload' && !uploadError && (
            <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/20 border border-emerald-500/20 p-2.5 rounded-xl">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Loaded user dataset: <strong>{selectedDataset.name}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Middle Section: Preview & Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Grid Table */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
                Grid Records
                <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/30 border border-cyan-500/10 px-2 py-0.5 rounded-md">
                  {filteredRows.length} Rows
                </span>
              </h3>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter grid rows..."
                className="text-xs bg-black/40 border border-white/5 rounded-xl px-3 py-2.5 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 w-full sm:w-60 transition-all"
              />
            </div>

            <div className="overflow-x-auto border border-white/5 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-black/50 border-b border-white/5 text-slate-500 font-mono text-[9px] uppercase tracking-wider">
                    {selectedDataset.columns.map((col) => (
                      <th key={col.name} className="p-3.5 font-semibold">
                        {col.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedRows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-cyan-500/5 transition-all text-slate-300">
                      {selectedDataset.columns.map((col) => (
                        <td key={col.name} className="p-3.5 font-mono">
                          {col.name === selectedDataset.targetColumn ? (
                            <span className="bg-purple-950/20 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                              {String(row[col.name])}
                            </span>
                          ) : (
                            String(row[col.name])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {paginatedRows.length === 0 && (
                    <tr>
                      <td colSpan={selectedDataset.columns.length} className="text-center p-6 text-slate-500 font-mono">
                        No matches found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5 text-xs font-mono text-slate-500">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(c => Math.max(1, c - 1))}
                className="px-3.5 py-2 rounded-xl border border-white/5 hover:border-cyan-500/30 hover:text-cyan-300 disabled:opacity-30 disabled:hover:border-white/5 disabled:hover:text-slate-500 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(c => Math.min(totalPages, c + 1))}
                className="px-3.5 py-2 rounded-xl border border-white/5 hover:border-cyan-500/30 hover:text-cyan-300 disabled:opacity-30 disabled:hover:border-white/5 disabled:hover:text-slate-500 transition-all cursor-pointer disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Statistical Insights & Distribution */}
        <div className="lg:col-span-1 glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-500 flex items-center gap-2">
              <BarChart2 className="h-4.5 w-4.5 text-cyan-400" />
              Feature Insights
            </h3>

            <div>
              <label className="text-[9px] uppercase font-mono tracking-wider text-slate-600 mb-1.5 block">Select Feature Attribute</label>
              <select
                value={selectedColumnName || selectedDataset.columns[0]?.name || ''}
                onChange={(e) => setSelectedColumnName(e.target.value)}
                className="w-full text-xs bg-black/40 border border-white/5 rounded-xl p-2.5 text-slate-300 focus:outline-none focus:border-cyan-500/50"
              >
                {selectedDataset.columns
                  .filter(c => c.name !== selectedDataset.targetColumn)
                  .map((col) => (
                    <option key={col.name} value={col.name}>
                      {col.name} ({col.type})
                    </option>
                  ))}
              </select>
            </div>

            {currentColumn?.stats ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                    <div className="text-slate-600 text-[9px] uppercase">Min / Max</div>
                    <div className="text-slate-200 mt-1 font-bold">{currentColumn.stats.min.toFixed(2)} / {currentColumn.stats.max.toFixed(2)}</div>
                  </div>
                  <div className="bg-black/20 p-2.5 rounded-lg border border-white/5">
                    <div className="text-slate-600 text-[9px] uppercase">Mean Avg</div>
                    <div className="text-slate-200 mt-1 font-bold">{currentColumn.stats.mean.toFixed(2)}</div>
                  </div>
                  <div className="bg-black/20 p-2.5 rounded-lg border border-white/5 col-span-2">
                    <div className="text-slate-600 text-[9px] uppercase">Std Deviation</div>
                    <div className="text-slate-200 mt-1 font-bold">{currentColumn.stats.stdDev.toFixed(4)}</div>
                  </div>
                </div>

                {/* Distribution Plot */}
                <div className="h-44 bg-black/30 rounded-xl border border-white/5 p-3 flex flex-col justify-between">
                  <div className="text-[9px] uppercase font-mono text-slate-600 mb-2">Value Distribution</div>
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={distributionChartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                        <XAxis dataKey="range" tick={{ fill: '#4b5563', fontSize: 8 }} />
                        <YAxis tick={{ fill: '#4b5563', fontSize: 8 }} />
                        <Tooltip 
                          contentStyle={{ background: '#070710', border: '1px solid rgba(0, 243, 255, 0.15)', borderRadius: '8px', fontSize: 10 }}
                        />
                        <Bar dataKey="count" fill="url(#cyanGlowGrad)" radius={[4, 4, 0, 0]} />
                        <defs>
                          <linearGradient id="cyanGlowGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#00f3ff" stopOpacity={0.8}/>
                            <stop offset="100%" stopColor="#00f3ff" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-60 flex flex-col justify-center items-center text-center p-6 border border-dashed border-white/5 rounded-xl bg-black/20 text-slate-500 text-xs">
                <AlertTriangle className="h-6 w-6 text-slate-600 mb-2 animate-pulse" />
                <p>Selected attribute is categorical or stats are unavailable.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
