export interface Product {
    prod_id: number;
    status: number;
    image: string;
	prod_name: string;
	price: number;
	stock: number;
	prod_descriptions: string;
	quantity?: number;
	cat_id?: number;
}
