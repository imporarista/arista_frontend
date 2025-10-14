import { Component, OnInit } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Category } from 'src/app/interfaces/category';
import { Product } from 'src/app/interfaces/product';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  categorias: Category[] = [];
  productosDestacados: Product[] = [];
  cargando: boolean = true;
  imageDirectory = 'assets/images/categories/';
  thumbnailsDirectory = 'assets/images/products/thumbnails/';

  constructor(
    public apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    const userId = localStorage.getItem('userId') || '1';
    
    this.apiService.getCategories(userId).subscribe({
      next: (categorias) => this.categorias = categorias,
      error: (err) => console.error('Error cargando categorías', err)
    });

    this.apiService.getProducts('Todos', 0, 0, 8, 'active', 1).subscribe({
      next: (productos) => {
        this.productosDestacados = productos;
        this.cargando = false;
      },
      error: (err) => console.error('Error cargando productos', err)
    });
  }

  irCatalog(catId?: number) {
    if (catId) {
      this.router.navigate(['/home/catalog', catId]);
    } else {
      this.router.navigate(['/home/catalog']);
    }
  }

  verProducto(prod: Product) {
    // Implementar navegación a detalle de producto
    console.log('Ver producto:', prod);
  }
}