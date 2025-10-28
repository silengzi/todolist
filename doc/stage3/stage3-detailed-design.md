# 阶段3详细设计文档 - 智能化日报

## 📋 阶段3目标概述

阶段3的核心目标是实现**智能化日报系统**，将现有的模拟AI摘要升级为真实的AI服务，并增加高级导出功能和自动润色能力。

### 🎯 主要目标
- **真实AI集成** - 集成OpenAI或其他LLM服务生成高质量摘要
- **自动润色** - AI自动优化报告内容和格式
- **高级导出** - 支持PDF、Word、Notion等多种格式导出
- **智能建议** - AI生成明日计划和任务建议
- **报告模板** - 支持自定义报告模板和样式

---

## 🧩 一、功能模块设计

### 1️⃣ AI服务集成模块

#### 1.1 AI服务配置
```typescript
// lib/ai-config.ts
export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

export const AI_CONFIG: AIConfig = {
  provider: 'openai',
  apiKey: process.env.OPENAI_API_KEY!,
  model: 'gpt-3.5-turbo',
  maxTokens: 2000,
  temperature: 0.7
};
```

#### 1.2 AI服务抽象层
```typescript
// lib/ai-service.ts
export interface AIService {
  generateSummary(tasks: CompletedTask[], reportType: ReportType): Promise<string>;
  generateContent(tasks: CompletedTask[], reportType: ReportType): Promise<string>;
  generateSuggestions(tasks: Todo[], reportType: ReportType): Promise<string>;
  polishContent(content: string): Promise<string>;
}

export class OpenAIService implements AIService {
  // OpenAI API实现
}

export class AnthropicService implements AIService {
  // Anthropic API实现
}
```

### 2️⃣ 智能摘要生成模块

#### 2.1 增强的摘要生成
```typescript
// lib/ai-summary-generator.ts
export interface SummaryRequest {
  tasks: CompletedTask[];
  reportType: ReportType;
  dateRange: { start: Date; end: Date };
  userPreferences?: UserPreferences;
}

export interface SummaryResponse {
  summary: string;
  insights: string[];
  suggestions: string[];
  metrics: ReportMetrics;
}

export class AISummaryGenerator {
  async generateSummary(request: SummaryRequest): Promise<SummaryResponse> {
    // 1. 数据预处理
    // 2. 构建AI Prompt
    // 3. 调用AI服务
    // 4. 后处理和验证
  }
}
```

#### 2.2 智能Prompt工程
```typescript
// lib/ai-prompts.ts
export const REPORT_PROMPTS = {
  DAILY: `
    你是一个专业的工作日报生成助手。请根据以下任务数据生成一份简洁、专业的日报。
    
    任务数据：
    {tasks}
    
    要求：
    1. 生成3-5句的简洁摘要
    2. 识别关键成果和亮点
    3. 提供1-2个改进建议
    4. 语言专业、简洁
  `,
  
  WEEKLY: `
    你是一个专业的工作周报生成助手。请根据以下任务数据生成一份全面的周报。
    
    任务数据：
    {tasks}
    
    要求：
    1. 总结本周主要成果
    2. 分析工作重点和难点
    3. 提供下周工作建议
    4. 包含数据分析和趋势
  `,
  
  MONTHLY: `
    你是一个专业的工作月报生成助手。请根据以下任务数据生成一份详细的月报。
    
    任务数据：
    {tasks}
    
    要求：
    1. 月度工作总结
    2. 关键指标分析
    3. 问题识别和解决方案
    4. 下月工作规划
  `
};
```

### 3️⃣ 自动润色模块

#### 3.1 内容润色服务
```typescript
// lib/content-polisher.ts
export interface PolishRequest {
  content: string;
  style: 'professional' | 'casual' | 'academic';
  language: 'zh' | 'en';
  length: 'short' | 'medium' | 'long';
}

export interface PolishResponse {
  polishedContent: string;
  improvements: string[];
  readabilityScore: number;
}
*--
export class ContentPolisher {
  async polishContent(request: PolishRequest): Promise<PolishResponse> {
    // 1. 内容分析
    // 2. 风格调整
    // 3. 语言优化
    // 4. 可读性提升
  }
}
```

