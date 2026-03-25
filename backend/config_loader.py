"""
Spider - 配置加载器
支持多环境配置
"""

import os
import json
from typing import Optional, Dict, Any
from pathlib import Path
from dataclasses import dataclass, field


@dataclass
class AppConfig:
    """应用配置"""
    name: str = "Spider"
    version: str = "1.0.0"
    debug: bool = False
    environment: str = "development"


@dataclass
class APIConfig:
    """API配置"""
    host: str = "0.0.0.0"
    port: int = 8004
    prefix: str = "/api"
    cors_origins: list = field(default_factory=lambda: ["*"])
    timeout: int = 30


@dataclass
class LLMConfig:
    """LLM配置"""
    provider: str = "minimax"
    model: str = "MiniMax-M2.7"
    api_key: Optional[str] = None
    base_url: str = "https://api.minimaxi.com/anthropic"
    temperature: float = 0.7
    max_tokens: int = 4000


@dataclass
class BrowserConfig:
    """浏览器配置"""
    headless: bool = True
    viewport_width: int = 1920
    viewport_height: int = 1080
    user_agent: Optional[str] = None
    timeout: int = 30000


@dataclass
class StorageConfig:
    """存储配置"""
    type: str = "memory"  # memory, file, redis
    path: str = ".spider_data"
    ttl: int = 3600


@dataclass
class Config:
    """主配置类"""
    app: AppConfig = field(default_factory=AppConfig)
    api: APIConfig = field(default_factory=APIConfig)
    llm: LLMConfig = field(default_factory=LLMConfig)
    browser: BrowserConfig = field(default_factory=BrowserConfig)
    storage: StorageConfig = field(default_factory=StorageConfig)


class ConfigLoader:
    """配置加载器"""

    def __init__(self, config_dir: Optional[str] = None):
        self.config_dir = Path(config_dir) if config_dir else Path("config")
        self._config: Optional[Config] = None

    def load(self) -> Config:
        """加载配置"""
        if self._config:
            return self._config

        # 尝试加载JSON配置
        config_file = self.config_dir / "config.json"
        if config_file.exists():
            self._config = self._load_from_file(config_file)
        else:
            # 使用环境变量+默认值
            self._config = self._load_from_env()

        return self._config

    def _load_from_file(self, config_file: Path) -> Config:
        """从文件加载"""
        with open(config_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        return Config(
            app=AppConfig(**data.get("app", {})),
            api=APIConfig(**data.get("api", {})),
            llm=LLMConfig(**data.get("llm", {})),
            browser=BrowserConfig(**data.get("browser", {})),
            storage=StorageConfig(**data.get("storage", {})),
        )

    def _load_from_env(self) -> Config:
        """从环境变量加载"""
        return Config(
            app=AppConfig(
                name=os.getenv("APP_NAME", "Spider"),
                version=os.getenv("APP_VERSION", "1.0.0"),
                debug=os.getenv("DEBUG", "false").lower() == "true",
                environment=os.getenv("ENVIRONMENT", "development"),
            ),
            api=APIConfig(
                host=os.getenv("API_HOST", "0.0.0.0"),
                port=int(os.getenv("API_PORT", "8004")),
                prefix=os.getenv("API_PREFIX", "/api"),
            ),
            llm=LLMConfig(
                provider=os.getenv("LLM_PROVIDER", "minimax"),
                model=os.getenv("LLM_MODEL", "MiniMax-M2.7"),
                api_key=os.getenv("MINIMAX_API_KEY"),
                base_url=os.getenv("MINIMAX_BASE_URL", "https://api.minimaxi.com/anthropic"),
            ),
            browser=BrowserConfig(
                headless=os.getenv("BROWSER_HEADLESS", "true").lower() == "true",
            ),
            storage=StorageConfig(
                type=os.getenv("STORAGE_TYPE", "memory"),
                path=os.getenv("STORAGE_PATH", ".spider_data"),
            ),
        )

    def get(self) -> Config:
        """获取配置"""
        return self.load()

    def reload(self) -> Config:
        """重新加载配置"""
        self._config = None
        return self.load()


# 全局配置加载器
_config_loader: Optional[ConfigLoader] = None


def get_config_loader() -> ConfigLoader:
    """获取配置加载器"""
    global _config_loader
    if _config_loader is None:
        _config_loader = ConfigLoader()
    return _config_loader


def get_config() -> Config:
    """获取配置"""
    return get_config_loader().get()