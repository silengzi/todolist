'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Report, ReportType, CreateReportRequest } from '@/types/report'
import { ReportGenerator } from '@/app/components/ReportGenerator'
import { ReportViewer } from '@/app/components/ReportViewer'

export default function GenerateReportPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedReport, setGeneratedReport] = useState<Report | null>(null)
  const [formData, setFormData] = useState<CreateReportRequest>({
    type: 'DAILY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleTypeChange = (type: ReportType) => {
    const today = new Date()
    let startDate = new Date()
    let endDate = new Date()

    switch (type) {
      case 'DAILY':
        // 今天
        break
      case 'WEEKLY':
        // 本周
        startDate.setDate(today.getDate() - today.getDay())
        endDate.setDate(startDate.getDate() + 6)
        break
      case 'MONTHLY':
        // 本月
        startDate.setDate(1)
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0)
        break
      case 'QUARTERLY':
        // 本季度
        const quarter = Math.floor(today.getMonth() / 3)
        startDate = new Date(today.getFullYear(), quarter * 3, 1)
        endDate = new Date(today.getFullYear(), quarter * 3 + 3, 0)
        break
      case 'YEARLY':
        // 本年
        startDate = new Date(today.getFullYear(), 0, 1)
        endDate = new Date(today.getFullYear(), 11, 31)
        break
    }

    setFormData(prev => ({
      ...prev,
      type,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    }))
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const data = await response.json()
        setGeneratedReport(data)
      } else {
        alert('生成报告失败，请重试')
      }
    } catch (error) {
      console.error('生成报告失败:', error)
      alert('生成报告失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!generatedReport) return

    try {
      const response = await fetch('/api/reports/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: generatedReport.id,
          summary: generatedReport.summary,
          content: generatedReport.content
        })
      })

      if (response.ok) {
        alert('报告保存成功！')
        router.push('/dashboard/reports')
      } else {
        alert('保存报告失败，请重试')
      }
    } catch (error) {
      console.error('保存报告失败:', error)
      alert('保存报告失败，请重试')
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
              <h1 className="text-xl font-semibold text-gray-900">生成报告</h1>
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
          {/* 生成表单 */}
          <ReportGenerator
            type={formData.type}
            startDate={formData.startDate}
            endDate={formData.endDate}
            onTypeChange={handleTypeChange}
            onStartDateChange={(date) => setFormData(prev => ({ ...prev, startDate: date }))}
            onEndDateChange={(date) => setFormData(prev => ({ ...prev, endDate: date }))}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
            className="mb-6"
          />

          {/* 生成的报告 */}
          {generatedReport && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  {getReportTypeLabel(generatedReport.type)} - 生成结果
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSave}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    保存报告
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/reports/${generatedReport.id}`)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                  >
                    查看详情
                  </button>
                </div>
              </div>

              <ReportViewer report={generatedReport} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