#### 3.2 润色规则引擎
```typescript
// lib/polish-rules.ts
export const POLISH_RULES = {
  professional: {
    tone: 'formal',
    avoidWords: ['很', '非常', '特别'],
    preferWords: ['显著', '明显', '突出'],
    structure: 'logical'
  },
  casual: {
    tone: 'friendly',
    allowContractions: true,
    preferWords: ['不错', '很好', '很棒'],
    structure: 'conversational'
  }
};
```

### 4️⃣ 高级导出模块

#### 4.1 导出服务抽象
```typescript
// lib/export-service.ts
export interface ExportRequest {
  reportId: string;
  format: ExportFormat;
  template?: string;
  options?: ExportOptions;
}

export interface ExportOptions {
  includeCharts: boolean;
  includeMetadata: boolean;
  watermark?: string;
  customStyles?: CSSProperties;
}

export type ExportFormat = 'pdf' | 'docx' | 'html' | 'notion' | 'markdown';

export class ExportService {
  async exportReport(request: ExportRequest): Promise<Buffer> {
    // 1. 获取报告数据
    // 2. 应用模板
    // 3. 生成文件
    // 4. 返回文件流
  }
}
```

#### 4.2 PDF导出实现
```typescript
// lib/exporters/pdf-exporter.ts
export class PDFExporter {
  async exportToPDF(report: Report, options: ExportOptions): Promise<Buffer> {
    // 使用 puppeteer 或 jsPDF
    // 1. 生成HTML
    // 2. 转换为PDF
    // 3. 添加样式和布局
  }
}
```

#### 4.3 Word导出实现
```typescript
// lib/exporters/docx-exporter.ts
export class DOCXExporter {
  async exportToDOCX(report: Report, options: ExportOptions): Promise<Buffer> {
    // 使用 docx 库
    // 1. 创建文档结构
    // 2. 添加内容
    // 3. 应用样式
  }
}
```

#### 4.4 Notion导出实现
```typescript
// lib/exporters/notion-exporter.ts
export class NotionExporter {
  async exportToNotion(report: Report, options: ExportOptions): Promise<string> {
    // 使用 Notion API
    // 1. 创建页面
    // 2. 添加内容块
    // 3. 设置格式
  }
}
```

### 5️⃣ 智能建议模块

#### 5.1 任务建议生成
```typescript
// lib/task-suggestions.ts
export interface SuggestionRequest {
  completedTasks: CompletedTask[];
  pendingTasks: Todo[];
  userHistory: UserHistory;
  goals?: UserGoal[];
}

export interface TaskSuggestion {
  title: string;
  description: string;
  priority: Priority;
  estimatedTime: number;
  reasoning: string;
  category?: string;
}

export class TaskSuggestionGenerator {
  async generateSuggestions(request: SuggestionRequest): Promise<TaskSuggestion[]> {
    // 1. 分析历史数据
    // 2. 识别模式
    // 3. 生成建议
    // 4. 优先级排序
  }
}
```

#### 5.2 明日计划生成
```typescript
// lib/daily-planner.ts
export interface DailyPlanRequest {
  pendingTasks: Todo[];
  completedToday: CompletedTask[];
  userPreferences: UserPreferences;
  timeAvailable: number; // 小时
}

export interface DailyPlan {
  morningTasks: Todo[];
  afternoonTasks: Todo[];
  eveningTasks: Todo[];
  focusArea: string;
  estimatedCompletion: number;
}

export class DailyPlanner {
  async generateDailyPlan(request: DailyPlanRequest): Promise<DailyPlan> {
    // 1. 任务优先级分析
    // 2. 时间分配优化
    // 3. 生成日程安排
  }
}
```

### 6️⃣ 报告模板系统

#### 6.1 模板引擎
```typescript
// lib/template-engine.ts
export interface ReportTemplate {
  id: string;
  name: string;
  type: ReportType;
  sections: TemplateSection[];
  styles: TemplateStyles;
  variables: TemplateVariable[];
}

export interface TemplateSection {
  id: string;
  name: string;
  content: string;
  required: boolean;
  order: number;
}

export class TemplateEngine {
  async renderTemplate(template: ReportTemplate, data: ReportData): Promise<string> {
    // 1. 解析模板
    // 2. 替换变量
    // 3. 应用样式
    // 4. 生成内容
  }
}
```

