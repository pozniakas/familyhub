import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { Section } from './Section';

@Entity('entities')
export class FamilyEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'varchar', default: '📁' })
  emoji!: string;

  @Column({ name: 'tenant_id', type: 'varchar' })
  tenantId!: string;

  @OneToMany(() => Section, (section) => section.entity, { cascade: true })
  sections!: Section[];
}
