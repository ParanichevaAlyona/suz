from pathlib import Path
from typing import Tuple, Type

from pydantic_settings import (BaseSettings, PydanticBaseSettingsSource,
                               SettingsConfigDict, YamlConfigSettingsSource)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        yaml_file=Path(__file__).parent.parent / 'config.yaml')

    LOGLEVEL: str
    DEBUG: bool

    HOST: str
    BACKEND_PORT: int
    FRONTEND_PORT: int
    LOG_TO_FILE: bool

    @classmethod
    def settings_customise_sources(
        cls,
        settings_cls: Type[BaseSettings],
        init_settings: PydanticBaseSettingsSource,
        env_settings: PydanticBaseSettingsSource,
        dotenv_settings: PydanticBaseSettingsSource,
        file_secret_settings: PydanticBaseSettingsSource,
    ) -> Tuple[PydanticBaseSettingsSource, ...]:
        return (YamlConfigSettingsSource(settings_cls),)

settings = Settings()