#### 6.2 内置模板
```typescript
// lib/templates/built-in-templates.ts
export const BUILT_IN_TEMPLATES: ReportTemplate[] = [
  {
    id: 'daily-professional',
    name: '专业日报模板',
    type: 'DAILY',
    sections: [
      { id: 'summary', name: '工作摘要', content: '{{summary}}', required: true, order: 1 },
      { id: 'completed', name: '完成任务', content: '{{completedTasks}}', required: true, order: 2 },
      { id: 'insights', name: '工作洞察', content: '{{insights}}', required: false, order: 3 },
      { id: 'tomorrow', name: '明日计划', content: '{{tomorrowPlan}}', required: true, order: 4 }
    ],
    styles: {
      fontFamily: 'Microsoft YaHei',
      fontSize: '14px',
      lineHeight: '1.6',
      color: '#333333'
    },
    variables: ['summary', 'completedTasks', 'insights', 'tomorrowPlan']
  }
];
```

---

## 🗄️ 二、数据库设计

### 1️⃣ 新增表结构

#### 1.1 AI配置表
```sql
CREATE TABLE ai_config (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL DEFAULT 'openai',
  model VARCHAR(100) NOT NULL DEFAULT 'gpt-3.5-turbo',
  max_tokens INTEGER NOT NULL DEFAULT 2000,
  temperature DECIMAL(3,2) NOT NULL DEFAULT 0.7,
  custom_prompts JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.2 报告模板表
```sql
CREATE TABLE report_templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type report_type NOT NULL,
  template_data JSONB NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.3 导出历史表
