import { Injectable } from '@angular/core';
import { map, Observable, Subject } from 'rxjs';
import { Product } from '../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class DesiredProductsService {

  constructor() { }
  public desiredProductsIds: any = [];
  public desiredProducts: any = [];

  checkProduct(prod_id: any) {
    return new Promise(resolve => {
      if (this.desiredProductsIds.indexOf(prod_id) >= 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  iLike(product: any, update: boolean = false) {
    return new Promise(resolve => {
      // condicion para eliminar
      if (this.desiredProductsIds.indexOf(product.prod_id) >= 0 && (update == false || product.quantity == 0)) {
        // devuelve los productos diferentes al que se esta eliminando
        this.desiredProducts = this.desiredProducts.filter(function (currentProduct: any) {
          return currentProduct.prod_id !== product.prod_id;
        });
        resolve(false);
      } else {
        // agregar producto
        product.quantity = product.quantity? product.quantity: 1;

        if (this.desiredProductsIds.indexOf(product.prod_id) >= 0) {
          const currentProduct = this.desiredProducts.find(p => p.prod_id === product.prod_id);
          currentProduct.quantity = product.quantity;
        } else {
          this.desiredProducts.push(product);
        }

        resolve(true);
      }
      this.desiredProductsIds = [];
      // devuelve solo los ids diferntes al que se esta eliminando
      for (let currentProduct of this.desiredProducts) {
        this.desiredProductsIds.push(currentProduct.prod_id);
      };
    });
  }

  public cartTotalAmount(): number[] {
    const subTotal = this.desiredProducts.reduce((prev, curr: Product) => {
      const price = curr.price;
      return (prev + price * curr.quantity);
    }, 0);
    const iva = subTotal * 0.19;
    const totalPrice = subTotal + iva;
    return [subTotal, iva, totalPrice]
  }
}
