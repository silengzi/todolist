'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState, use } from 'react'
import { Report, ReportType, SaveReportRequest } from '@/types/report'
import { ReportViewer } from '@/app/components/ReportViewer'

interface ReportDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ReportDetailPage({ params }: ReportDetailPageProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const resolvedParams = use(params)
  
  const [report, setReport] = useState<Report | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<SaveReportRequest>({
    id: resolvedParams.id,
    summary: '',
    content: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user && resolvedParams.id) {
      loadReport()
    }
  }, [user, resolvedParams.id])

  const loadReport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/reports/${resolvedParams.id}`)
      if (response.ok) {
        const data = await response.json()
        setReport(data)
        setEditData({
          id: data.id,
          summary: data.summary || '',
          content: data.content || ''
        })
      } else if (response.status === 404) {
        alert('报告不存在')
        router.push('/dashboard/reports')
      }
    } catch (error) {
      console.error('加载报告失败:', error)
      alert('加载报告失败')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/reports/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData)
      })

      if (response.ok) {
        const updatedReport = await response.json()
        setReport(updatedReport)
        setIsEditing(false)
        alert('报告保存成功！')
      } else {
        alert('保存报告失败，请重试')
      }
    } catch (error) {
      console.error('保存报告失败:', error)
      alert('保存报告失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExport = async (format: 'markdown' | 'json') => {
    try {
      const response = await fetch(`/api/reports/export?id=${resolvedParams.id}&format=${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `report-${resolvedParams.id}.${format === 'markdown' ? 'md' : 'json'}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error('导出报告失败:', error)
    }
  }

  const handleDelete = async () => {
    if (!confirm('确定要删除这个报告吗？此操作不可撤销。')) return

    try {
      const response = await fetch(`/api/reports/${resolvedParams.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        alert('报告删除成功！')
        router.push('/dashboard/reports')
      } else {
        alert('删除报告失败，请重试')
      }
    } catch (error) {
      console.error('删除报告失败:', error)
      alert('删除报告失败，请重试')
    }
  }

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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-500">报告不存在</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">报告详情</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard/reports')}
                className="text-gray-600 hover:text-gray-900"
              >
                返回报告列表
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 报告头部信息 */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getReportTypeLabel(report.type)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDate(report.startDate)} - {formatDate(report.endDate)}
                  </span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  报告 #{report.id.slice(-8)}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  创建时间: {formatDate(report.createdAt)}
                  {report.updatedAt !== report.createdAt && (
                    <span> | 更新时间: {formatDate(report.updatedAt)}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  {isEditing ? '取消编辑' : '编辑报告'}
                </button>
                <button
                  onClick={() => handleExport('markdown')}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                >
                  导出MD
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  导出JSON
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                >
                  删除
                </button>
              </div>
            </div>
          </div>

          {/* 摘要部分 */}
          <ReportViewer
            report={report}
            isEditing={isEditing}
            editData={editData ? {
              summary: editData.summary || '',
              content: editData.content || ''
            } : undefined}
            onEditDataChange={(data) => setEditData(prev => ({ ...prev, ...data }))}
          />

          {/* 保存按钮 */}
          {isEditing && (
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? '保存中...' : '保存更改'}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
