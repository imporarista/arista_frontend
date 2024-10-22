import { Category } from './../interfaces/category';
import { Customerinterface } from '../interfaces/customerinterface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { Orderlistinterface } from '../interfaces/orderlistinterface';
import { Visitinterface } from '../interfaces/visitinterface';
import { Subcategory } from '../interfaces/subcategory';
import { Product } from '../interfaces/product';
import { CacheService } from './cache.service';
import { of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  private apiUrl: string;
  public imageDirectory: string;
  public thumbnailsDirectory: string;

  nameSelector = 'Todos';

  constructor(
    private httpClient: HttpClient,
    private cacheService: CacheService
  ) {
    this.apiUrl = 'https://aristaws.kijhotechnologies.com/';
    this.imageDirectory = 'https://arista.kijhotechnologies.com/uploads/images/';
    this.thumbnailsDirectory = 'https://arista.kijhotechnologies.com/uploads/images/thumbnails/';
  }

  getPriceRate(rateId: number) {
    return this.httpClient.get(this.apiUrl + 'priceRate/' + rateId);
  }

  getPriceRateId(userId: any) {
    return this.httpClient.get(this.apiUrl + 'priceRateId/' + userId);
  }

  getCategories(userId: any):  Observable<Category[]>  {
    return this.httpClient.get<Category[]>(this.apiUrl + 'categoryListApp/' + userId);
  }

  getSubCategories(userId: any):  Observable<Subcategory[]>  {
    return this.httpClient.get<Subcategory[]>(this.apiUrl + 'subCategoryList');
  }

  getProducts(selector: string, id: number, start: number, limit: number ,statusProduct: string, priceRate: number): Observable<Product[]> {
    const data = {
      selector,
      id,
      start,
      statusProduct,
      priceRate,
      limit
    };
    const url = this.apiUrl + 'getProducts/' + JSON.stringify(data);
    const cacheurl = 'product-' + selector + '-' + id + '-' + start + '-' + statusProduct + '-' + priceRate;
    const cacheData = this.cacheService.get(cacheurl);
    if (cacheData) {
      return of(cacheData);
    }
    return this.httpClient.get<Product[]>(url.toString())
    .pipe(
      tap(data => {
        this.cacheService.put(cacheurl, data)
      })
    );
  }

  getImagesProduct(id: any): Observable<Array<any>> {
    const data = {"prod_id":id}
    return this.httpClient.get<Array<any>>(this.apiUrl + 'getImagesProduct/' + JSON.stringify(data));
  }

  getImages() {
    return this.httpClient.get(this.apiUrl + 'images');
  }

  getLastRegistAction() {
    const url = this.apiUrl + 'regist_action_last_id';
    // const cacheData = this.cacheService.get(url.toString());
    // if (cacheData) {
    //   return of(cacheData);
    // }
    return this.httpClient.get(url)
    // .pipe(
    //   tap(data => {
    //     this.cacheService.put(url.toString(), data)
    //   })
    // );
  }

  getRegistAction(lastId: any) {
    return this.httpClient.get(this.apiUrl + 'regist_action/' + lastId);
  }

  sendOrder(order: any) {
    const dataOrder = JSON.stringify(order);
    return this.httpClient.post(this.apiUrl + 'order', {dataOrder});
  }

  removeUser(userId: number, userType: number) {
    const removeUser = JSON.stringify(userId);
    return this.httpClient.post(`${this.apiUrl}user/${userId}/remove_user/${userType}`, {});
  }

  updateCustomerLocation(localization: any) {
    const customerLocation = JSON.stringify(localization);
    return this.httpClient.post(this.apiUrl + 'customer_location', {customerLocation});
  }

  loginUser(objectUserData: any) {
    const userData = JSON.stringify(objectUserData);
    return this.httpClient.get(this.apiUrl + 'login_user/' + userData);
  }

  registerView(userId: any) {
    return this.httpClient.get(this.apiUrl + 'register_view_user/' + userId);
  }

  getCustomersSeller(userId: string) {
    return this.httpClient.get<Array<Customerinterface>>(this.apiUrl + 'get_customers_seller/' + userId);
  }
  saveVisit(visit: Visitinterface) {
    const dataVisit =  JSON.stringify(visit);
    return this.httpClient.post(this.apiUrl + 'visit', {dataVisit})
  }

  getSellerVisit(date: any, userId: string) {
    return this.httpClient.get<Array<Visitinterface>>(this.apiUrl + 'get_seller_visit/' + userId + '/' + date);
  }

  getCustomerOrders(customerId: any) {
    return this.httpClient.get<Array<Orderlistinterface>>(this.apiUrl + 'get_customer_orders/' + customerId);
  }

  getCustomerOrderDetail(orderId: any) {
    return this.httpClient.get(this.apiUrl + 'get_customer_order_detail/' + orderId);
  }
}
