import { Entity, PrimaryColumn, Column, CreateDateColumn } from "typeorm";

@Entity("tasks")
export class Task {
  @PrimaryColumn({ type: "varchar" })
  id!: string;

  @Column({ type: "text" })
  name!: string;

  @Column({ name: "entity_id", type: "varchar", nullable: true })
  entityId!: string | null;

  @Column({ type: "varchar", nullable: true })
  priority!: string | null;

  @Column({ type: "boolean", default: false })
  done!: boolean;

  /** JSON array of user IDs, e.g. ["id1","id2"] */
  @Column({ name: "assignee_ids", type: "text", nullable: true })
  assigneeIds!: string | null;

  @Column({ name: "due_date", type: "varchar", nullable: true })
  dueDate!: string | null;

  @Column({ type: "varchar", nullable: true })
  repeat!: string | null;

  @Column({ name: "repeat_every", type: "int", nullable: true })
  repeatEvery!: number | null;

  @Column({ name: "repeat_frequency", type: "varchar", nullable: true })
  repeatFrequency!: string | null;

  @Column({ name: "tenant_id", type: "varchar" })
  tenantId!: string;

  /** Minutes/hours/days/weeks/months before due to send an early reminder */
  @Column({ name: "early_reminder_value", type: "int", nullable: true })
  earlyReminderValue!: number | null;

  @Column({ name: "early_reminder_unit", type: "varchar", nullable: true })
  earlyReminderUnit!: string | null;

  /** Set once the early-reminder push has been sent — prevents re-sending */
  @Column({
    name: "early_reminder_sent_at",
    type: "timestamptz",
    nullable: true,
  })
  earlyReminderSentAt!: Date | null;

  /** Set once the due-time push has been sent */
  @Column({ name: "reminder_sent_at", type: "timestamptz", nullable: true })
  reminderSentAt!: Date | null;

  /** 0 = no overdue reminders sent yet, max 3 */
  @Column({ name: "overdue_count", type: "int", default: 0 })
  overdueCount!: number;

  /** Set when the task is marked done, cleared when it is un-completed */
  @Column({ name: "completed_at", type: "timestamptz", nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: "created_at", type: "timestamptz" })
  createdAt!: Date;
}
