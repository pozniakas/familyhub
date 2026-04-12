import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tasks')
export class Task {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ name: 'entity_id', type: 'varchar', nullable: true })
  entityId!: string | null;

  @Column({ type: 'varchar', nullable: true })
  priority!: string | null;

  @Column({ type: 'boolean', default: false })
  done!: boolean;

  /** JSON array of user IDs, e.g. ["id1","id2"] */
  @Column({ name: 'assignee_ids', type: 'text', nullable: true })
  assigneeIds!: string | null;

  @Column({ name: 'due_date', type: 'varchar', nullable: true })
  dueDate!: string | null;

  @Column({ type: 'varchar', nullable: true })
  repeat!: string | null;

  @Column({ name: 'repeat_every', type: 'int', nullable: true })
  repeatEvery!: number | null;

  @Column({ name: 'repeat_frequency', type: 'varchar', nullable: true })
  repeatFrequency!: string | null;

  @Column({ name: 'tenant_id', type: 'varchar' })
  tenantId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
