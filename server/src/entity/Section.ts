import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FamilyEntity } from './FamilyEntity';

@Entity('sections')
export class Section {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ name: 'entity_id', type: 'varchar' })
  entityId!: string;

  @ManyToOne(() => FamilyEntity, (entity) => entity.sections, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'entity_id' })
  entity!: FamilyEntity;

  @Column({ type: 'text' })
  name!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;
}
