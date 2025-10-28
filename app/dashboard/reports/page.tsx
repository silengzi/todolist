'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import { Report, ReportFilters } from '@/types/report'
import { ReportCard } from '@/app/components/ReportCard'
import { ReportFilters as ReportFiltersComponent } from '@/app/components/ReportFilters'

export default function ReportsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [reports, setReports] = useState<Report[]>([])
  const [filters, setFilters] = useState<ReportFilters>({ page: 1, limit: 20 })
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [isLoading, setIsLoading] = useState(false)

  const loadReports = useCallback(async () => {
    setIsLoading(true)
    try {
      const queryParams = new URLSearchParams()
      if (filters.type) queryParams.append('type', filters.type)
      if (filters.page) queryParams.append('page', filters.page.toString())
      if (filters.limit) queryParams.append('limit', filters.limit.toString())

      const response = await fetch(`/api/reports?${queryParams.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setReports(data.reports)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('加载报告失败:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filters])

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadReports()
    }
  }, [user, filters, loadReports])

  const handleDeleteReport = async (id: string) => {
    if (!confirm('确定要删除这个报告吗？')) return

    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setReports(prev => prev.filter(report => report.id !== id))
      }
    } catch (error) {
      console.error('删除报告失败:', error)
    }
  }

  const handleExportReport = async (id: string, format: 'markdown' | 'json') => {
    try {
      const response = await fetch(`/api/reports/export?id=${id}&format=${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `report-${id}.${format === 'markdown' ? 'md' : 'json'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('导出报告失败:', error)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">报告管理</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                返回仪表板
              </button>
              <button
                onClick={() => router.push('/dashboard/reports/generate')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                生成新报告
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 筛选栏 */}
          <div className="mb-6">
            <ReportFiltersComponent
              type={filters.type}
              onTypeChange={(type) => setFilters(prev => ({ ...prev, type, page: 1 }))}
            />
          </div>

          {/* 报告列表 */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">加载中...</div>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">暂无报告</div>
                <button
                  onClick={() => router.push('/dashboard/reports/generate')}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  生成第一个报告
                </button>
              </div>
            ) : (
              reports.map(report => (
                <ReportCard
                  key={report.id}
                  report={report}
                  onView={(id) => router.push(`/dashboard/reports/${id}`)}
                  onExport={handleExportReport}
                  onDelete={handleDeleteReport}
                />
              ))
            )}
          </div>

          {/* 分页 */}
          {pagination.pages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex gap-2">
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page! - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  上一页
                </button>
                <span className="px-3 py-2 text-sm text-gray-700">
                  第 {pagination.page} 页，共 {pagination.pages} 页
                </span>
                <button
                  onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.pages, prev.page! + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-3 py-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  下一页
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
