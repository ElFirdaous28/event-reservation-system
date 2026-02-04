import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { AllExceptionsFilter } from './common/interceptors/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply global interceptor & filter BEFORE listening
  app.useGlobalInterceptors(new LoggingInterceptor());
  app.useGlobalFilters(new AllExceptionsFilter());

  const PORT = process.env.PORT || 3000;
  await app.listen(PORT);
  console.log(`🚀 API running on http://localhost:${PORT}`);
}
bootstrap();
