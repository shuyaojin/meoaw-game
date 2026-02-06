#!/bin/bash

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== 开始自动部署 Meaow Game ===${NC}"

# 1. 检查 Git 是否可用
if ! command -v git &> /dev/null; then
    echo -e "${RED}错误: 未检测到 Git！${NC}"
    echo "请务必先在弹出的窗口中点击【安装】(Install)。"
    echo "安装完成后，请重新运行此脚本：./deploy.sh"
    # 尝试触发安装弹窗
    xcode-select --install 2>/dev/null
    exit 1
fi

echo -e "${GREEN}1. Git 环境检测通过${NC}"

# 2. 初始化仓库
if [ ! -d ".git" ]; then
    echo "正在初始化 Git 仓库..."
    git init
    git branch -M main
else
    echo "Git 仓库已存在，跳过初始化。"
fi

# 3. 添加远程地址 (如果不存在)
REMOTE_URL="https://github.com/shuyaojin/meoaw-game.git"
if ! git remote | grep -q "origin"; then
    echo "添加远程仓库: $REMOTE_URL"
    git remote add origin "$REMOTE_URL"
else
    echo "远程仓库已配置。"
    # 确保 URL 正确
    git remote set-url origin "$REMOTE_URL"
fi

# 4. 提交代码
echo "正在提交代码..."
git add .
git commit -m "Auto deploy from Trae: $(date)"

# 5. 推送代码
echo "正在推送到 GitHub..."
echo -e "${GREEN}注意: 如果是第一次连接，可能需要您输入 GitHub 账号密码或 Token。${NC}"
git push -u origin main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}=== 🎉 部署成功！ ===${NC}"
    echo "现在请访问 https://app.netlify.com/start"
    echo "选择 'Import an existing project' -> 'GitHub' -> 'meoaw-game' 即可上线！"
else
    echo -e "${RED}=== 推送失败 ===${NC}"
    echo "请检查您的网络或 GitHub 权限。"
fi
