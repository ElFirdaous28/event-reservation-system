import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/interceptors/http-exception.filter';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply global interceptor & filter BEFORE listening
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  app.use(cookieParser());

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 API running on http://localhost:${PORT}`);
}
bootstrap();
