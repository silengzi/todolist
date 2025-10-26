'use client'

import { useState } from 'react'
import { Todo, Category, Priority } from '@/types/todo'

interface TodoItemProps {
  todo: Todo
  categories: Category[]
  onToggle: (id: string) => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
}

const priorityColors = {
  LOW: 'text-gray-500',
  MEDIUM: 'text-blue-500',
  HIGH: 'text-orange-500',
  URGENT: 'text-red-500',
}

const priorityLabels = {
  LOW: '低',
  MEDIUM: '中',
  HIGH: '高',
  URGENT: '紧急',
}

export function TodoItem({ todo, categories, onToggle, onEdit, onDelete }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(todo.title)
  const [editDescription, setEditDescription] = useState(todo.description || '')
  const [editPriority, setEditPriority] = useState<Priority>(todo.priority)
  const [editCategoryId, setEditCategoryId] = useState(todo.categoryId || '')
  const [editDueDate, setEditDueDate] = useState(
    todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : ''
  )

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/todos/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          priority: editPriority,
          categoryId: editCategoryId || null,
          dueDate: editDueDate || null,
        }),
      })

      if (response.ok) {
        const updatedTodo = await response.json()
        onEdit(updatedTodo)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('更新待办事项失败:', error)
    }
  }

  const handleCancel = () => {
    setEditTitle(todo.title)
    setEditDescription(todo.description || '')
    setEditPriority(todo.priority)
    setEditCategoryId(todo.categoryId || '')
    setEditDueDate(todo.dueDate ? new Date(todo.dueDate).toISOString().slice(0, 16) : '')
    setIsEditing(false)
  }

  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !todo.completed
  const category = categories.find(c => c.id === todo.categoryId)

  if (isEditing) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="待办事项标题"
          />
          
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="描述（可选）"
            rows={2}
          />

          <div className="flex gap-3">
            <select
              value={editPriority}
              onChange={(e) => setEditPriority(e.target.value as Priority)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LOW">低优先级</option>
              <option value="MEDIUM">中优先级</option>
              <option value="HIGH">高优先级</option>
              <option value="URGENT">紧急</option>
            </select>

            <select
              value={editCategoryId}
              onChange={(e) => setEditCategoryId(e.target.value)}
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
              value={editDueDate}
              onChange={(e) => setEditDueDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              保存
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border rounded-lg p-4 shadow-sm transition-all ${
      todo.completed ? 'opacity-60' : ''
    } ${isOverdue ? 'border-red-200 bg-red-50' : 'border-gray-200'}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(todo.id)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
            todo.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-500'
          }`}
        >
          {todo.completed && (
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`text-lg font-medium ${todo.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {todo.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[todo.priority]} bg-gray-100`}>
              {priorityLabels[todo.priority]}
            </span>
            {category && (
              <span
                className="text-xs px-2 py-1 rounded-full text-white"
                style={{ backgroundColor: category.color }}
              >
                {category.name}
              </span>
            )}
          </div>

          {todo.description && (
            <p className={`text-sm mb-2 ${todo.completed ? 'text-gray-400' : 'text-gray-600'}`}>
              {todo.description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span>创建于 {new Date(todo.createdAt).toLocaleDateString()}</span>
            {todo.dueDate && (
              <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                截止: {new Date(todo.dueDate).toLocaleDateString()}
              </span>
            )}
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
            onClick={() => onDelete(todo.id)}
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