```sql
CREATE TABLE export_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  format VARCHAR(20) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size INTEGER,
  export_options JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 1.4 AI生成历史表
```sql
CREATE TABLE ai_generation_history (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  report_id INTEGER NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  generation_type VARCHAR(50) NOT NULL, -- 'summary', 'content', 'suggestions'
  prompt_used TEXT NOT NULL,
  response_received TEXT NOT NULL,
  tokens_used INTEGER,
  cost DECIMAL(10,4),
  processing_time INTEGER, -- 毫秒
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2️⃣ 现有表扩展

#### 2.1 Report表扩展
```sql
ALTER TABLE reports ADD COLUMN ai_generated BOOLEAN DEFAULT FALSE;
ALTER TABLE reports ADD COLUMN ai_model VARCHAR(100);
ALTER TABLE reports ADD COLUMN ai_tokens INTEGER;
ALTER TABLE reports ADD COLUMN ai_cost DECIMAL(10,4);
ALTER TABLE reports ADD COLUMN template_id INTEGER REFERENCES report_templates(id);
ALTER TABLE reports ADD COLUMN polish_applied BOOLEAN DEFAULT FALSE;
ALTER TABLE reports ADD COLUMN export_count INTEGER DEFAULT 0;
```

---

## 🔌 三、API接口设计

### 1️⃣ AI服务接口

#### 1.1 生成AI摘要
```typescript
POST /api/ai/generate-summary
Content-Type: application/json

{
  "reportId": "string",
  "reportType": "DAILY" | "WEEKLY" | "MONTHLY" | "QUARTERLY" | "YEARLY",
  "customPrompt": "string (optional)",
  "style": "professional" | "casual" | "academic"
}

Response:
{
  "summary": "string",
  "insights": ["string"],
  "suggestions": ["string"],
  "tokensUsed": number,
  "cost": number,
  "processingTime": number
}
```

#### 1.2 润色内容
```typescript
POST /api/ai/polish-content
Content-Type: application/json

{
  "content": "string",
  "style": "professional" | "casual" | "academic",
  "language": "zh" | "en",
  "length": "short" | "medium" | "long"
}

Response:
{
  "polishedContent": "string",
  "improvements": ["string"],
  "readabilityScore": number
}
```

#### 1.3 生成任务建议
```typescript
POST /api/ai/generate-suggestions
Content-Type: application/json

{
  "reportType": "DAILY" | "WEEKLY" | "MONTHLY",
  "includePendingTasks": boolean,
  "focusArea": "string (optional)"
}

Response:
{
  "suggestions": [
    {
      "title": "string",
      "description": "string",
      "priority": "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      "estimatedTime": number,
      "reasoning": "string",
      "category": "string"
    }
  ]
}
```

### 2️⃣ 导出服务接口

#### 2.1 高级导出
```typescript
POST /api/reports/export-advanced
Content-Type: application/json

{
  "reportId": "string",
  "format": "pdf" | "docx" | "html" | "notion",
  "template": "string (optional)",
  "options": {
    "includeCharts": boolean,
    "includeMetadata": boolean,
    "watermark": "string (optional)",
    "customStyles": object
  }
}

Response:
{
  "downloadUrl": "string",
  "fileName": "string",
  "fileSize": number,
  "expiresAt": "string"
}
```

#### 2.2 批量导出
```typescript
POST /api/reports/export-batch
Content-Type: application/json

{
  "reportIds": ["string"],
  "format": "pdf" | "docx" | "zip",
  "template": "string (optional)",
  "options": object
}

Response:
{
  "downloadUrl": "string",
  "fileName": "string",
  "fileSize": number,
  "reportCount": number
}
```

### 3️⃣ 模板管理接口

#### 3.1 获取模板列表
```typescript
GET /api/templates?type=DAILY&public=true

Response:
{
  "templates": [
    {
      "id": "string",
      "name": "string",
      "type": "DAILY",
      "isDefault": boolean,
      "isPublic": boolean,
      "createdAt": "string"
    }
  ]
}
```

#### 3.2 创建自定义模板
```typescript
POST /api/templates
Content-Type: application/json

{
  "name": "string",
  "type": "DAILY" | "WEEKLY" | "MONTHLY",
  "templateData": {
    "sections": [
      {
        "id": "string",
        "name": "string",
        "content": "string",
        "required": boolean,
        "order": number
      }
    ],
    "styles": {
      "fontFamily": "string",
      "fontSize": "string",
      "lineHeight": "string",
      "color": "string"
    }
  },
  "isPublic": boolean
}

Response:
{
  "template": {
    "id": "string",
    "name": "string",
    "type": "string",
    "createdAt": "string"
  }
}
```

### 4️⃣ 配置管理接口

#### 4.1 AI配置管理
```typescript
GET /api/ai/config
Response:
{
  "provider": "openai",
  "model": "gpt-3.5-turbo",
  "maxTokens": 2000,
  "temperature": 0.7,
  "customPrompts": object
}

PUT /api/ai/config
Content-Type: application/json
{
  "provider": "openai",
  "model": "gpt-4",
  "maxTokens": 3000,
  "temperature": 0.5,
  "customPrompts": {
    "DAILY": "custom prompt for daily reports"
  }
}
```

---

## 🎨 四、前端界面设计

### 1️⃣ AI功能集成界面

#### 1.1 智能生成页面
```typescript
// app/dashboard/reports/generate-ai/page.tsx
export default function AIGeneratePage() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">AI智能生成报告</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左侧：配置面板 */}
        <div className="space-y-6">
          <AIConfigPanel />
          <TemplateSelector />
          <StyleSelector />
        </div>
        
        {/* 右侧：预览面板 */}
        <div className="space-y-6">
          <GenerationProgress />
          <ContentPreview />
          <ActionButtons />
        </div>
      </div>
    </div>
  );
}
```

#### 1.2 AI配置组件
```typescript
// app/components/AIConfigPanel.tsx
export function AIConfigPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI配置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>AI服务提供商</Label>
          <Select>
            <SelectItem value="openai">OpenAI</SelectItem>
            <SelectItem value="anthropic">Anthropic</SelectItem>
            <SelectItem value="local">本地模型</SelectItem>
          </Select>
        </div>
        
        <div>
          <Label>模型选择</Label>
          <Select>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="claude-3">Claude-3</SelectItem>
          </Select>
        </div>
        
        <div>
          <Label>创意度 (Temperature)</Label>
          <Slider min={0} max={1} step={0.1} />
        </div>
        
        <div>
          <Label>最大Token数</Label>
          <Input type="number" placeholder="2000" />
        </div>
      </CardContent>
    </Card>
  );
}
```

### 2️⃣ 高级导出界面

#### 2.1 导出配置面板
```typescript
// app/components/ExportConfigPanel.tsx
export function ExportConfigPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>导出配置</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>导出格式</Label>
          <Select>
            <SelectItem value="pdf">PDF文档</SelectItem>
            <SelectItem value="docx">Word文档</SelectItem>
            <SelectItem value="html">HTML网页</SelectItem>
            <SelectItem value="notion">Notion页面</SelectItem>
          </Select>
        </div>
        
        <div>
          <Label>模板选择</Label>
          <Select>
            <SelectItem value="professional">专业模板</SelectItem>
            <SelectItem value="casual">休闲模板</SelectItem>
            <SelectItem value="custom">自定义模板</SelectItem>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>导出选项</Label>
          <div className="space-y-2">
            <Checkbox>包含图表</Checkbox>
            <Checkbox>包含元数据</Checkbox>
            <Checkbox>添加水印</Checkbox>
          </div>
        </div>
        
        <div>
          <Label>自定义样式</Label>
          <Textarea placeholder="CSS样式代码..." />
        </div>
      </CardContent>
    </Card>
  );
}
```

### 3️⃣ 模板管理界面

#### 3.1 模板编辑器
```typescript
// app/dashboard/templates/page.tsx
export default function TemplatesPage() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">报告模板管理</h1>
        <Button>创建新模板</Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：模板列表 */}
        <div className="lg:col-span-1">
          <TemplateList />
        </div>
        
        {/* 右侧：模板编辑器 */}
        <div className="lg:col-span-2">
          <TemplateEditor />
        </div>
      </div>
    </div>
  );
}
```

### 4️⃣ 智能建议界面

#### 4.1 任务建议面板
```typescript
// app/components/TaskSuggestionsPanel.tsx
export function TaskSuggestionsPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI任务建议</CardTitle>
        <CardDescription>基于您的工作模式生成个性化建议</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">生成建议</Button>
            <Button variant="outline" size="sm">刷新</Button>
          </div>
          
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium">{suggestion.title}</h4>
                  <Badge variant={getPriorityVariant(suggestion.priority)}>
                    {suggestion.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {suggestion.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    预计用时: {suggestion.estimatedTime}分钟
                  </span>
                  <Button size="sm" variant="outline">
                    添加到任务
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## 🔧 五、技术实现细节

### 1️⃣ AI服务集成

#### 1.1 OpenAI集成
```typescript
// lib/ai-services/openai-service.ts
import OpenAI from 'openai';

export class OpenAIService implements AIService {
  private client: OpenAI;
  
  constructor(config: AIConfig) {
    this.client = new OpenAI({
      apiKey: config.apiKey,
    });
  }
  
  async generateSummary(tasks: CompletedTask[], reportType: ReportType): Promise<string> {
    const prompt = this.buildPrompt(tasks, reportType);
    
    const response = await this.client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: '你是一个专业的工作报告生成助手。' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2000,
      temperature: 0.7,
    });
    
    return response.choices[0].message.content || '';
  }
  
  private buildPrompt(tasks: CompletedTask[], reportType: ReportType): string {
    const taskData = tasks.map(task => 
      `- ${task.title}: ${task.description} (优先级: ${task.priority})`
    ).join('\n');
    
    return REPORT_PROMPTS[reportType].replace('{tasks}', taskData);
  }
}
```

#### 1.2 错误处理和重试
```typescript
// lib/ai-services/ai-service-base.ts
export abstract class BaseAIService implements AIService {
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (i < maxRetries - 1) {
          await this.delay(Math.pow(2, i) * 1000); // 指数退避
        }
      }
    }
    
    throw lastError!;
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

