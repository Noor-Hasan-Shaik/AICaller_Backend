"""add user fields

Revision ID: 0002
Revises: 0001
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to users table
    op.add_column('users', sa.Column('industry', sa.String(length=100), nullable=True))
    op.add_column('users', sa.Column('mobile', sa.String(length=20), nullable=True))
    op.add_column('users', sa.Column('country_code', sa.String(length=10), nullable=True))
    
    # Make username nullable
    op.alter_column('users', 'username',
                    existing_type=sa.String(length=50),
                    nullable=True)


def downgrade() -> None:
    # Remove new columns
    op.drop_column('users', 'industry')
    op.drop_column('users', 'mobile')
    op.drop_column('users', 'country_code')
    
    # Make username not nullable again
    op.alter_column('users', 'username',
                    existing_type=sa.String(length=50),
                    nullable=False) 