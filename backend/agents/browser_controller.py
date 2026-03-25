"""
Spider - 浏览器控制Agent
基于 browser-use 封装浏览器控制能力
"""

import asyncio
import base64
from typing import Optional, Any
from dataclasses import dataclass

from loguru import logger

from backend.agents.types import BrowserSession, BrowserAction


@dataclass
class BrowserController:
    """浏览器控制器"""

    def __init__(self):
        self.session: Optional[BrowserSession] = None
        self._browser_session = None
        self._agent = None
        self._is_initialized = False

    async def init_browser(self, headless: bool = True) -> BrowserSession:
        """
        初始化浏览器

        Args:
            headless: 是否无头模式

        Returns:
            BrowserSession: 浏览器会话
        """
        try:
            from browser_use import Agent, BrowserSession, BrowserProfile

            # 创建浏览器配置
            profile = BrowserProfile(
                headless=headless,
            )

            # 创建浏览器会话
            self._browser_session = BrowserSession(profile=profile)
            await self._browser_session.start()

            session_id = f"spider_{id(self)}"
            self.session = BrowserSession(
                session_id=session_id,
                browser_type="chromium",
                headless=headless
            )
            self._is_initialized = True
            logger.info(f"Browser initialized: {session_id}")

        except ImportError as e:
            logger.warning(f"browser-use not installed: {e}")
            self._is_initialized = False
        except Exception as e:
            logger.error(f"Failed to initialize browser: {e}")
            self._is_initialized = False

        return self.session or BrowserSession(
            session_id=f"mock_{id(self)}",
            browser_type="mock",
            headless=headless
        )

    async def execute_action(self, action: BrowserAction) -> dict[str, Any]:
        """
        执行浏览器动作

        Args:
            action: 浏览器动作

        Returns:
            dict: 执行结果
        """
        if not self.session:
            raise RuntimeError("Browser not initialized. Call init_browser first.")

        if not self._is_initialized or self._browser_session is None:
            return await self._mock_execute(action)

        return await self._real_execute(action)

    async def _mock_execute(self, action: BrowserAction) -> dict[str, Any]:
        """模拟执行（当browser-use不可用时）"""
        await asyncio.sleep(0.1)

        return {
            "success": True,
            "action": action.action_type,
            "message": f"Mock: {action.action_type} executed",
            "target": action.target,
        }

    async def _real_execute(self, action: BrowserAction) -> dict[str, Any]:
        """实际使用browser-use执行"""
        try:
            action_type = action.action_type.lower()
            target = action.target or ""
            value = action.value or ""

            if action_type == "navigate":
                # 导航到URL
                page = await self._browser_session.get_current_page()
                await page.goto(target)
                return {"success": True, "action": "navigate", "url": target}

            elif action_type == "click":
                # 点击元素
                page = await self._browser_session.get_current_page()
                await page.click(target)
                return {"success": True, "action": "click", "selector": target}

            elif action_type == "input":
                # 输入文本
                page = await self._browser_session.get_current_page()
                await page.fill(target, value)
                return {"success": True, "action": "input", "selector": target, "text": value}

            elif action_type == "scroll":
                # 滚动
                page = await self._browser_session.get_current_page()
                await page.evaluate(f"window.scrollTo(0, {value})")
                return {"success": True, "action": "scroll", "pixels": value}

            elif action_type == "screenshot":
                # 截图
                page = await self._browser_session.get_current_page()
                screenshot_bytes = await page.screenshot()
                screenshot_base64 = base64.b64encode(screenshot_bytes).decode()
                return {
                    "success": True,
                    "action": "screenshot",
                    "screenshot": screenshot_base64,
                }

            else:
                return {
                    "success": False,
                    "action": action_type,
                    "error": f"Unknown action type: {action_type}",
                }

        except Exception as e:
            logger.error(f"Browser action failed: {e}")
            return {"success": False, "action": action.action_type, "error": str(e)}

    async def take_screenshot(self) -> Optional[str]:
        """
        截取当前页面截图

        Returns:
            str: base64编码的截图数据
        """
        if not self._is_initialized or self._browser_session is None:
            return None

        try:
            page = await self._browser_session.get_current_page()
            screenshot_bytes = await page.screenshot()
            return base64.b64encode(screenshot_bytes).decode()
        except Exception as e:
            logger.error(f"Screenshot failed: {e}")
            return None

    async def navigate_to(self, url: str) -> dict[str, Any]:
        """
        导航到指定URL

        Args:
            url: 目标URL

        Returns:
            dict: 执行结果
        """
        action = BrowserAction(
            action_type="navigate",
            target=url
        )
        return await self.execute_action(action)

    async def click_element(self, selector: str) -> dict[str, Any]:
        """
        点击元素

        Args:
            selector: 元素选择器

        Returns:
            dict: 执行结果
        """
        action = BrowserAction(
            action_type="click",
            target=selector
        )
        return await self.execute_action(action)

    async def input_text(self, selector: str, text: str) -> dict[str, Any]:
        """
        输入文本

        Args:
            selector: 元素选择器
            text: 要输入的文本

        Returns:
            dict: 执行结果
        """
        action = BrowserAction(
            action_type="input",
            target=selector,
            value=text
        )
        return await self.execute_action(action)

    async def get_page_content(self) -> str:
        """
        获取页面内容

        Returns:
            str: 页面HTML内容
        """
        if not self._is_initialized or self._browser_session is None:
            return "<html><body>Mock Page Content</body></html>"

        try:
            page = await self._browser_session.get_current_page()
            content = await page.content()
            return content
        except Exception as e:
            logger.error(f"Get page content failed: {e}")
            return ""

    async def close(self):
        """关闭浏览器"""
        if self._browser_session:
            try:
                await self._browser_session.stop()
            except Exception:
                pass
        self.session = None
        self._browser_session = None
        self._agent = None
        self._is_initialized = False


# 全局浏览器实例
_browser_controller: Optional[BrowserController] = None


async def get_browser_controller() -> BrowserController:
    """获取全局浏览器控制器"""
    global _browser_controller
    if _browser_controller is None:
        _browser_controller = BrowserController()
        await _browser_controller.init_browser()
    return _browser_controller


async def close_browser():
    """关闭全局浏览器"""
    global _browser_controller
    if _browser_controller:
        await _browser_controller.close()
        _browser_controller = None
