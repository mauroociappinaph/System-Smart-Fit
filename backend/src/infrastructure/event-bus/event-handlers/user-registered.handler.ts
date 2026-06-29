import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UserRegisteredHandler {
  private readonly logger = new Logger(UserRegisteredHandler.name);

  @OnEvent('user.registered')
  handle(payload: any) {
    this.logger.log(
      `User registered event received: ${JSON.stringify(payload)}`,
    );
    // Future: send welcome email, create default settings, etc.
  }
}
