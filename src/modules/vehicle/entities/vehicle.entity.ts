import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('vehicles')
export class Vehicle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 17, unique: true })
  vin: string;

  @Column({ type: 'varchar', length: 100 })
  make: string;

  @Column({ type: 'varchar', length: 100 })
  model: string;

  @Column({ type: 'integer' })
  year: number;

  @Column({ type: 'integer' })
  mileage: number;

  @Column({ type: 'varchar', length: 50 })
  condition: string;

  @Column({ type: 'varchar', length: 50 })
  transmission: string;

  @Column({ type: 'varchar', length: 50 })
  fuelType: string;

  @Column({ type: 'varchar', length: 50 })
  color: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
