"use client";

import { useState } from 'react';
import { backupApi, ExportFormat, ExportType } from '../../services/backupApi';
import { motion } from 'framer-motion';

interface BackupSectionProps {
  title: string;
  exportType: ExportType;
  icon?: string;
}

export default function BackupSection({ title, exportType, icon = '💾' }: BackupSectionProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async (format: ExportFormat) => {
    setIsExporting(true);
    setError(null);

    try {
      const result = await backupApi.exportData(format, exportType);

      if (result.success && result.blob && result.filename) {
        // Create download link
        const url = window.URL.createObjectURL(result.blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError(result.error || 'Export failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface rounded-xl p-5"
    >
      <h3 className="text-xs sm:text-sm font-semibold text-white mb-4 flex items-center gap-2 truncate">
        <span className="text-[15px] shrink-0">{icon}</span>
        <span className="truncate">{title}</span>
      </h3>

      <div className="flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => handleExport('json')}
          disabled={isExporting}
          className="flex-1 min-w-0 px-2 py-2 bg-sky-600/80 hover:bg-sky-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-[11px] leading-tight"
        >
          JSON
        </button>
        <button
          onClick={() => handleExport('excel')}
          disabled={isExporting}
          className="flex-1 min-w-0 px-2 py-2 bg-emerald-600/80 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-[11px] leading-tight"
        >
          Excel
        </button>
        <button
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="flex-1 min-w-0 px-2 py-2 bg-rose-600/80 hover:bg-rose-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 text-[11px] leading-tight"
        >
          PDF
        </button>
      </div>

      {isExporting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-amber-400 text-xs"
        >
          Exporting… please wait
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-3 text-rose-400 text-xs"
        >
          Error: {error}
        </motion.div>
      )}
    </motion.div>
  );
}