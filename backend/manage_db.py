#!/usr/bin/env python3
"""
Database management script for AI Cold Caller Backend
"""
import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed:")
        print(f"Error: {e.stderr}")
        return False

def check_postgres_connection():
    """Check if PostgreSQL is accessible"""
    print("\n🔍 Checking PostgreSQL connection...")
    try:
        import psycopg2
        from app.core.config import settings
        
        # Extract connection details from DATABASE_URL
        url = settings.database_url
        if url.startswith('postgresql://'):
            url = url.replace('postgresql://', '')
            if '@' in url:
                auth, rest = url.split('@', 1)
                if ':' in auth:
                    user, password = auth.split(':', 1)
                else:
                    user, password = auth, ''
                
                if ':' in rest:
                    host_port, database = rest.split('/', 1)
                    if ':' in host_port:
                        host, port = host_port.split(':', 1)
                    else:
                        host, port = host_port, '5432'
                else:
                    host, database = rest.split('/', 1)
                    port = '5432'
                
                # Test connection
                conn = psycopg2.connect(
                    host=host,
                    port=port,
                    database=database,
                    user=user,
                    password=password
                )
                conn.close()
                print("✅ PostgreSQL connection successful")
                return True
            else:
                print("❌ Invalid DATABASE_URL format")
                return False
        else:
            print("❌ DATABASE_URL is not a PostgreSQL URL")
            return False
    except ImportError:
        print("❌ psycopg2 not installed. Run: pip install psycopg2-binary")
        return False
    except Exception as e:
        print(f"❌ PostgreSQL connection failed: {e}")
        return False

def create_database():
    """Create the database if it doesn't exist"""
    print("\n🗄️ Creating database...")
    try:
        import psycopg2
        from app.core.config import settings
        
        # Extract connection details
        url = settings.database_url
        if url.startswith('postgresql://'):
            url = url.replace('postgresql://', '')
            if '@' in url:
                auth, rest = url.split('@', 1)
                if ':' in auth:
                    user, password = auth.split(':', 1)
                else:
                    user, password = auth, ''
                
                if ':' in rest:
                    host_port, database = rest.split('/', 1)
                    if ':' in host_port:
                        host, port = host_port.split(':', 1)
                    else:
                        host, port = host_port, '5432'
                else:
                    host, database = rest.split('/', 1)
                    port = '5432'
                
                # Connect to postgres database to create our database
                conn = psycopg2.connect(
                    host=host,
                    port=port,
                    database='postgres',
                    user=user,
                    password=password
                )
                conn.autocommit = True
                cursor = conn.cursor()
                
                # Check if database exists
                cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (database,))
                exists = cursor.fetchone()
                
                if not exists:
                    cursor.execute(f"CREATE DATABASE {database}")
                    print(f"✅ Database '{database}' created successfully")
                else:
                    print(f"✅ Database '{database}' already exists")
                
                cursor.close()
                conn.close()
                return True
            else:
                print("❌ Invalid DATABASE_URL format")
                return False
        else:
            print("❌ DATABASE_URL is not a PostgreSQL URL")
            return False
    except Exception as e:
        print(f"❌ Failed to create database: {e}")
        return False

def init_migrations():
    """Initialize Alembic migrations"""
    return run_command("alembic init alembic", "Initializing Alembic")

def create_initial_migration():
    """Create the initial migration"""
    return run_command('alembic revision --autogenerate -m "Initial migration"', "Creating initial migration")

def run_migrations():
    """Run all pending migrations"""
    return run_command("alembic upgrade head", "Running migrations")

def show_migration_status():
    """Show current migration status"""
    return run_command("alembic current", "Checking migration status")

def reset_database():
    """Reset the database (drop all tables and recreate)"""
    print("\n⚠️ WARNING: This will delete all data in the database!")
    response = input("Are you sure you want to continue? (y/N): ")
    if response.lower() != 'y':
        print("❌ Database reset cancelled")
        return False
    
    # Drop all tables
    print("\n🗑️ Dropping all tables...")
    try:
        from app.database.database import engine
        from app.models.models import Base
        
        Base.metadata.drop_all(engine)
        print("✅ All tables dropped")
        
        # Run migrations to recreate tables
        return run_migrations()
    except Exception as e:
        print(f"❌ Failed to reset database: {e}")
        return False

def main():
    """Main function"""
    print("🚀 AI Cold Caller Database Management")
    print("=" * 50)
    
    if len(sys.argv) < 2:
        print("\nUsage:")
        print("  python manage_db.py init     - Initialize database and migrations")
        print("  python manage_db.py migrate  - Run pending migrations")
        print("  python manage_db.py status   - Show migration status")
        print("  python manage_db.py reset    - Reset database (WARNING: deletes all data)")
        print("  python manage_db.py create   - Create database only")
        return
    
    command = sys.argv[1].lower()
    
    if command == "init":
        print("\n🎯 Initializing database and migrations...")
        
        # Check PostgreSQL connection
        if not check_postgres_connection():
            return
        
        # Create database
        if not create_database():
            return
        
        # Initialize migrations (if not already done)
        if not os.path.exists("alembic/env.py"):
            if not init_migrations():
                return
        
        # Create initial migration
        if not create_initial_migration():
            return
        
        # Run migrations
        if not run_migrations():
            return
        
        print("\n✅ Database initialization completed successfully!")
        print("🎉 You can now start the backend with: python main.py")
        
    elif command == "migrate":
        print("\n🔄 Running migrations...")
        if not run_migrations():
            return
        print("\n✅ Migrations completed successfully!")
        
    elif command == "status":
        print("\n📊 Migration status:")
        show_migration_status()
        
    elif command == "reset":
        print("\n🔄 Resetting database...")
        if not reset_database():
            return
        print("\n✅ Database reset completed successfully!")
        
    elif command == "create":
        print("\n🗄️ Creating database...")
        if not create_database():
            return
        print("\n✅ Database created successfully!")
        
    else:
        print(f"❌ Unknown command: {command}")
        print("Available commands: init, migrate, status, reset, create")

if __name__ == "__main__":
    main() 