### 2️⃣ 导出服务实现

#### 2.1 PDF导出
```typescript
// lib/exporters/pdf-exporter.ts
import puppeteer from 'puppeteer';

export class PDFExporter {
  async exportToPDF(report: Report, options: ExportOptions): Promise<Buffer> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // 生成HTML内容
    const html = await this.generateHTML(report, options);
    
    await page.setContent(html);
    
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '20mm',
        bottom: '20mm',
        left: '20mm'
      }
    });
    
    await browser.close();
    return pdf;
  }
  
  private async generateHTML(report: Report, options: ExportOptions): Promise<string> {
    const template = await this.loadTemplate(options.template);
    return this.renderTemplate(template, report);
  }
}
```

#### 2.2 Word导出
```typescript
// lib/exporters/docx-exporter.ts
import { Document, Packer, Paragraph, TextRun } from 'docx';

export class DOCXExporter {
  async exportToDOCX(report: Report, options: ExportOptions): Promise<Buffer> {
    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: report.title,
                  bold: true,
                  size: 32,
                }),
              ],
            }),
            // 添加更多内容...
          ],
        },
      ],
    });
    
    return await Packer.toBuffer(doc);
  }
}
```

### 3️⃣ 模板引擎

#### 3.1 模板解析器
```typescript
// lib/template-engine/template-parser.ts
export class TemplateParser {
  parseTemplate(template: string): ParsedTemplate {
    const sections = this.extractSections(template);
    const variables = this.extractVariables(template);
    const styles = this.extractStyles(template);
    
    return {
      sections,
      variables,
      styles,
      rawTemplate: template
    };
  }
  
  private extractSections(template: string): TemplateSection[] {
    const sectionRegex = /{{#section\s+(\w+)}}([\s\S]*?){{\/section}}/g;
    const sections: TemplateSection[] = [];
    let match;
    
    while ((match = sectionRegex.exec(template)) !== null) {
      sections.push({
        id: match[1],
        content: match[2],
        required: true,
        order: sections.length
      });
    }
    
    return sections;
  }
  
  private extractVariables(template: string): string[] {
    const variableRegex = /{{(\w+)}}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = variableRegex.exec(template)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  }
}
```

