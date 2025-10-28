'use client'

import { ReportType } from '@/types/report'

interface ReportFiltersProps {
  type?: ReportType
  onTypeChange: (type: ReportType | undefined) => void
  className?: string
}

export function ReportFilters({ type, onTypeChange, className = '' }: ReportFiltersProps) {
  const reportTypes = [
    { value: '', label: '全部类型' },
    { value: 'DAILY', label: '日报' },
    { value: 'WEEKLY', label: '周报' },
    { value: 'MONTHLY', label: '月报' },
    { value: 'QUARTERLY', label: '季度报告' },
    { value: 'YEARLY', label: '年度报告' }
  ]

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex items-center space-x-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">报告类型</label>
          <select
            value={type || ''}
            onChange={(e) => onTypeChange(e.target.value as ReportType || undefined)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            {reportTypes.map(typeOption => (
              <option key={typeOption.value} value={typeOption.value}>
                {typeOption.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
