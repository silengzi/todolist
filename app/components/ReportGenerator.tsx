'use client'

import { ReportType } from '@/types/report'

interface ReportGeneratorProps {
  type: ReportType
  startDate: string
  endDate: string
  onTypeChange: (type: ReportType) => void
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onGenerate: () => void
  isGenerating: boolean
  className?: string
}

export function ReportGenerator({
  type,
  startDate,
  endDate,
  onTypeChange,
  onStartDateChange,
  onEndDateChange,
  onGenerate,
  isGenerating,
  className = ''
}: ReportGeneratorProps) {
  const getReportTypeLabel = (type: ReportType) => {
    const labels = {
      DAILY: '日报',
      WEEKLY: '周报',
      MONTHLY: '月报',
      QUARTERLY: '季度报告',
      YEARLY: '年度报告'
    }
    return labels[type]
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <h2 className="text-lg font-medium text-gray-900 mb-4">选择报告类型和日期范围</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">报告类型</label>
          <select
            value={type}
            onChange={(e) => onTypeChange(e.target.value as ReportType)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="DAILY">日报</option>
            <option value="WEEKLY">周报</option>
            <option value="MONTHLY">月报</option>
            <option value="QUARTERLY">季度报告</option>
            <option value="YEARLY">年度报告</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">开始日期</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">结束日期</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? '生成中...' : `生成${getReportTypeLabel(type)}`}
          </button>
        </div>
      </div>
    </div>
  )
}
