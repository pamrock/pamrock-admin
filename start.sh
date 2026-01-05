#!/bin/bash
# 项目快速启动脚本（Linux/Mac 用户）

echo "🎉 现代化管理后台系统 - 快速启动"
echo "================================"
echo ""

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org"
    exit 1
fi

echo "✓ Node.js 版本: $(node --version)"
echo "✓ NPM 版本: $(npm --version)"
echo ""

# 进入项目目录
cd "$(dirname "$0")" || exit

echo "📦 开始安装依赖..."
echo ""

# 安装依赖
npm install

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 依赖安装完成！"
    echo ""
    echo "🚀 启动开发服务器..."
    echo ""
    npm run dev
else
    echo "❌ 依赖安装失败，请检查网络连接"
    exit 1
fi
