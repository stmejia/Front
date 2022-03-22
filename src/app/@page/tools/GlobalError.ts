import { HttpErrorResponse } from "@angular/common/http";
import { ErrorHandler, Injectable, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { ConfigService } from "src/app/@aguila/data/services/config.service";
import { ErrorService } from "../services/error-service.service";
import { NotificacionService } from "../services/notificacion.service";
import { SweetService } from "../services/sweet.service";

@Injectable()

export class GlobalError implements ErrorHandler {

    constructor(private injector: Injector, private router: Router, private sweetService: SweetService) { }

    handleError(error: any): void {
        const errorService = this.injector.get(ErrorService);
        const notifier = this.injector.get(NotificacionService);
        const configService = this.injector.get(ConfigService);

        let message;
        let stackTrace;

        if (error instanceof HttpErrorResponse) {
            // Server error
            //message = errorService.getServerErrorMessage(error);
            //stackTrace = errorService.getServerErrorStackTrace(error);
            //notifier.showError(message);
        } else {
            // Client Error
            message = errorService.getClientErrorMessage(error);
            notifier.showError(message);
            this.logError(message, stackTrace);
            //configService.recargarModulo();
        }
    }

    logError(message: string, stack: string) {
        // Send errors to server here
        console.log('LoggingService: ' + message);
    }
}