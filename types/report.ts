export type ReportType = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

export interface Report {
  id: string
  userId: string
  type: ReportType
  startDate: string
  endDate: string
  summary?: string
  content?: string
  createdAt: string
  updatedAt: string
}

export interface CreateReportRequest {
  type: ReportType
  startDate: string
  endDate: string
}

export interface SaveReportRequest {
  id: string
  summary?: string
  content?: string
}

export interface ReportFilters {
  type?: ReportType
  page?: number
  limit?: number
}

