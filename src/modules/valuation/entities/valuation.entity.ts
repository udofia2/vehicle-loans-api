import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Vehicle } from '../../vehicle/entities/vehicle.entity';

@Entity('valuations')
export class Valuation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  vehicleId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  estimatedValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  minValue: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  maxValue: number;

  @Column({ type: 'varchar', length: 100 })
  source: string;

  @CreateDateColumn()
  valuationDate: Date;

  @Column({ type: 'text', nullable: true })
  metadata: string;

  @CreateDateColumn()
  createdAt: Date;

  // Relations
  @ManyToOne(() => Vehicle)
  @JoinColumn({ name: 'vehicleId' })
  vehicle: Vehicle;
}
