import { Injectable } from '@nestjs/common';
import {
  Builder,
  Browser,
  By,
  WebDriver,
  until,
  Key,
  WebElement,
} from 'selenium-webdriver';

import * as fs from 'fs';
import * as util from 'util';
import * as fastcsv from 'fast-csv';

export interface Lead {
  name: string;
  surname: string;
  city: string;
  state: string;
  zipcode: string;
  date: string;
  phoneNumber: string;
  additionalDetails: string;
  applianceModel: string;
  applianceType: string;
  applianceBrand: string;
  propertyType: string;
  price: string;
}

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  async getTest() {
    const driver = await new Builder().forBrowser(Browser.CHROME).build();
    const hrefSet = new Set<string>();
    try {
      await driver.get('https://www.thumbtack.com/login');
      await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
      await driver.get('https://www.thumbtack.com/pro-inbox/');
      await new Promise((resolve) => setTimeout(resolve, 5 * 1000));

      let i = hrefSet.size;

      await this.findHref(driver, hrefSet);

      let j = hrefSet.size;

      while (i !== j) {
        i = j;
        await this.clickOnButton(driver);
        await new Promise((resolve) => setTimeout(resolve, 3 * 1000));
        await this.findHref(driver, hrefSet);
        await new Promise((resolve) => setTimeout(resolve, 3 * 1000));
        j = hrefSet.size;
      }
    } finally {
      const JSONstring = JSON.stringify(Array.from(hrefSet));

      // Use util.promisify to convert fs.writeFile to a function that returns a promise
      const writeFile = util.promisify(fs.writeFile);

      // Write the JSON string to a file
      writeFile('mySet.json', JSONstring)
        .then(() => console.log('Set successfully written to file'))
        .catch((error) => console.log('An error occurred: ', error));

      await driver.quit();
    }
  }

  async clickOnButton(driver: WebDriver) {
    const button = await driver.findElement(
      By.css(
        'button.vIRQFgYANCphKO9-RQaWv._2eWpUjwqkd3Pc7R5-BrPsX._20rw6psACTyqtM3mL6JeIu.ArrQhpVb_OlUvvUB9kTXR._3cIEUsng3TDgiRnynzNONk',
      ),
    );
    button.click();
  }

  async findHref(driver: WebDriver, hrefSet: Set<string>) {
    const elements = await driver.findElements(By.css('a.db'));
    for (const element of elements) {
      const href = await element.getAttribute('href');
      if (!hrefSet.has(href)) {
        hrefSet.add(href);
      }
    }
  }

  async scrapeSingleLead(
    driver: WebDriver,
    url: string,
    patlaklar: Set<string>,
  ) {
    const lead = {} as Lead;
    try {
      await driver.get(url);
      await new Promise((resolve) => setTimeout(resolve, 0.5 * 1000));
      await driver.actions().sendKeys(Key.ESCAPE).perform();
      await driver.actions().sendKeys(Key.ESCAPE).perform();
      await driver.actions().sendKeys(Key.ESCAPE).perform();

      await this.nameParser(driver, lead);
      await this.addressParser(driver, lead);
      const date = await this.getDate(driver);
      lead.date = date;
      const phoneNumber = await this.phoneParser(driver);
      lead.phoneNumber = phoneNumber;
      await this.getDetails(driver, lead);
      const cost = await this.getCost(driver);
      lead.price = cost;

      return lead;
    } catch (error) {
      patlaklar.add(url);
      console.log('PATLADI', error, 'URL', url);
    }
  }

  async getData() {
    const leads = new Set<Lead>();
    const patlaklar = new Set<string>();
    const driver = await new Builder().forBrowser(Browser.CHROME).build();
    await driver.get('https://www.thumbtack.com/login');
    await new Promise((resolve) => setTimeout(resolve, 40 * 1000));

    const urlList = this.readJSONFile();
    for (const url of urlList) {
      const lead = await this.scrapeSingleLead(driver, url, patlaklar);
      console.log(lead);
      leads.add(lead);
    }
    driver.quit();

    const writeFile = util.promisify(fs.writeFile);

    // Write the JSON string to a file
    writeFile('patlaklar_v2.json', JSON.stringify(Array.from(patlaklar)))
      .then(() => console.log('Set successfully written to file'))
      .catch((error) => console.log('An error occurred: ', error));

    const ws = fs.createWriteStream('test_2.csv');

    fastcsv.write(Array.from(leads), { headers: true }).pipe(ws);
    return '200';
  }

  async getDetails(driver, lead: Lead) {
    const spanElements = await driver.wait(
      until.elementsLocated(
        By.css('span[data-test="styled-text-single"].pre-line'),
      ),
      1000,
    );

    // const spanElements = await driver.findElements(
    //   By.css('span[data-test="styled-text-single"].pre-line'),
    // );
    for (let i = 0; i < spanElements.length; i++) {
      const text: string = await spanElements[i].getText();

      if (text.includes('Additional details:')) {
        lead.additionalDetails = await spanElements[i + 1].getText();
      } else if (text.includes('Appliance model:')) {
        lead.applianceModel = await spanElements[i + 1].getText();
      } else if (text.includes('Appliance type:')) {
        lead.applianceType = await spanElements[i + 1].getText();
      } else if (text.includes('Appliance brand:')) {
        lead.applianceBrand = await spanElements[i + 1].getText();
      } else if (text.includes('Property type:')) {
        lead.propertyType = await spanElements[i + 1].getText();
      }
    }
  }

  async getCost(driver) {
    const element = await driver.wait(
      until.elementsLocated(By.css('._2v5dnc3iwVH_7JAa79QfVk')),
      1000,
    );

    // const element = await driver.findElements(
    //   By.css('._2v5dnc3iwVH_7JAa79QfVk'),
    // );

    for (const el of element) {
      const text: string = await el.getText();
      if (text.startsWith('$')) {
        return text;
      }
    }
  }

  readJSONFile() {
    try {
      const filePath: string = __dirname + '/..' + '/patlaklar_v2.json';
      // Read the JSON file
      const jsonData: string = fs.readFileSync(filePath, 'utf-8');

      // Parse the JSON data
      const parsedData: any = JSON.parse(jsonData);

      return parsedData;
    } catch (error) {
      console.error('Error reading JSON file:', error);
    }
  }

  async getDate(driver: WebDriver) {
    const element = await driver.wait(
      until.elementLocated(
        By.css(
          '.tp-body-3.self-stretch.tc.b.black-300.flex.justify-center.message__date--visible .flex.flex-1.mw-100.m_mw6.justify-center.items-center.message__divider .ph3',
        ),
      ),
      1000,
    );

    // const element = await driver.findElement(
    //   By.css(
    //     '.tp-body-3.self-stretch.tc.b.black-300.flex.justify-center.message__date--visible .flex.flex-1.mw-100.m_mw6.justify-center.items-center.message__divider .ph3',
    //   ),
    // );

    // Get the text from the span
    const date = await element.getText();
    return date;
  }

  async nameParser(driver: WebDriver, lead: Lead) {
    const element = await driver.wait(
      until.elementLocated(By.css('._1jNfd9z_LrCk3whBYVXDz7.truncate.mr3')),
      2000,
    );

    // Get the text from the div
    const name = (await element.getText()).trim();
    const nameArray = name.split(' ');
    const lastName = nameArray[nameArray.length - 1].trim();
    const firstName = name.substring(0, name.length - lastName.length).trim();

    lead.name = firstName;
    lead.surname = lastName;
  }

  async addressParser(driver: WebDriver, lead: Lead) {
    const element = await driver.wait(
      until.elementLocated(By.css('.mr2 ._3n1ubgNywOj7LmMk3eLlub.flex')),
      1000,
    );

    // const element = await driver.findElement(
    //   By.css('.mr2 ._3n1ubgNywOj7LmMk3eLlub.flex'),
    // );

    // Get the text from the div
    const address = await element.getText();

    const adressInfo = address.split(',');

    const stateZipCode = adressInfo[1].trim().split(' ');

    lead.city = adressInfo[0].trim();
    lead.state = stateZipCode[0].trim();
    lead.zipcode = stateZipCode[1].trim();

    return address;
  }

  async testCsv() {
    const lead1 = {
      name: 'John',
      surname: 'Shea',
      city: 'Brookline',
      state: 'MA',
      zipcode: '02445',
      date: 'Yesterday',
      phoneNumber: '+18572340651',
      additionalDetails:
        'This is a dual fuel stove. The oven heating coil at the bottom of the stove burned out with sparks flying the last time it worked. I see the part itself on-line but wonder if this is easily replaced of indicates a more extensive electrical problem. The gas burners and broiler continue to work. The stove was installed in 2001.',
      applianceModel: 'VD5C305-4B55',
      applianceType: 'Oven or stove',
      applianceBrand: 'Viking',
      propertyType: 'Residential',
      price: '$10.18',
    };

    const lead2 = {
      name: 'John',
      surname: 'Shea',
      city: 'Brookline',
      state: 'MA',
      zipcode: '02445',
      date: 'Yesterday',
      phoneNumber: '+18572340651',
      additionalDetails:
        'This is a dual fuel stove. The oven heating coil at the bottom of the stove burned out with sparks flying the last time it worked. I see the part itself on-line but wonder if this is easily replaced of indicates a more extensive electrical problem. The gas burners and broiler continue to work. The stove was installed in 2001.',
      applianceModel: 'VD5C305-4B55',
      applianceType: 'Oven or stove',
      applianceBrand: 'Viking',
      propertyType: 'Residential',
      price: '$10.18',
    };

    const leads = [lead1, lead2];

    const ws = fs.createWriteStream('test.csv');

    fastcsv.write(leads, { headers: true }).pipe(ws);
  }

  async phoneParser(driver: WebDriver) {
    const buttons = await driver.wait(
      until.elementsLocated(
        By.css('button._230fLSlginFVu7q_SLOkRk._2uwAL44FcBnDRususT6gtq'),
      ),
      1000,
    );

    // const buttons = await driver.findElements(
    //   By.css('button._230fLSlginFVu7q_SLOkRk._2uwAL44FcBnDRususT6gtq'),
    // );
    let mybutton: WebElement;
    for (const button of buttons) {
      const text = await button.getText();
      if (text.includes('show phone number')) {
        mybutton = button;
        break;
      }
    }
    if (!mybutton) {
      return '';
    }

    await mybutton.click();
    await new Promise((resolve) => setTimeout(resolve, 0.2 * 1000));
    // Wait for the div to be located and get its text
    const element = await driver.findElement(
      By.css(
        '.dn.s_db._2n6dOyisQpPIhy9zh6rjyk ._230fLSlginFVu7q_SLOkRk._2uwAL44FcBnDRususT6gtq',
      ),
    );

    const href = await element.getAttribute('href');

    return href.split(':')[1].trim();
  }
}
