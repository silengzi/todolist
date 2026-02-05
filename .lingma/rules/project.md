---
description: Next.js实现的todolist，个人使用
alwaysApply: true
---
# Next.js TodoList 项目规则

## 项目概述
基于 Next.js 16 + React 19 + TypeScript + Tailwind CSS 4 的个人待办事项管理应用。

## 技术栈
- **框架**: Next.js 16 (App Router)
- **前端**: React 19 + TypeScript 5
- **样式**: Tailwind CSS 4 + PostCSS
- **代码规范**: ESLint + Next.js 配置
- **字体**: Geist Sans + Geist Mono

## 编辑原则
- 保持现有缩进字符和宽度，不要转换制表符/空格
- 避免无关格式化，编辑应最小且聚焦
- 优先使用提前返回和清晰的控制流，优先处理边界情况
- 变量和函数命名应有意义，避免1-2字母简写
- 仅对非平凡逻辑添加简明注释（解释原因而非过程）

## Next.js 与 React
- 使用 Next.js App Router 架构，所有页面组件放在 `app/` 目录
- 优先使用 React 19 的新特性（如 Server Components）
- 组件优先使用函数式组件和 TypeScript 接口
- 使用 Next.js 内置的 `Image` 组件优化图片加载
- 利用 Next.js 的字体优化功能（如 Geist 字体）

## 路由与导航
- 使用 Next.js App Router 的文件系统路由
- 页面组件使用 `page.tsx` 命名
- 布局组件使用 `layout.tsx` 命名
- 动态路由使用 `[param]` 文件夹命名
- 使用 Next.js 的 `Link` 组件进行客户端导航

## 导入与路径
- 使用 `@/*` 别名引用项目根目录文件
- 第三方模块按需引入，减少打包体积
- 优先使用相对路径导入同级文件
- 组件导入使用 PascalCase 命名

## 样式与 UI
- 使用 Tailwind CSS 4 进行样式设计
- 遵循移动优先的响应式设计原则
- 利用 Tailwind 的暗色模式支持
- 使用 CSS 变量定义主题色彩（如 `--background`, `--foreground`）
- 组件样式优先使用 Tailwind 类名，避免自定义 CSS

## 状态管理
- 简单状态使用 React 内置的 `useState` 和 `useEffect`
- 复杂状态考虑使用 `useReducer` 或 Context API
- 服务端状态使用 Next.js 的 Server Components 或 API Routes
- 避免过度使用状态管理库，保持简单

## 数据获取
- 服务端数据获取使用 Next.js 的 `fetch` API
- 客户端数据获取使用 React 的 `useEffect` 和 `fetch`
- 实现适当的加载状态和错误处理
- 考虑使用 Next.js 的缓存策略优化性能

## 类型定义
- 使用 TypeScript 严格模式
- 为所有组件 props 定义接口
- 使用 Next.js 提供的类型（如 `Metadata`, `ReactNode`）
- 避免使用 `any` 类型，优先使用具体类型

## 性能优化
- 使用 Next.js 的自动代码分割
- 图片使用 `next/image` 组件优化
- 字体使用 `next/font` 优化加载
- 实现适当的缓存策略
- 使用 React 的 `memo` 和 `useMemo` 优化重渲染

## 错误处理
- 使用 Next.js 的 `error.tsx` 处理错误边界
- 实现统一的错误处理机制
- 提供用户友好的错误信息
- 记录错误日志用于调试

## 构建与部署
- 遵循 Next.js 的构建配置
- 使用 ESLint 进行代码检查
- 确保 TypeScript 编译无错误
- 优化生产环境构建

## 意图判断
- 自行分析问题对应的回答是否需要编辑文件
- 如果不需要，则仅给出回答即可
- 如果判断为需要编辑文件，则直接将结果修改到文件中，不要再询问

## 使用语言
- 默认使用中文进行交流和注释
- 代码中的变量名和函数名使用英文
- 用户界面文本使用中文