### 4️⃣ 缓存和性能优化

#### 4.1 AI响应缓存
```typescript
// lib/cache/ai-cache.ts
export class AICache {
  private cache = new Map<string, CachedResponse>();
  
  async getCachedResponse(key: string): Promise<CachedResponse | null> {
    const cached = this.cache.get(key);
    
    if (cached && !this.isExpired(cached)) {
      return cached;
    }
    
    return null;
  }
  
  async setCachedResponse(key: string, response: CachedResponse): Promise<void> {
    this.cache.set(key, {
      ...response,
      cachedAt: new Date()
    });
  }
  
  private isExpired(cached: CachedResponse): boolean {
    const now = new Date();
    const diff = now.getTime() - cached.cachedAt.getTime();
    return diff > 24 * 60 * 60 * 1000; // 24小时过期
  }
}
```

#### 4.2 导出文件缓存
```typescript
// lib/cache/export-cache.ts
export class ExportCache {
  private fileCache = new Map<string, CachedFile>();
  
  async getCachedFile(key: string): Promise<Buffer | null> {
    const cached = this.fileCache.get(key);
    
    if (cached && !this.isExpired(cached)) {
      return cached.data;
    }
    
    return null;
  }
  
  async setCachedFile(key: string, data: Buffer): Promise<void> {
    this.fileCache.set(key, {
      data,
      cachedAt: new Date()
    });
  }
}
```

---

## 🧪 六、测试策略

### 1️⃣ 单元测试

#### 1.1 AI服务测试
```typescript
// __tests__/ai-service.test.ts
describe('OpenAIService', () => {
  let service: OpenAIService;
  
  beforeEach(() => {
    service = new OpenAIService(mockConfig);
  });
  
  it('should generate summary for daily report', async () => {
    const tasks = mockCompletedTasks;
    const summary = await service.generateSummary(tasks, 'DAILY');
    
    expect(summary).toBeDefined();
    expect(summary.length).toBeGreaterThan(0);
    expect(summary).toContain('今日完成');
  });
  
  it('should handle API errors gracefully', async () => {
    jest.spyOn(service, 'generateSummary').mockRejectedValue(new Error('API Error'));
    
    await expect(service.generateSummary([], 'DAILY')).rejects.toThrow('API Error');
  });
});
```

