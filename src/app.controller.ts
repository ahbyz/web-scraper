import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('/test')
  getTest() {
    return this.appService.getTest();
  }

  @Get('/data')
  getData() {
    return this.appService.getData();
  }

  @Get('/csv')
  getcsv() {
    return this.appService.testCsv();
  }
}
