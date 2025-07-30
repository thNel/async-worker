import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // Возвращает приветствие
  getData(): { message: string } {
    return { message: 'Hello API' };
  }
}
