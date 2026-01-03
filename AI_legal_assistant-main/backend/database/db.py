from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

MYSQL_DIALECT = "mysql+pymysql"
MYSQL_USER = "root"
MYSQL_PASSWORD = "Root123456"
MYSQL_HOST = "127.0.0.1"
MYSQL_PORT = "3306"
MYSQL_DATABASE = "ai_law"

# 创建数据库连接 URL
SQLALCHEMY_DATABASE_URL = (
    f"{MYSQL_DIALECT}://{MYSQL_USER}:{MYSQL_PASSWORD}@{MYSQL_HOST}:{MYSQL_PORT}/{MYSQL_DATABASE}?charset=utf8mb4"
)

# 创建 SQLAlchemy 引擎
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)

# 创建 Session 工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()
