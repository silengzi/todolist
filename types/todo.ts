export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: Priority
  dueDate?: string
  createdAt: string
  updatedAt: string
  userId: string
  categoryId?: string
  category?: Category
}

export interface Category {
  id: string
  name: string
  color: string
  description?: string
  createdAt: string
  updatedAt: string
  userId: string
  _count?: {
    todos: number
  }
}

export interface TodoStats {
  overview: {
    total: number
    completed: number
    pending: number
    overdue: number
    completionRate: number
  }
  priorityStats: Record<string, number>
}

export interface CategoryStats {
  id: string
  name: string
  color: string
  total: number
  completed: number
  pending: number
  completionRate: number
}

export interface TodoFilters {
  completed?: boolean
  categoryId?: string
  priority?: Priority
  search?: string
  page?: number
  limit?: number
}
