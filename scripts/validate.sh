#!/bin/bash
# Spider - 验证脚本
# 检查项目结构和依赖

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

log_error() {
    echo -e "${RED}✗ ERROR:${NC} $1"
    ((ERRORS++))
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠ WARNING:${NC} $1"
    ((WARNINGS++))
}

log_info() {
    echo -e "${BLUE}ℹ:${NC} $1"
}

echo "======================================"
echo "  Spider - 项目验证"
echo "======================================"
echo ""

# 检查Python
echo "检查Python环境..."
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    log_success "Python: $PYTHON_VERSION"
else
    log_error "Python3 未安装"
fi

# 检查Node.js
echo ""
echo "检查Node.js环境..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    NPM_VERSION=$(npm --version)
    log_success "Node.js: $NODE_VERSION"
    log_success "npm: $NPM_VERSION"
else
    log_error "Node.js 未安装"
fi

# 检查项目结构
echo ""
echo "检查项目结构..."

REQUIRED_DIRS=(
    "backend/agents"
    "backend/api"
    "backend/graph"
    "frontend/src/components"
    "frontend/src/hooks"
    "frontend/src/lib"
)

for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        log_success "目录存在: $dir"
    else
        log_error "目录缺失: $dir"
    fi
done

# 检查关键文件
echo ""
echo "检查关键文件..."

REQUIRED_FILES=(
    "backend/requirements.txt"
    "frontend/package.json"
    "docker-compose.yml"
    "README.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "文件存在: $file"
    else
        log_error "文件缺失: $file"
    fi
done

# 检查后端依赖
echo ""
echo "检查后端依赖..."
if [ -f "backend/requirements.txt" ]; then
    MISSING_PKGS=$(python3 -m pip list 2>/dev/null | grep -c "^" || echo "0")
    if [ "$MISSING_PKGS" -gt "0" ]; then
        log_success "后端依赖已安装 ($MISSING_PKGS packages)"
    else
        log_warning "后端依赖可能未安装"
    fi
fi

# 检查前端依赖
echo ""
echo "检查前端依赖..."
if [ -d "frontend/node_modules" ]; then
    log_success "前端依赖已安装"
else
    log_warning "前端依赖未安装 (请运行 npm install)"
fi

# 检查.env文件
echo ""
echo "检查环境配置..."
if [ -f "backend/.env" ]; then
    log_success ".env 文件已存在"
else
    if [ -f "backend/.env.example" ]; then
        log_warning ".env 文件未创建 (参考 .env.example 创建)"
    else
        log_warning ".env 文件未创建，且无 .env.example"
    fi
fi

# 检查端口占用
echo ""
echo "检查端口..."
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warning "端口 $1 已被占用"
    else
        log_success "端口 $1 可用"
    fi
}

check_port 3777  # Frontend
check_port 8004  # Backend

# 总结
echo ""
echo "======================================"
echo "  验证结果"
echo "======================================"
echo -e "错误: ${RED}$ERRORS${NC}"
echo -e "警告: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "${GREEN}✓ 项目验证通过！${NC}"
    exit 0
elif [ "$ERRORS" -eq 0 ]; then
    echo -e "${YELLOW}⚠ 项目验证通过，但有警告${NC}"
    exit 0
else
    echo -e "${RED}✗ 项目验证失败${NC}"
    exit 1
fi