#### 1.2 导出服务测试
```typescript
// __tests__/export-service.test.ts
describe('PDFExporter', () => {
  let exporter: PDFExporter;
  
  beforeEach(() => {
    exporter = new PDFExporter();
  });
  
  it('should export report to PDF', async () => {
    const report = mockReport;
    const options = mockExportOptions;
    
    const pdfBuffer = await exporter.exportToPDF(report, options);
    
    expect(pdfBuffer).toBeInstanceOf(Buffer);
    expect(pdfBuffer.length).toBeGreaterThan(0);
  });
});
```

### 2️⃣ 集成测试

#### 2.1 API集成测试
```typescript
// __tests__/api/ai.test.ts
describe('AI API Integration', () => {
  it('should generate AI summary via API', async () => {
    const response = await request(app)
      .post('/api/ai/generate-summary')
      .send({
        reportId: 'test-report-id',
        reportType: 'DAILY',
        style: 'professional'
      })
      .expect(200);
    
    expect(response.body.summary).toBeDefined();
    expect(response.body.tokensUsed).toBeGreaterThan(0);
  });
});
```

### 3️⃣ 端到端测试

#### 3.1 完整流程测试
```typescript
// __tests__/e2e/ai-report-generation.test.ts
describe('AI Report Generation E2E', () => {
  it('should complete full AI report generation flow', async () => {
    // 1. 创建报告
    const report = await createTestReport();
    
    // 2. 生成AI摘要
    const summary = await generateAISummary(report.id);
    
    // 3. 润色内容
    const polished = await polishContent(summary);
    
    // 4. 导出PDF
    const pdf = await exportToPDF(report.id, 'pdf');
    
    // 验证结果
    expect(summary).toBeDefined();
    expect(polished).toBeDefined();
    expect(pdf).toBeDefined();
  });
});
```

---

## 📊 七、性能监控

### 1️⃣ AI服务监控

#### 1.1 性能指标
```typescript
// lib/monitoring/ai-monitoring.ts
export class AIMonitoring {
  async trackGenerationMetrics(
    operation: string,
    startTime: number,
    tokensUsed: number,
    cost: number
  ): Promise<void> {
    const metrics = {
      operation,
      duration: Date.now() - startTime,
      tokensUsed,
      cost,
      timestamp: new Date()
    };
    
    await this.sendMetrics(metrics);
  }
  
  async trackError(error: Error, context: any): Promise<void> {
    const errorMetrics = {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date()
    };
    
    await this.sendErrorMetrics(errorMetrics);
  }
}
```

#### 1.2 成本监控
```typescript
// lib/monitoring/cost-monitoring.ts
export class CostMonitoring {
  async trackAICost(userId: string, cost: number, operation: string): Promise<void> {
    await this.updateUserCost(userId, cost);
    await this.updateDailyCost(cost);
    await this.updateOperationCost(operation, cost);
  }
  
  async getUserCostSummary(userId: string): Promise<CostSummary> {
    return {
      dailyCost: await this.getDailyCost(userId),
      monthlyCost: await this.getMonthlyCost(userId),
      totalCost: await this.getTotalCost(userId),
      averageCostPerOperation: await this.getAverageCostPerOperation(userId)
    };
  }
}
```

---

## 🔒 八、安全考虑

### 1️⃣ API密钥管理

#### 1.1 密钥加密存储
```typescript
// lib/security/key-manager.ts
export class KeyManager {
  private encryptionKey: string;
  
  constructor() {
    this.encryptionKey = process.env.ENCRYPTION_KEY!;
  }
  
  async encryptAPIKey(key: string): Promise<string> {
    const cipher = crypto.createCipher('aes-256-cbc', this.encryptionKey);
    let encrypted = cipher.update(key, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }
  
  async decryptAPIKey(encryptedKey: string): Promise<string> {
    const decipher = crypto.createDecipher('aes-256-cbc', this.encryptionKey);
    let decrypted = decipher.update(encryptedKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
```

