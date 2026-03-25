#!/bin/bash
# Spider - 开发启动脚本

# 颜色定义
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 项目路径
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${CYAN}======================================${NC}"
echo -e "${CYAN}  Spider - 开发环境启动${NC}"
echo -e "${CYAN}======================================${NC}"
echo ""

# 检查Python环境
check_python() {
    if command -v python3 &> /dev/null; then
        echo -e "${GREEN}✓${NC} Python3 已安装: $(python3 --version)"
    elif command -v python &> /dev/null; then
        echo -e "${GREEN}✓${NC} Python 已安装: $(python --version)"
    else
        echo -e "${RED}✗${NC} Python 未安装"
        return 1
    fi
}

# 检查Node.js环境
check_node() {
    if command -v node &> /dev/null; then
        echo -e "${GREEN}✓${NC} Node.js 已安装: $(node --version)"
    else
        echo -e "${RED}✗${NC} Node.js 未安装"
        return 1
    fi
}

# 安装后端依赖
install_backend() {
    echo -e "${YELLOW}安装后端依赖...${NC}"
    cd "$PROJECT_DIR/backend"
    if [ -f "requirements.txt" ]; then
        pip install -r requirements.txt
        echo -e "${GREEN}✓${NC} 后端依赖安装完成"
    else
        echo -e "${RED}✗${NC} requirements.txt 未找到"
    fi
}

# 安装前端依赖
install_frontend() {
    echo -e "${YELLOW}安装前端依赖...${NC}"
    cd "$PROJECT_DIR/frontend"
    if [ -f "package.json" ]; then
        npm install
        echo -e "${GREEN}✓${NC} 前端依赖安装完成"
    else
        echo -e "${RED}✗${NC} package.json 未找到"
    fi
}

# 启动后端
start_backend() {
    echo -e "${YELLOW}启动后端服务...${NC}"
    cd "$PROJECT_DIR/backend"
    python -m backend.main &
    BACKEND_PID=$!
    echo -e "${GREEN}✓${NC} 后端服务已启动 (PID: $BACKEND_PID)"
}

# 启动前端
start_frontend() {
    echo -e "${YELLOW}启动前端服务...${NC}"
    cd "$PROJECT_DIR/frontend"
    npm run dev &
    FRONTEND_PID=$!
    echo -e "${GREEN}✓${NC} 前端服务已启动 (PID: $FRONTEND_PID)"
}

# 主菜单
show_menu() {
    echo "请选择操作:"
    echo "1) 安装所有依赖"
    echo "2) 启动开发服务器"
    echo "3) 仅启动后端"
    echo "4) 仅启动前端"
    echo "5) 运行测试"
    echo "6) 退出"
}

# 主函数
main() {
    check_python
    check_node
    echo ""

    show_menu
    echo ""
    read -p "请输入选项: " choice

    case $choice in
        1)
            install_backend
            install_frontend
            ;;
        2)
            start_backend
            start_frontend
            echo ""
            echo -e "${CYAN}服务已启动:${NC}"
            echo -e "  前端: http://localhost:3777"
            echo -e "  后端: http://localhost:8004"
            ;;
        3)
            start_backend
            ;;
        4)
            start_frontend
            ;;
        5)
            cd "$PROJECT_DIR"
            pytest backend/tests/ -v
            ;;
        6)
            echo "退出"
            exit 0
            ;;
        *)
            echo -e "${RED}无效选项${NC}"
            exit 1
            ;;
    esac
}

main