import { Logger } from '@nestjs/common';
import { OnGatewayInit } from '@nestjs/websockets';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';

@WebSocketGateway()
export class AppGateway implements OnGatewayInit {
  private logger: Logger = new Logger('gateway');

  afterInit(server: any) {
    this.logger.log('Initizaled!');
  }

  @SubscribeMessage('message')
  handleMessage(client: any, payload: any): string {
    return 'Hello world!';
  }
}
