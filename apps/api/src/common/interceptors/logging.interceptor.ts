import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger(LoggingInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const req = context.switchToHttp().getRequest();
        const res = context.switchToHttp().getResponse();
        const method = req.method;
        const url = req.url;

        const now = Date.now();
        return next.handle().pipe(
            tap(() => {
                const statusCode = res?.statusCode;
                this.logger.log(
                    `${method} ${url} ${statusCode ?? ''} - ${Date.now() - now}ms`,
                );
            }),
        );
    }
}
 