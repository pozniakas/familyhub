import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('push_subscriptions')
export class PushSubscription {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  /** Foreign key to users.id */
  @Column({ name: 'user_id', type: 'varchar' })
  userId!: string;

  @Column({ type: 'text' })
  endpoint!: string;

  /** JSON: { p256dh, auth } */
  @Column({ type: 'text' })
  keys!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
