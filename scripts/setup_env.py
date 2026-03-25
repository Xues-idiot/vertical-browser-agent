"""
Spider - 环境设置脚本
自动检测并设置开发环境
"""

import os
import sys
import subprocess
import json
from pathlib import Path


def print_step(msg: str):
    """打印步骤信息"""
    print(f"\n{'='*50}")
    print(f"  {msg}")
    print(f"{'='*50}\n")


def print_success(msg: str):
    print(f"[SUCCESS] {msg}")


def print_error(msg: str):
    print(f"[ERROR] {msg}")


def print_info(msg: str):
    print(f"[INFO] {msg}")


def check_python() -> bool:
    """检查Python环境"""
    try:
        version = sys.version_info
        print_info(f"Python版本: {version.major}.{version.minor}.{version.micro}")
        if version.major < 3 or (version.major == 3 and version.minor < 8):
            print_error("需要Python 3.8或更高版本")
            return False
        print_success("Python环境检查通过")
        return True
    except Exception as e:
        print_error(f"Python检查失败: {e}")
        return False


def check_node() -> bool:
    """检查Node.js环境"""
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print_info(f"Node.js版本: {result.stdout.strip()}")
            print_success("Node.js环境检查通过")
            return True
        else:
            print_error("Node.js未安装")
            return False
    except FileNotFoundError:
        print_error("Node.js未安装")
        return False


def check_pip() -> bool:
    """检查pip"""
    try:
        result = subprocess.run(
            [sys.executable, "-m", "pip", "--version"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print_info(f"pip版本: {result.stdout.strip()}")
            return True
        return False
    except Exception:
        return False


def install_backend_deps() -> bool:
    """安装后端依赖"""
    print_step("安装后端依赖")

    requirements_file = Path("backend/requirements.txt")
    if not requirements_file.exists():
        print_error("requirements.txt未找到")
        return False

    try:
        subprocess.run(
            [sys.executable, "-m", "pip", "install", "-r", str(requirements_file)],
            check=True
        )
        print_success("后端依赖安装完成")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"后端依赖安装失败: {e}")
        return False


def install_frontend_deps() -> bool:
    """安装前端依赖"""
    print_step("安装前端依赖")

    package_json = Path("frontend/package.json")
    if not package_json.exists():
        print_error("package.json未找到")
        return False

    try:
        # 检查npm或yarn
        npm_cmd = "npm"
        if not subprocess.run(["which", npm_cmd], capture_output=True).returncode == 0:
            print_error("npm未安装")
            return False

        subprocess.run([npm_cmd, "install"], cwd="frontend", check=True)
        print_success("前端依赖安装完成")
        return True
    except subprocess.CalledProcessError as e:
        print_error(f"前端依赖安装失败: {e}")
        return False


def create_env_file():
    """创建.env文件"""
    print_step("创建环境配置文件")

    env_example = Path("backend/.env.example")
    env_file = Path("backend/.env")

    if env_file.exists():
        print_info(".env文件已存在，跳过创建")
        return

    if env_example.exists():
        with open(env_example, "r") as f:
            content = f.read()
        with open(env_file, "w") as f:
            f.write(content)
        print_success(".env文件已创建")
    else:
        # 创建默认.env文件
        default_env = """# Spider环境配置
MINIMAX_API_KEY=your_api_key_here
MINIMAX_BASE_URL=https://api.minimaxi.com/anthropic
MINIMAX_MODEL=MiniMax-M2.7
TAVILY_API_KEY=your_tavily_key_here
"""
        with open(env_file, "w") as f:
            f.write(default_env)
        print_success(".env文件已创建（请编辑添加您的API密钥）")


def create_directories():
    """创建必要的目录"""
    print_step("创建项目目录")

    dirs = [
        ".spider_data",
        "backend/logs",
        "frontend/.next",
    ]

    for d in dirs:
        Path(d).mkdir(parents=True, exist_ok=True)
        print_info(f"目录已创建: {d}")

    print_success("目录创建完成")


def run_tests() -> bool:
    """运行测试"""
    print_step("运行测试")

    try:
        result = subprocess.run(
            [sys.executable, "-m", "pytest", "backend/tests/", "-v"],
            capture_output=True,
            text=True
        )
        if result.returncode == 0:
            print_success("测试全部通过")
            return True
        else:
            print_error("部分测试失败")
            print(result.stdout)
            return False
    except Exception as e:
        print_error(f"测试运行失败: {e}")
        return False


def main():
    """主函数"""
    print("\n" + "="*50)
    print("  Spider - 环境设置")
    print("="*50 + "\n")

    # 检查环境
    print_step("检查环境")

    env_ok = True
    if not check_python():
        env_ok = False
    if not check_node():
        env_ok = False
    if not check_pip():
        print_error("pip未安装或不可用")

    if not env_ok:
        print_error("环境检查未通过，请先安装必要的依赖")
        sys.exit(1)

    # 创建目录
    create_directories()

    # 创建环境文件
    create_env_file()

    # 安装依赖
    print("\n是否安装依赖？")
    print("1) 安装所有依赖")
    print("2) 仅安装后端依赖")
    print("3) 仅安装前端依赖")
    print("4) 跳过")

    choice = input("\n请选择 (1-4): ").strip()

    if choice == "1":
        install_backend_deps()
        install_frontend_deps()
    elif choice == "2":
        install_backend_deps()
    elif choice == "3":
        install_frontend_deps()
    elif choice == "4":
        print_info("跳过依赖安装")
    else:
        print_error("无效选择")

    # 运行测试
    print("\n是否运行测试？")
    print("1) 是")
    print("2) 否")

    test_choice = input("\n请选择 (1-2): ").strip()
    if test_choice == "1":
        run_tests()

    print("\n" + "="*50)
    print("  设置完成！")
    print("="*50)
    print("\n下一步:")
    print("  1. 编辑 backend/.env 添加API密钥")
    print("  2. 运行 ./scripts/dev.sh 启动开发服务器")
    print("  3. 访问 http://localhost:3777")


if __name__ == "__main__":
    main()