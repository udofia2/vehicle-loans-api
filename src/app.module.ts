import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DatabaseConfig } from './config/database.config';
import { VehicleModule } from './modules/vehicle/vehicle.module';
import { ValuationModule } from './modules/valuation/valuation.module';
import { LoanModule } from './modules/loan/loan.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),


    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),

    VehicleModule,
    ValuationModule,
    LoanModule,
  ],
})
export class AppModule {}
