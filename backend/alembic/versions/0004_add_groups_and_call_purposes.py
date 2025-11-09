"""Add groups and call purposes

Revision ID: 0004
Revises: 0003
Create Date: 2024-01-01 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None

def upgrade():
    # Create groups table
    op.create_table('groups',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_groups_id'), 'groups', ['id'], unique=False)

    # Create lead_groups association table
    op.create_table('lead_groups',
        sa.Column('lead_id', sa.Integer(), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ),
        sa.ForeignKeyConstraint(['lead_id'], ['leads.id'], ),
        sa.PrimaryKeyConstraint('lead_id', 'group_id')
    )

    # Create group_calls table
    op.create_table('group_calls',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=True),
        sa.Column('user_id', sa.Integer(), nullable=True),
        sa.Column('status', sa.String(length=50), nullable=True),
        sa.Column('purpose', sa.String(length=50), nullable=True),
        sa.Column('custom_prompt', sa.Text(), nullable=True),
        sa.Column('additional_notes', sa.Text(), nullable=True),
        sa.Column('current_lead_index', sa.Integer(), nullable=True),
        sa.Column('total_leads', sa.Integer(), nullable=True),
        sa.Column('completed_calls', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_group_calls_id'), 'group_calls', ['id'], unique=False)

    # Add new columns to calls table
    op.add_column('calls', sa.Column('purpose', sa.String(length=50), nullable=True))
    op.add_column('calls', sa.Column('custom_prompt', sa.Text(), nullable=True))
    op.add_column('calls', sa.Column('additional_notes', sa.Text(), nullable=True))
    op.add_column('calls', sa.Column('group_call_id', sa.Integer(), nullable=True))
    
    # Add foreign key constraint for group_call_id
    op.create_foreign_key(None, 'calls', 'group_calls', ['group_call_id'], ['id'])

def downgrade():
    # Remove foreign key constraint
    op.drop_constraint(None, 'calls', type_='foreignkey')
    
    # Remove columns from calls table
    op.drop_column('calls', 'group_call_id')
    op.drop_column('calls', 'additional_notes')
    op.drop_column('calls', 'custom_prompt')
    op.drop_column('calls', 'purpose')
    
    # Drop group_calls table
    op.drop_index(op.f('ix_group_calls_id'), table_name='group_calls')
    op.drop_table('group_calls')
    
    # Drop lead_groups table
    op.drop_table('lead_groups')
    
    # Drop groups table
    op.drop_index(op.f('ix_groups_id'), table_name='groups')
    op.drop_table('groups')
