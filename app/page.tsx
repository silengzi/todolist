import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* 导航栏 */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                TodoList
              </h1>
            </div>
            <div className="flex space-x-4">
              <Link
                href="#features"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                功能
              </Link>
              <Link
                href="#about"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                关于
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 英雄区域 */}
        <section className="text-center py-20">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            高效管理你的
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              待办事项
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            一个简洁、美观、功能强大的待办事项管理工具，帮助你提高工作效率，让生活更有条理。
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
              开始使用
            </button>
            <button className="px-8 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium">
              了解更多
            </button>
          </div>
        </section>

        {/* 功能特色区域 */}
        <section id="features" className="py-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            为什么选择我们
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                简单易用
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                直观的界面设计，让你快速上手，专注于任务本身。
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                高效管理
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                智能分类和优先级管理，让你的工作更加高效有序。
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                安全可靠
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                数据安全加密存储，保护你的隐私，让你放心使用。
              </p>
            </div>
          </div>
        </section>

        {/* 关于我们区域 */}
        <section id="about" className="py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              关于 TodoList
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              我们致力于为用户提供最优质的待办事项管理体验。通过简洁的设计和强大的功能，
              帮助用户更好地规划时间，提高工作效率，实现个人目标。
            </p>
            <div className="grid md:grid-cols-2 gap-8 mt-12">
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  我们的使命
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  让任务管理变得简单而有趣，帮助每个人都能高效地完成工作，享受生活的美好。
                </p>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  我们的愿景
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  成为全球最受欢迎的待办事项管理工具，让时间管理成为每个人的习惯。
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 页脚 */}
      <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 TodoList. 让生活更有序，让工作更高效。</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
