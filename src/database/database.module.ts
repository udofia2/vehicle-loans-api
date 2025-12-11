import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseConfig } from '../config/database.config';
import { DatabaseSeeder } from './seeders/database.seeder';
import { Vehicle } from '../modules/vehicle/entities/vehicle.entity';
import { Valuation } from '../modules/valuation/entities/valuation.entity';
import { LoanApplication } from '../modules/loan/entities/loan-application.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: DatabaseConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Vehicle, Valuation, LoanApplication]),
  ],
  providers: [DatabaseConfig, DatabaseSeeder],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