### 2️⃣ 内容安全

#### 2.1 内容过滤
```typescript
// lib/security/content-filter.ts
export class ContentFilter {
  private sensitivePatterns = [
    /password/i,
    /secret/i,
    /token/i,
    /key/i
  ];
  
  async filterSensitiveContent(content: string): Promise<string> {
    let filtered = content;
    
    for (const pattern of this.sensitivePatterns) {
      filtered = filtered.replace(pattern, '[FILTERED]');
    }
    
    return filtered;
  }
  
  async validateContent(content: string): Promise<boolean> {
    // 检查内容是否包含敏感信息
    return !this.sensitivePatterns.some(pattern => pattern.test(content));
  }
}
```

---

## 📈 九、部署和运维

### 1️⃣ 环境配置

#### 1.1 环境变量
```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
ENCRYPTION_KEY=your_encryption_key
AI_CACHE_TTL=86400
AI_RATE_LIMIT=100
EXPORT_CACHE_SIZE=1000
```

#### 1.2 Docker配置
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 2️⃣ 监控和日志

#### 2.1 日志配置
```typescript
// lib/logging/logger.ts
export class Logger {
  private logger: winston.Logger;
  
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
        new winston.transports.Console()
      ]
    });
  }
  
  logAIGeneration(operation: string, metrics: any): void {
    this.logger.info('AI Generation', {
      operation,
      ...metrics,
      timestamp: new Date()
    });
  }
}
```

---

## 🎯 十、实施计划

### 1️⃣ 开发阶段

#### 阶段3.1: AI服务集成 (2周)
- [ ] 实现AI服务抽象层
- [ ] 集成OpenAI API
- [ ] 实现错误处理和重试机制
- [ ] 添加AI配置管理

#### 阶段3.2: 智能摘要生成 (2周)
- [ ] 实现智能摘要生成器
- [ ] 优化Prompt工程
- [ ] 添加内容润色功能
- [ ] 实现任务建议生成

#### 阶段3.3: 高级导出功能 (2周)
- [ ] 实现PDF导出
- [ ] 实现Word导出
- [ ] 实现Notion导出
- [ ] 添加批量导出功能

#### 阶段3.4: 模板系统 (1周)
- [ ] 实现模板引擎
- [ ] 创建内置模板
- [ ] 实现模板编辑器
- [ ] 添加模板管理功能

#### 阶段3.5: 前端界面 (2周)
- [ ] 实现AI配置界面
- [ ] 实现导出配置界面
- [ ] 实现模板管理界面
- [ ] 实现智能建议界面

#### 阶段3.6: 测试和优化 (1周)
- [ ] 编写单元测试
- [ ] 编写集成测试
- [ ] 性能优化
- [ ] 安全加固

### 2️⃣ 验收标准

#### 功能验收
- [ ] AI摘要生成准确率 > 90%
- [ ] 导出功能支持4种格式
- [ ] 模板系统支持自定义
- [ ] 响应时间 < 5秒

#### 性能验收
- [ ] AI生成响应时间 < 10秒
- [ ] 导出文件生成时间 < 30秒
- [ ] 系统可用性 > 99.5%
- [ ] 并发用户支持 > 100

#### 安全验收
- [ ] API密钥安全存储
- [ ] 内容过滤功能正常
- [ ] 用户数据隔离
- [ ] 审计日志完整

---

## 📝 总结

阶段3的智能化日报系统将显著提升用户体验，通过集成真实的AI服务、高级导出功能和智能建议，使报告生成更加智能化和个性化。整个系统采用模块化设计，易于扩展和维护，为后续的阶段4（多人协作与可视化）奠定了坚实的基础。

### 🎉 预期成果

1. **智能化程度提升** - 从模拟AI升级为真实AI服务
2. **导出功能增强** - 支持多种格式和自定义样式
3. **用户体验优化** - 智能建议和自动润色
4. **系统可扩展性** - 模块化设计，易于添加新功能
5. **商业价值提升** - 为企业用户提供专业级报告服务

通过阶段3的实施，todolist项目将成为一个功能完整、智能化程度高的企业级任务管理和报告生成平台。
