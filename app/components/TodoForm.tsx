'use client'

import { useState } from 'react'
import { Category, Priority } from '@/types/todo'

interface TodoFormProps {
  categories: Category[]
  onSubmit: (todo: {
    title: string
    description?: string
    priority: Priority
    categoryId?: string
    dueDate?: string
  }) => void
  onCancel?: () => void
  initialData?: {
    title?: string
    description?: string
    priority?: Priority
    categoryId?: string
    dueDate?: string
  }
}

export function TodoForm({ categories, onSubmit, onCancel, initialData }: TodoFormProps) {
  const [title, setTitle] = useState(initialData?.title || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [priority, setPriority] = useState<Priority>(initialData?.priority || 'MEDIUM')
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || '')
  const [dueDate, setDueDate] = useState(initialData?.dueDate || '')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      categoryId: categoryId || undefined,
      dueDate: dueDate || undefined,
    })

    // 重置表单
    setTitle('')
    setDescription('')
    setPriority('MEDIUM')
    setCategoryId('')
    setDueDate('')
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="space-y-3">
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="待办事项标题 *"
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

        <div className="flex gap-3">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="LOW">低优先级</option>
            <option value="MEDIUM">中优先级</option>
            <option value="HIGH">高优先级</option>
            <option value="URGENT">紧急</option>
          </select>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">无分类</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            type="datetime-local"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
