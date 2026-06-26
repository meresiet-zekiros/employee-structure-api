import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export default registerAs(
  "database",
  (): TypeOrmModuleOptions => ({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "meresiet",
    database: process.env.DB_NAME || "orga_structure",
    entities: [__dirname + "/../**/*.entity{.ts,.js}"],

    synchronize: true,
    autoLoadEntities: true,
  }),
);
