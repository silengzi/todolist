'use client'

import { Category, Priority, TodoFilters } from '@/types/todo'

interface FilterBarProps {
  categories: Category[]
  filters: TodoFilters
  onFiltersChange: (filters: TodoFilters) => void
}

export function FilterBar({ categories, filters, onFiltersChange }: FilterBarProps) {
  const handleFilterChange = (key: keyof TodoFilters, value: boolean | string | Priority | number | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value,
      page: 1, // 重置到第一页
    })
  }

  const clearFilters = () => {
    onFiltersChange({
      page: 1,
      limit: filters.limit || 20,
    })
  }

  const hasActiveFilters = filters.completed !== undefined || 
    filters.categoryId || 
    filters.priority || 
    filters.search

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex flex-wrap gap-3 items-center">
        {/* 搜索框 */}
        <div className="flex-1 min-w-64">
          <input
            type="text"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="搜索待办事项..."
          />
        </div>

        {/* 完成状态筛选 */}
        <select
          value={filters.completed === undefined ? '' : filters.completed.toString()}
          onChange={(e) => {
            const value = e.target.value
            handleFilterChange('completed', value === '' ? undefined : value === 'true')
          }}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部状态</option>
          <option value="false">未完成</option>
          <option value="true">已完成</option>
        </select>

        {/* 优先级筛选 */}
        <select
          value={filters.priority || ''}
          onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部优先级</option>
          <option value="LOW">低优先级</option>
          <option value="MEDIUM">中优先级</option>
          <option value="HIGH">高优先级</option>
          <option value="URGENT">紧急</option>
        </select>

        {/* 分类筛选 */}
        <select
          value={filters.categoryId || ''}
          onChange={(e) => handleFilterChange('categoryId', e.target.value || undefined)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">全部分类</option>
          <option value="uncategorized">未分类</option>
          {categories.map((category: Category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        {/* 清除筛选 */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            清除筛选
          </button>
        )}
      </div>

      {/* 显示当前筛选条件 */}
      {hasActiveFilters && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.search && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
              搜索: {filters.search}
            </span>
          )}
          {filters.completed !== undefined && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
              状态: {filters.completed ? '已完成' : '未完成'}
            </span>
          )}
          {filters.priority && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-800">
              优先级: {filters.priority}
            </span>
          )}
          {filters.categoryId && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
              分类: {categories.find(c => c.id === filters.categoryId)?.name || '未分类'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
