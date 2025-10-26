'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Todo, Category, TodoFilters, TodoStats, CategoryStats } from '@/types/todo'
import { TodoItem } from '../components/TodoItem'
import { TodoForm } from '../components/TodoForm'
import { FilterBar } from '../components/FilterBar'
import { StatsCard, CategoryStatsCard } from '../components/StatsCard'

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  
  const [todos, setTodos] = useState<Todo[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<TodoStats | null>(null)
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([])
  const [filters, setFilters] = useState<TodoFilters>({ page: 1, limit: 20 })
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user, filters])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [todosRes, categoriesRes, statsRes, categoryStatsRes] = await Promise.all([
        fetch(`/api/todos?${new URLSearchParams(filters as any).toString()}`),
        fetch('/api/categories'),
        fetch('/api/stats/overview'),
        fetch('/api/stats/categories'),
      ])

      if (todosRes.ok) {
        const todosData = await todosRes.json()
        setTodos(todosData.todos)
        setPagination(todosData.pagination)
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)
      }

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (categoryStatsRes.ok) {
        const categoryStatsData = await categoryStatsRes.json()
        setCategoryStats(categoryStatsData)
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTodo = async (todoData: any) => {
    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData),
      })

      if (response.ok) {
        const newTodo = await response.json()
        setTodos(prev => [newTodo, ...prev])
        setShowAddForm(false)
        loadData() // 重新加载统计数据
      }
    } catch (error) {
      console.error('添加待办事项失败:', error)
    }
  }

  const handleToggleTodo = async (id: string) => {
    try {
      const response = await fetch(`/api/todos/${id}/toggle`, {
        method: 'PATCH',
      })

      if (response.ok) {
        const updatedTodo = await response.json()
        setTodos(prev => prev.map(todo => todo.id === id ? updatedTodo : todo))
        loadData() // 重新加载统计数据
      }
    } catch (error) {
      console.error('切换待办事项状态失败:', error)
    }
  }

  const handleEditTodo = (updatedTodo: Todo) => {
    setTodos(prev => prev.map(todo => todo.id === updatedTodo.id ? updatedTodo : todo))
  }

  const handleDeleteTodo = async (id: string) => {
    if (!confirm('确定要删除这个待办事项吗？')) return

    try {
      const response = await fetch(`/api/todos/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setTodos(prev => prev.filter(todo => todo.id !== id))
        loadData() // 重新加载统计数据
      }
    } catch (error) {
      console.error('删除待办事项失败:', error)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
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
              <h1 className="text-xl font-semibold text-gray-900">TodoList 仪表板</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">欢迎，{user.name}</span>
              <button
                onClick={() => router.push('/dashboard/categories')}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                分类管理
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                注销
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 统计卡片 */}
          {stats && (
            <StatsCard stats={stats} categoryStats={categoryStats} />
          )}

          {/* 分类统计 */}
          {categoryStats.length > 0 && (
            <div className="mb-6">
              <CategoryStatsCard categoryStats={categoryStats} />
            </div>
          )}

          {/* 快速添加 */}
          <div className="mb-6">
            {showAddForm ? (
              <TodoForm
                categories={categories}
                onSubmit={handleAddTodo}
                onCancel={() => setShowAddForm(false)}
              />
            ) : (
              <button
                onClick={() => setShowAddForm(true)}
                className="w-full bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                <div className="flex items-center justify-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  点击添加新的待办事项
                </div>
              </button>
            )}
          </div>

          {/* 筛选栏 */}
          <div className="mb-6">
            <FilterBar
              categories={categories}
              filters={filters}
              onFiltersChange={setFilters}
            />
          </div>

          {/* 待办事项列表 */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">加载中...</div>
              </div>
            ) : todos.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">暂无待办事项</div>
              </div>
            ) : (
              todos.map(todo => (
                <TodoItem
                  key={todo.id}
                  todo={todo}
                  categories={categories}
                  onToggle={handleToggleTodo}
                  onEdit={handleEditTodo}
                  onDelete={handleDeleteTodo}
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
