// src/common/filters/http-exception.filter.ts
import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        const status =
            exception instanceof HttpException
                ? exception.getStatus()
                : HttpStatus.INTERNAL_SERVER_ERROR;

        const isHttpException = exception instanceof HttpException;
        const exceptionResponse = isHttpException ? exception.getResponse() : undefined;
        const isProd = process.env.NODE_ENV === 'production';

        let message: string | string[] = 'Internal server error';
        if (isHttpException) {
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (
                exceptionResponse &&
                typeof exceptionResponse === 'object' &&
                'message' in exceptionResponse
            ) {
                const msg = (exceptionResponse as { message?: string | string[] }).message;
                message = msg ?? message;
            }
        }

        if (!isHttpException && isProd) {
            message = 'Internal server error';
        }

        // Log the exception
        this.logger.error(
            `HTTP ${status} Error: ${JSON.stringify(message)}`,
            exception instanceof Error ? exception.stack : '',
        );

        response.status(status).json({
            statusCode: status,
            timestamp: new Date().toISOString(),
            method: request.method,
            path: request.url,
            message,
        });
    }
}
