"""update lead phone unique constraint

Revision ID: 0003
Revises: 0002
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Get the connection and inspector
    connection = op.get_bind()
    inspector = inspect(connection)
    
    # Check if there's a unique constraint on the phone column
    constraints = inspector.get_unique_constraints('leads')
    phone_constraint_name = None
    
    for constraint in constraints:
        if 'phone' in constraint['column_names']:
            phone_constraint_name = constraint['name']
            break
    
    # Remove the global unique constraint on phone if it exists
    if phone_constraint_name:
        op.drop_constraint(phone_constraint_name, 'leads', type_='unique')
    
    # Add composite unique constraint on phone and user_id
    op.create_unique_constraint('uq_lead_phone_user', 'leads', ['phone', 'user_id'])


def downgrade() -> None:
    # Remove the composite unique constraint
    op.drop_constraint('uq_lead_phone_user', 'leads', type_='unique')
    
    # Add back the global unique constraint on phone
    op.create_unique_constraint('leads_phone_key', 'leads', ['phone']) 