'use client'

import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Category } from '../../../types/todo'

export default function CategoriesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      loadCategories()
    }
  }, [user])

  const loadCategories = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error('加载分类失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCategory = async (categoryData: {
    name: string
    color: string
    description?: string
  }) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      })

      if (response.ok) {
        const newCategory = await response.json()
        setCategories(prev => [newCategory, ...prev])
        setShowAddForm(false)
      } else {
        const error = await response.json()
        alert(error.error || '创建分类失败')
      }
    } catch (error) {
      console.error('创建分类失败:', error)
      alert('创建分类失败')
    }
  }

  const handleEditCategory = async (id: string, categoryData: {
    name?: string
    color?: string
    description?: string
  }) => {
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      })

      if (response.ok) {
        const updatedCategory = await response.json()
        setCategories(prev => prev.map(cat => cat.id === id ? updatedCategory : cat))
        setEditingCategory(null)
      } else {
        const error = await response.json()
        alert(error.error || '更新分类失败')
      }
    } catch (error) {
      console.error('更新分类失败:', error)
      alert('更新分类失败')
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('确定要删除这个分类吗？删除后该分类下的待办事项将变为未分类状态。')) return

    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCategories(prev => prev.filter(cat => cat.id !== id))
      } else {
        const error = await response.json()
        alert(error.error || '删除分类失败')
      }
    } catch (error) {
      console.error('删除分类失败:', error)
      alert('删除分类失败')
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
              <button
                onClick={() => router.push('/dashboard')}
                className="mr-4 text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">分类管理</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">欢迎，{user.name}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* 添加分类表单 */}
          <div className="mb-6">
            {showAddForm ? (
              <CategoryForm
                onSubmit={handleAddCategory}
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
                  点击添加新的分类
                </div>
              </button>
            )}
          </div>

          {/* 分类列表 */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-500">加载中...</div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-500">暂无分类</div>
              </div>
            ) : (
              categories.map(category => (
                <CategoryItem
                  key={category.id}
                  category={category}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

interface CategoryFormProps {
  onSubmit: (data: { name: string; color: string; description?: string }) => void
  onCancel?: () => void
  initialData?: Category
}

function CategoryForm({ onSubmit, onCancel, initialData }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [color, setColor] = useState(initialData?.color || '#3B82F6')
  const [description, setDescription] = useState(initialData?.description || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSubmit({
      name: name.trim(),
      color,
      description: description.trim() || undefined,
    })

    if (!initialData) {
      setName('')
      setColor('#3B82F6')
      setDescription('')
    }
  }

  const predefinedColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
    '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
  ]

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="space-y-3">
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="分类名称 *"
            required
          />
        </div>

        <div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="描述（可选）"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">颜色</label>
          <div className="flex gap-2 flex-wrap">
            {predefinedColors.map(colorOption => (
              <button
                key={colorOption}
                type="button"
                onClick={() => setColor(colorOption)}
                className={`w-8 h-8 rounded-full border-2 ${
                  color === colorOption ? 'border-gray-400' : 'border-gray-200'
                }`}
                style={{ backgroundColor: colorOption }}
                title={colorOption}
              />
            ))}
          </div>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="mt-2 w-full h-10 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {initialData ? '更新' : '添加'}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              取消
            </button>
          )}
        </div>
      </div>
    </form>
  )
}

interface CategoryItemProps {
  category: Category
  onEdit: (id: string, data: { name?: string; color?: string; description?: string }) => void
  onDelete: (id: string) => void
}

function CategoryItem({ category, onEdit, onDelete }: CategoryItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(category.name)
  const [editColor, setEditColor] = useState(category.color)
  const [editDescription, setEditDescription] = useState(category.description || '')

  const handleSave = () => {
    onEdit(category.id, {
      name: editName,
      color: editColor,
      description: editDescription,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditName(category.name)
    setEditColor(category.color)
    setEditDescription(category.description || '')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <CategoryForm
          initialData={{
            ...category,
            name: editName,
            color: editColor,
            description: editDescription,
          }}
          onSubmit={(data) => {
            onEdit(category.id, data)
            setIsEditing(false)
          }}
          onCancel={handleCancel}
        />
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className="w-4 h-4 rounded-full mr-3"
            style={{ backgroundColor: category.color }}
          />
          <div>
            <h3 className="text-lg font-medium text-gray-900">{category.name}</h3>
            {category.description && (
              <p className="text-sm text-gray-600">{category.description}</p>
            )}
            <p className="text-xs text-gray-500">
              创建于 {new Date(category.createdAt).toLocaleDateString()}
              {category._count && ` • ${category._count.todos} 个待办事项`}
            </p>
          </div>
        </div>

        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-400 hover:text-blue-600"
            title="编辑"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(category.id)}
            className="p-2 text-gray-400 hover:text-red-600"
            title="删除"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
