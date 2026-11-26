import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Database URL configuration
# Supports MySQL if configured and reachable; automatically defaults to a persistent
# local SQLite file (healthsync.db) so the backend runs immediately without setup.
MYSQL_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root:password@localhost:3306/healthsync_db")

def get_sqlite_path():
    if os.getenv("SQLITE_PATH"):
        return os.getenv("SQLITE_PATH")
    if os.getenv("K_SERVICE") or os.getenv("FUNCTION_TARGET") or os.getenv("FIREBASE_CONFIG"):
        return "/tmp/healthsync.db"
    try:
        test_file = "./.db_write_test"
        with open(test_file, "w") as f:
            f.write("ok")
        os.remove(test_file)
        return "./healthsync.db"
    except Exception:
        import tempfile
        return os.path.join(tempfile.gettempdir(), "healthsync.db")

SQLITE_URL = f"sqlite:///{get_sqlite_path()}"

def get_engine():
    # If explicit non-mysql DATABASE_URL is set, use it
    custom_url = os.getenv("DATABASE_URL")
    if custom_url and not custom_url.startswith("mysql"):
        return create_engine(custom_url, connect_args={"check_same_thread": False})
    
    # Try MySQL if explicitly configured, else fall back gracefully to SQLite
    if custom_url and custom_url.startswith("mysql"):
        try:
            test_engine = create_engine(custom_url, pool_pre_ping=True, pool_recycle=3600)
            with test_engine.connect() as conn:
                pass
            print(f" Connected to MySQL Database: {custom_url.split('@')[-1]}")
            return test_engine
        except Exception as e:
            print(f" MySQL connection failed ({e}). Falling back to local SQLite: healthsync.db")
    
    # Default SQLite engine (persistent, zero-configuration)
    return create_engine(SQLITE_URL, connect_args={"check_same_thread": False})

engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
