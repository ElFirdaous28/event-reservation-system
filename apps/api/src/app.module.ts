import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ReservationsModule } from './reservations/reservations.module';
import { AuthModule } from './auth/auth.module';
import { SeederModule } from './seeders/seeder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : `.env.${process.env.NODE_ENV || 'development'}`,
      validate: (env) => {
        if (!env.JWT_ACCESS_SECRET) throw new Error('JWT_ACCESS_SECRET missing');
        if (!env.JWT_REFRESH_SECRET) throw new Error('JWT_REFRESH_SECRET missing');
        if (!env.MONGO_URI) throw new Error('MONGO_URI missing');
        return env;
      },
    }),

    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    UsersModule,

    EventsModule,

    ReservationsModule,

    AuthModule,

    SeederModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
