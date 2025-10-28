'use client'

import { ReportType } from '@/types/report'

interface ReportTypeSelectorProps {
  value: ReportType
  onChange: (type: ReportType) => void
  className?: string
}

export function ReportTypeSelector({ value, onChange, className = '' }: ReportTypeSelectorProps) {
  const reportTypes = [
    { value: 'DAILY', label: '日报' },
    { value: 'WEEKLY', label: '周报' },
    { value: 'MONTHLY', label: '月报' },
    { value: 'QUARTERLY', label: '季度报告' },
    { value: 'YEARLY', label: '年度报告' }
  ] as const

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">报告类型</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ReportType)}
        className="w-full border border-gray-300 rounded-md px-3 py-2"
      >
        {reportTypes.map(type => (
          <option key={type.value} value={type.value}>
            {type.label}
          </option>
        ))}
      </select>
    </div>
  )
}
