"""
Spider - 管道处理
用于数据处理管道
"""

from typing import Callable, Any, List, TypeVar, Generic

T = TypeVar('T')
R = TypeVar('R')


class Pipeline:
    """数据处理管道"""

    def __init__(self):
        self._steps: List[Callable] = []

    def pipe(self, step: Callable[[T], R]) -> "Pipeline":
        """添加管道步骤"""
        self._steps.append(step)
        return self

    async def process(self, data: T) -> Any:
        """处理数据"""
        result = data
        for step in self._steps:
            if hasattr(step, '__await__'):
                result = await step(result)
            else:
                result = step(result)
        return result

    def process_sync(self, data: T) -> Any:
        """同步处理数据"""
        result = data
        for step in self._steps:
            result = step(result)
        return result

    def clear(self) -> None:
        """清空管道"""
        self._steps.clear()

    @property
    def length(self) -> int:
        """管道长度"""
        return len(self._steps)


class PipelineBuilder:
    """管道构建器"""

    def __init__(self):
        self._pipelines: dict[str, Pipeline] = {}

    def create(self, name: str) -> Pipeline:
        """创建管道"""
        pipeline = Pipeline()
        self._pipelines[name] = pipeline
        return pipeline

    def get(self, name: str) -> Pipeline:
        """获取管道"""
        return self._pipelines.get(name)

    def remove(self, name: str) -> bool:
        """删除管道"""
        if name in self._pipelines:
            del self._pipelines[name]
            return True
        return False

    def list_pipelines(self) -> List[str]:
        """列出所有管道"""
        return list(self._pipelines.keys())


# 预定义管道
class PredefinedPipelines:
    """预定义数据处理管道"""

    @staticmethod
    def jd_parsing_pipeline() -> Pipeline:
        """JD解析管道"""
        from backend.text_utils import clean_text, remove_html_tags
        from backend.validators import Validator

        pipeline = Pipeline()
        pipeline.pipe(clean_text)
        pipeline.pipe(remove_html_tags)
        return pipeline

    @staticmethod
    def resume_parsing_pipeline() -> Pipeline:
        """简历解析管道"""
        from backend.text_utils import clean_text, normalize_whitespace

        pipeline = Pipeline()
        pipeline.pipe(clean_text)
        pipeline.pipe(normalize_whitespace)
        return pipeline

    @staticmethod
    def data_validation_pipeline() -> Pipeline:
        """数据验证管道"""
        from backend.validators import Validator

        pipeline = Pipeline()
        pipeline.pipe(lambda x: Validator.validate_jd_text(x))
        return pipeline


# 全局管道构建器
_pipeline_builder: PipelineBuilder = PipelineBuilder()


def get_pipeline_builder() -> PipelineBuilder:
    """获取管道构建器"""
    return _pipeline_builder