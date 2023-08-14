import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Lead } from './app.service';
import {
  convertCsvToArray,
  filterLeadsByApplianceBrand,
  filterLeadsByApplianceType,
  filterLeadsByCity,
  filterLeadsByYear,
  filterLeadsByyearAndDocument,
} from './filterResults';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);

  const filePath = __dirname + '/../../messages_full.csv';

  (async () => {
    try {
      const data: Lead[] = await convertCsvToArray(filePath);
      // const data2023 = filterLeadsByYear(data, '2023');
      // filterLeadsByCity(data2023, '2023');
      // const data2022 = filterLeadsByYear(data, '2022');
      // filterLeadsByCity(data2022, '2022');
      // const data2021 = filterLeadsByYear(data, '2021');
      // filterLeadsByCity(data2021, '2021');
      // const data2020 = filterLeadsByYear(data, '2020');
      // filterLeadsByCity(data2020, '2020');
      // const data2019 = filterLeadsByYear(data, '2019');
      // filterLeadsByCity(data2019, '2019');

      // const data2023 = filterLeadsByYear(data, '2023');
      // filterLeadsByApplianceBrand(data2023, '2023');
      // const data2022 = filterLeadsByYear(data, '2022');
      // filterLeadsByApplianceBrand(data2022, '2022');
      // const data2021 = filterLeadsByYear(data, '2021');
      // filterLeadsByApplianceBrand(data2021, '2021');
      // const data2020 = filterLeadsByYear(data, '2020');
      // filterLeadsByApplianceBrand(data2020, '2020');
      // const data2019 = filterLeadsByYear(data, '2019');
      // filterLeadsByApplianceBrand(data2019, '2019');

      // filterLeadsByyearAndDocument(data);
    } catch (error) {
      console.error(error);
    }
  })();
}
bootstrap();
