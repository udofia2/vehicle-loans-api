import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Vehicle } from '../../modules/vehicle/entities/vehicle.entity';
import { Valuation } from '../../modules/valuation/entities/valuation.entity';
import { LoanApplication } from '../../modules/loan/entities/loan-application.entity';
import {
  VehicleCondition,
  TransmissionType,
  FuelType,
  LoanApplicationStatus,
  ValuationSource,
} from '../../common/enums';

@Injectable()
export class DatabaseSeeder implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeeder.name);

  constructor(
    @InjectRepository(Vehicle)
    private vehicleRepository: Repository<Vehicle>,
    @InjectRepository(Valuation)
    private valuationRepository: Repository<Valuation>,
    @InjectRepository(LoanApplication)
    private loanRepository: Repository<LoanApplication>,
    private configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    const shouldSeed =
      this.configService.get('ENABLE_SEEDING', 'true') === 'true';
    const isProduction = this.configService.get('NODE_ENV') === 'production';

    if (!shouldSeed) {
      this.logger.log('Seeding disabled by configuration');
      return;
    }

    if (isProduction) {
      this.logger.log('Seeding disabled in production environment');
      return;
    }

    try {
      await this.seedDatabase();
      this.logger.log('✅ Database seeding completed successfully');
    } catch (error) {
      this.logger.error('❌ Database seeding failed:', error);
    }
  }

  private async seedDatabase() {
    // Check if data already exists
    const vehicleCount = await this.vehicleRepository.count();
    if (vehicleCount > 0) {
      this.logger.log('Database already contains data, skipping seeding');
      return;
    }

    this.logger.log('🌱 Starting database seeding...');

    // Seed vehicles
    await this.seedVehicles();

    // Seed valuations for the vehicles
    await this.seedValuations();

    // Seed some loan applications
    await this.seedLoanApplications();
  }

  private async seedVehicles() {
    this.logger.log('Seeding vehicles...');

    const vehicleData = [
      {
        vin: '1HGBH41JXMN109186',
        make: 'Honda',
        model: 'Accord',
        year: 2021,
        mileage: 50000,
        condition: VehicleCondition.GOOD,
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        color: 'Blue',
      },
      {
        vin: '1FTFW1ET5DFC58229',
        make: 'Ford',
        model: 'F-150',
        year: 2020,
        mileage: 75000,
        condition: VehicleCondition.EXCELLENT,
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        color: 'White',
      },
      {
        vin: '1G1YY22G965135943',
        make: 'Chevrolet',
        model: 'Corvette',
        year: 2019,
        mileage: 35000,
        condition: VehicleCondition.EXCELLENT,
        transmission: TransmissionType.MANUAL,
        fuelType: FuelType.GASOLINE,
        color: 'Red',
      },
      {
        vin: '5YJ3E1EA4KF123456',
        make: 'Tesla',
        model: 'Model 3',
        year: 2023,
        mileage: 10000,
        condition: VehicleCondition.EXCELLENT,
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.ELECTRIC,
        color: 'White',
      },
      {
        vin: '3VW217AU5KM123456',
        make: 'Volkswagen',
        model: 'Jetta',
        year: 2020,
        mileage: 45000,
        condition: VehicleCondition.GOOD,
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        color: 'Silver',
      },
      {
        vin: 'JM1BL1SF8A1234567',
        make: 'Mazda',
        model: 'Mazda3',
        year: 2022,
        mileage: 25000,
        condition: VehicleCondition.EXCELLENT,
        transmission: TransmissionType.MANUAL,
        fuelType: FuelType.GASOLINE,
        color: 'Black',
      },
      {
        vin: '2T1BURHE7JC123456',
        make: 'Toyota',
        model: 'Corolla',
        year: 2021,
        mileage: 30000,
        condition: VehicleCondition.GOOD,
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        color: 'Gray',
      },
      {
        vin: '1C4RJFAG4KC123456',
        make: 'Jeep',
        model: 'Grand Cherokee',
        year: 2019,
        mileage: 65000,
        condition: VehicleCondition.GOOD,
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        color: 'Black',
      },
      {
        vin: 'WBAJB1C50EG123456',
        make: 'BMW',
        model: '328i',
        year: 2023,
        mileage: 15000,
        condition: VehicleCondition.EXCELLENT,
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        color: 'Blue',
      },
      {
        vin: '1GCUKREC8JZ123456',
        make: 'Chevrolet',
        model: 'Silverado',
        year: 2020,
        mileage: 55000,
        condition: VehicleCondition.GOOD,
        transmission: TransmissionType.AUTOMATIC,
        fuelType: FuelType.GASOLINE,
        color: 'White',
      },
    ];

    for (const vehicleInfo of vehicleData) {
      const vehicle = this.vehicleRepository.create(vehicleInfo);
      await this.vehicleRepository.save(vehicle);
    }

    this.logger.log(`✅ Seeded ${vehicleData.length} vehicles`);
  }

  private async seedValuations() {
    this.logger.log('Seeding valuations...');

    const vehicles = await this.vehicleRepository.find();
    const valuations = [];

    for (const vehicle of vehicles) {
      // Generate realistic valuations based on vehicle data
      const baseValue = this.calculateBaseValue(vehicle);
      const conditionMultiplier = this.getConditionMultiplier(
        vehicle.condition,
      );
      const estimatedValue = baseValue * conditionMultiplier;

      const valuation = {
        vehicleId: vehicle.id,
        estimatedValue: Math.round(estimatedValue),
        minValue: Math.round(estimatedValue * 0.85),
        maxValue: Math.round(estimatedValue * 1.15),
        source: ValuationSource.KBB,
        valuationDate: new Date(),
        metadata: JSON.stringify({
          adjustments: {
            mileage: vehicle.mileage > 60000 ? -0.1 : 0,
            condition: vehicle.condition,
            age: new Date().getFullYear() - vehicle.year,
          },
        }),
      };

      valuations.push(valuation);
    }

    for (const valuation of valuations) {
      const valuationEntity = this.valuationRepository.create(valuation);
      await this.valuationRepository.save(valuationEntity);
    }

    this.logger.log(`✅ Seeded ${valuations.length} valuations`);
  }

  private async seedLoanApplications() {
    this.logger.log('Seeding loan applications...');

    const vehicles = await this.vehicleRepository.find({ take: 5 }); // Just seed for first 5 vehicles
    const valuations = await this.valuationRepository.find();
    const applications = [];

    const sampleApplicants = [
      {
        name: 'John Smith',
        email: 'john.smith@example.com',
        phone: '(555) 123-4567',
        monthlyIncome: 5500,
        employmentStatus: 'full_time',
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '(555) 234-5678',
        monthlyIncome: 6200,
        employmentStatus: 'full_time',
      },
      {
        name: 'Mike Wilson',
        email: 'mike.wilson@example.com',
        phone: '(555) 345-6789',
        monthlyIncome: 4800,
        employmentStatus: 'part_time',
      },
      {
        name: 'Lisa Brown',
        email: 'lisa.brown@example.com',
        phone: '(555) 456-7890',
        monthlyIncome: 7000,
        employmentStatus: 'self_employed',
      },
      {
        name: 'David Lee',
        email: 'david.lee@example.com',
        phone: '(555) 567-8901',
        monthlyIncome: 5200,
        employmentStatus: 'full_time',
      },
    ];

    for (let i = 0; i < vehicles.length && i < sampleApplicants.length; i++) {
      const vehicle = vehicles[i];
      const applicant = sampleApplicants[i];
      const valuation = valuations.find((v) => v.vehicleId === vehicle.id);

      if (valuation) {
        const loanAmount = Math.round(valuation.estimatedValue * 0.8); // 80% of vehicle value
        const application = {
          vehicleId: vehicle.id,
          valuationId: valuation.id,
          applicantName: applicant.name,
          applicantEmail: applicant.email,
          applicantPhone: applicant.phone,
          monthlyIncome: applicant.monthlyIncome,
          employmentStatus: applicant.employmentStatus,
          loanAmount: loanAmount,
          interestRate: 4.5,
          termMonths: 60,
          status:
            i % 3 === 0
              ? LoanApplicationStatus.APPROVED
              : i % 3 === 1
                ? LoanApplicationStatus.PENDING
                : LoanApplicationStatus.UNDER_REVIEW,
          notes: `Sample loan application for ${vehicle.make} ${vehicle.model}`,
        };

        applications.push(application);
      }
    }

    for (const application of applications) {
      const loanEntity = this.loanRepository.create(application);
      await this.loanRepository.save(loanEntity);
    }

    this.logger.log(`✅ Seeded ${applications.length} loan applications`);
  }

  private calculateBaseValue(vehicle: Vehicle): number {
    // Simple vehicle valuation logic based on make, model, year
    const currentYear = new Date().getFullYear();
    const age = currentYear - vehicle.year;

    // Base values by make (in thousands)
    const makeValues: { [key: string]: number } = {
      Tesla: 45000,
      BMW: 38000,
      Honda: 25000,
      Toyota: 24000,
      Ford: 28000,
      Chevrolet: 26000,
      Volkswagen: 23000,
      Mazda: 22000,
      Jeep: 32000,
    };

    const baseValue = makeValues[vehicle.make] || 20000;

    // Depreciation: 10% per year for first 5 years, then 5% per year
    let depreciationRate = age <= 5 ? 0.1 * age : 0.5 + 0.05 * (age - 5);
    depreciationRate = Math.min(depreciationRate, 0.8); // Cap at 80% depreciation

    // Mileage adjustment: -$0.10 per mile over 12k per year
    const expectedMileage = age * 12000;
    const excessMileage = Math.max(0, vehicle.mileage - expectedMileage);
    const mileageAdjustment = excessMileage * 0.1;

    return Math.max(
      baseValue * (1 - depreciationRate) - mileageAdjustment,
      3000,
    );
  }

  private getConditionMultiplier(condition: VehicleCondition): number {
    const multipliers: { [key in VehicleCondition]: number } = {
      [VehicleCondition.EXCELLENT]: 1.1,
      [VehicleCondition.GOOD]: 1.0,
      [VehicleCondition.FAIR]: 0.85,
      [VehicleCondition.POOR]: 0.7,
    };

    return multipliers[condition] || 1.0;
  }
}
