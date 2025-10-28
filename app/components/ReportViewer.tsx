'use client'

import { Report, ReportType } from '@/types/report'

interface ReportViewerProps {
  report: Report
  isEditing?: boolean
  editData?: {
    summary: string
    content: string
  }
  onEditDataChange?: (data: { summary: string; content: string }) => void
  className?: string
}

export function ReportViewer({ 
  report, 
  isEditing = false, 
  editData, 
  onEditDataChange,
  className = '' 
}: ReportViewerProps) {
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
    <div className={`space-y-6 ${className}`}>
      {/* 摘要部分 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">摘要</h3>
        {isEditing && editData && onEditDataChange ? (
          <textarea
            value={editData.summary}
            onChange={(e) => onEditDataChange({ ...editData, summary: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-32"
            placeholder="输入报告摘要..."
          />
        ) : (
          <div className="bg-gray-50 rounded-md p-4">
            {report.summary ? (
              <p className="text-gray-700 whitespace-pre-wrap">{report.summary}</p>
            ) : (
              <p className="text-gray-500 italic">暂无摘要</p>
            )}
          </div>
        )}
      </div>

      {/* 完整内容部分 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">完整报告</h3>
        {isEditing && editData && onEditDataChange ? (
          <textarea
            value={editData.content}
            onChange={(e) => onEditDataChange({ ...editData, content: e.target.value })}
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-96"
            placeholder="输入报告内容..."
          />
        ) : (
          <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
            {report.content ? (
              <pre className="text-gray-700 whitespace-pre-wrap font-mono text-sm">
                {report.content}
              </pre>
            ) : (
              <p className="text-gray-500 italic">暂无内容</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
