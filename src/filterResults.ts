import * as csvParser from 'csv-parser';
import * as fs from 'fs';
import { Lead } from './app.service';

export async function convertCsvToArray(filePath: string): Promise<Lead[]> {
  const results: Lead[] = [];

  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csvParser({ separator: ';' }))
      .on('data', (data: Lead) => {
        results.push(data);
      })
      .on('error', (error: Error) => {
        reject(error);
      })
      .on('end', () => {
        resolve();
      });
  });

  return results;
}

export function filterLeadsByApplianceBrand(leads: Lead[], year: string) {
  const counts: Record<string, number> = {};

  leads.forEach((lead) => {
    const { applianceBrand } = lead;
    if (applianceBrand in counts) {
      counts[applianceBrand]++;
    } else {
      counts[applianceBrand] = 1;
    }
  });
  const csvData = Object.entries(counts)
    .map(([key, value]) => `${key},${value}`)
    .join('\n');

  fs.writeFileSync(`brand_filtered_${year}.csv`, csvData, 'utf-8');
}

export function filterLeadsByApplianceType(leads: Lead[], year: string) {
  const counts: Record<string, number> = {};

  leads.forEach((lead) => {
    const { applianceType } = lead;
    console.log(applianceType);
    if (applianceType in counts) {
      counts[applianceType]++;
    } else {
      counts[applianceType] = 1;
    }
  });
  const csvData = Object.entries(counts)
    .map(([key, value]) => `${key},${value}`)
    .join('\n');

  fs.writeFileSync(`type_filtered_${year}.csv`, csvData, 'utf-8');
}

export function filterLeadsByCity(leads: Lead[], year: string) {
  const counts: Record<string, number> = {};

  leads.forEach((lead) => {
    const { city } = lead;
    if (city in counts) {
      counts[city]++;
    } else {
      counts[city] = 1;
    }
  });
  const csvData = Object.entries(counts)
    .map(([key, value]) => `${key},${value}`)
    .join('\n');

  fs.writeFileSync(`cityfiltered_${year}.csv`, csvData, 'utf-8');
}

export function filterLeadsByYear(leads: Lead[], YEAR: string): Lead[] {
  return leads.filter((lead) => lead.year === YEAR);
}

export function filterLeadsByyearAndDocument(leads: Lead[]) {
  const counts: Record<string, number> = {};

  leads.forEach((lead) => {
    const { year } = lead;
    if (year in counts) {
      counts[year]++;
    } else {
      counts[year] = 1;
    }
  });
  const csvData = Object.entries(counts)
    .map(([key, value]) => `${key},${value}`)
    .join('\n');

  fs.writeFileSync(`brand_filtered_by_year.csv`, csvData, 'utf-8');
}
