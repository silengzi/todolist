'use client'

import { Report, ReportType } from '@/types/report'

interface ReportCardProps {
  report: Report
  onView: (id: string) => void
  onExport: (id: string, format: 'markdown' | 'json') => void
  onDelete: (id: string) => void
}

export function ReportCard({ report, onView, onExport, onDelete }: ReportCardProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {getReportTypeLabel(report.type)}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(report.startDate)} - {formatDate(report.endDate)}
            </span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            报告 #{report.id.slice(-8)}
          </h3>
          {report.summary && (
            <p className="text-gray-600 mb-3 line-clamp-2">
              {report.summary}
            </p>
          )}
          <div className="text-sm text-gray-500">
            创建时间: {formatDate(report.createdAt)}
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={() => onView(report.id)}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            查看详情
          </button>
          <button
            onClick={() => onExport(report.id, 'markdown')}
            className="text-green-600 hover:text-green-800 text-sm"
          >
            导出MD
          </button>
          <button
            onClick={() => onExport(report.id, 'json')}
            className="text-purple-600 hover:text-purple-800 text-sm"
          >
            导出JSON
          </button>
          <button
            onClick={() => onDelete(report.id)}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}
