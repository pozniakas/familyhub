import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('items')
export class Item {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ name: 'entity_id', type: 'varchar' })
  entityId!: string;

  @Column({ name: 'section_id', type: 'varchar' })
  sectionId!: string;

  @Column({ type: 'text' })
  name!: string;

  @Column({ type: 'varchar', default: 'ok' })
  status!: string;

  @Column({ type: 'text', default: '' })
  notes!: string;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder!: number;
}
