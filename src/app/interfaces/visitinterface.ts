export interface Visitinterface {
    // id del cliente que se visita
    visitCustomerId: number;
    // nobre del cliente
    visitCustomerName: string;
    // id del vendedor logueado
    visitSellerId: number;
    // hora de inicio de la visita
    visitStartTime: string;
    // hora de fin de la visita
    visitEndTime: string;
    // lugar en que se realizó la visita
    visitCoordinates: string;
    // monto de la venta si la hubo
    visitTotalSale: number;
    // razon por la que no hubo venta
    visitNoSaleReason: string;
    // identifica si se realizó una venta
    visitHasSale?: number;
    // indica el id con que se guardó en la web
    visitId?: number;
    // tiempo gastado en visita en milisegundos
    visitSpendTime: any;
}
