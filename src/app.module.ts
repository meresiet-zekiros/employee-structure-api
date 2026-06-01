// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { PositionsModule } from './positions/positions.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig], // ✅ Loads the registered 'database' config
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService): TypeOrmModuleOptions => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return configService.get<TypeOrmModuleOptions>('database')!; // ✅ Now returns proper config
      },
    }),
    PositionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
