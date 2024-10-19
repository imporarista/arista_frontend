import { Injectable } from '@angular/core';
import { constants } from '../../environments/constants';
@Injectable({
  providedIn: 'root'
})
export class GeneralFunctionsService {

  constructor() { 
  
  }

  public getCurrentDate() {
    return GeneralFunctionsService.formatDate(new Date());
  }

  /**
   * retorna date time en tiempo con formato de base de datos o de presentación a usuario
   * @param format
   */
  public getCurrentDateTime(format: any) {
    return GeneralFunctionsService.formatDateHour(new Date(), format);
  }

  /**
   * da formato de dos digitos a numeros
   * @param number
   */
  static formatNumberDate(number: any) {
    if (number < 10) {
      number = '0' + number;
    }
    return number;
  }

  /**
   * retorna la fecha en formato yyyy-m-d
   * @param date
   */
  static formatDate(date: any) {
    return date.getFullYear() + '-' + GeneralFunctionsService.formatNumberDate(date.getMonth() + 1) + '-' + GeneralFunctionsService.formatNumberDate(date.getDate());
  }

  /**
   * retorna la fecha en string con el formato deseado
   * @param date
   * @param format
   */
  static formatDateHour(date: any, format: any) {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    let seconds = date.getSeconds();
    let month = (date.getMonth() + 1);
    let strTime = '';

    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    if (format === constants.DATE_FORMAT.USER) {

      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      strTime = ' ' + hours + ':' + minutes + ' ' + ampm;
    } else if (format === constants.DATE_FORMAT.DATABASE) {
      hours = hours < 10 ? '0' + hours : hours;
      strTime = ' ' + hours + ':' + minutes + ':' + seconds;
      if (month < 10) {
        month = '0' + month;
      }
    }

    return date.getFullYear() + '-' + month + '-' + date.getDate() + strTime;
  }

  /**
   * retorna la hora de un data time
   * @param timeString
   */
  public getTimeFromDateTimeString(timeString: any) {
    const time: string[] = timeString.split(' ');
    return time[1];
  }

  public getDateFromDataTimeString(timeString: any) {
    const time: string[] = timeString.split(' ');
    const dataDate: string[] = time[0].split('-');
    return dataDate[2] + '/' + GeneralFunctionsService.getStringMonth(dataDate[1]) + '/' + dataDate[0];
  }

  /**
   * retorna la diferencia en tre dos fechas en horas, minutos y segundos
   * @param dateIni
   * @param dateEnd
   * @param typeReturn
   */
  public calculateDifferenceBetweenTimes(dateIni: any, dateEnd: any, typeReturn: any) {
    const from = new Date(dateIni);
    const to = new Date(dateEnd);
    const diff = to.getTime() - from.getTime();

    if (typeReturn === constants.UNITIES.TIME.MILLISECONDS) {
      return diff;
    } else {
      return this.msToTime(diff);
    }
  }

  /**
   * convierte un tiempo en horas minutos y segundos
   * @param duration
   */
  public msToTime(duration: any) {
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    return GeneralFunctionsService.parseHourFormatNumber(hours) + ":" + GeneralFunctionsService.parseHourFormatNumber(minutes) + ":" + GeneralFunctionsService.parseHourFormatNumber(seconds);
  }

  static parseHourFormatNumber(number: any) {
    return number < 10 ? "0" + number : number;
  }

  static getStringMonth(month: any) {
    const months = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months[Number(month)];
  }

  getLocation() {
    return new Promise(async (resolve, reject) => {
      navigator.geolocation.getCurrentPosition((position) => {
        resolve (position.coords);
      }, error => {
        reject('Error getting location' + error);
      });
    })
  }
}
