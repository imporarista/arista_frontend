import { Injectable } from '@angular/core';
import { constants } from '../../environments/constants';

@Injectable({ providedIn: 'root' })
export class GeneralFunctionsService {
  constructor() {}

  public getCurrentDate() {
    return GeneralFunctionsService.formatDate(new Date());
  }

  public getCurrentDateTime(format: any) {
    return GeneralFunctionsService.formatDateHour(new Date(), format);
  }

  static formatNumberDate(number: any) {
    if (number < 10) number = '0' + number;
    return number;
  }

  static formatDate(date: Date) {
    return (
      date.getFullYear() +
      '-' +
      GeneralFunctionsService.formatNumberDate(date.getMonth() + 1) +
      '-' +
      GeneralFunctionsService.formatNumberDate(date.getDate())
    );
  }

  static formatDateHour(date: Date, format: any) {
    let hours: number | string = date.getHours();
    let minutes: number | string = date.getMinutes();
    let seconds: number | string = date.getSeconds();
    let month: number | string = date.getMonth() + 1;
    let strTime = '';

    minutes = +minutes < 10 ? '0' + minutes : minutes;
    seconds = +seconds < 10 ? '0' + seconds : seconds;

    if (format === constants.DATE_FORMAT.USER) {
      const ampm = +hours >= 12 ? 'pm' : 'am';
      hours = (+hours % 12) || 12;
      strTime = ' ' + hours + ':' + minutes + ' ' + ampm;
    } else if (format === constants.DATE_FORMAT.DATABASE) {
      hours = +hours < 10 ? '0' + hours : hours;
      if (+month < 10) month = '0' + month;
      strTime = ' ' + hours + ':' + minutes + ':' + seconds;
    }

    // ✅ Zero-pad del día (antes no lo hacías)
    const day = GeneralFunctionsService.formatNumberDate(date.getDate());
    return date.getFullYear() + '-' + month + '-' + day + strTime;
  }

  public getTimeFromDateTimeString(timeString: string) {
    const time = timeString.split(' ');
    return this.convertTo12HourFormat(time[1]);
  }

  public convertTo12HourFormat(time: string): string {
    const [hours, minutes, seconds] = time.split(':');
    let hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    const formattedHour = hour < 10 ? '0' + hour : hour.toString();
    return `${formattedHour}:${minutes}:${seconds} ${ampm}`;
  }

  public getDateFromDataTimeString(timeString: string) {
    const time = timeString.split(' ');
    const dataDate = time[0].split('-');
    return dataDate[2] + '/' + GeneralFunctionsService.getStringMonth(dataDate[1]) + '/' + dataDate[0];
  }

  public calculateDifferenceBetweenTimes(dateIni: string, dateEnd: string, typeReturn: any) {
    const from = new Date(dateIni);
    const to = new Date(dateEnd);
    const diff = to.getTime() - from.getTime();

    if (typeReturn === constants.UNITIES.TIME.MILLISECONDS) {
      return diff;
    } else {
      return this.msToTime(diff);
    }
  }

  public msToTime(duration: number) {
    let seconds = Math.floor((duration / 1000) % 60);
    let minutes = Math.floor((duration / (1000 * 60)) % 60);
    let hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    return (
      GeneralFunctionsService.parseHourFormatNumber(hours) +
      ':' +
      GeneralFunctionsService.parseHourFormatNumber(minutes) +
      ':' +
      GeneralFunctionsService.parseHourFormatNumber(seconds)
    );
  }

  static parseHourFormatNumber(number: number) {
    return number < 10 ? '0' + number : number.toString();
  }

  static getStringMonth(month: any) {
    const months = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    return months[Number(month)];
  }

  // ✅ Versión corregida y tipada de getLocation (sin concatenar strings)
  getLocation(options: PositionOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        return reject(new Error('Geolocalización no soportada por el navegador'));
      }
      // En web, Geolocation solo funciona en HTTPS o http://localhost
      if (!(location.protocol === 'https:' || location.hostname === 'localhost')) {
        return reject(new Error('La geolocalización requiere HTTPS (o localhost)'));
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  // ✅ Helper para convertir el error a un mensaje legible
  mapGeoError(err: GeolocationPositionError | any): string {
    if (err && typeof err.code === 'number') {
      switch (err.code) {
        case err.PERMISSION_DENIED:
          return 'Permiso de ubicación denegado por el usuario.';
        case err.POSITION_UNAVAILABLE:
          return 'Ubicación no disponible (sin señal o GPS desactivado).';
        case err.TIMEOUT:
          return 'Se agotó el tiempo para obtener la ubicación.';
      }
    }
    return err?.message || 'No se pudo obtener la ubicación.';
  }
}
