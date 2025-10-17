import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService } from 'src/app/services/api.service';
import { Category } from 'src/app/interfaces/category';
import { Product } from 'src/app/interfaces/product';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  categorias: Category[] = [];
  productosDestacados: Product[] = [];
  cargando: boolean = true;
  imageDirectory = 'assets/images/categories/';
  thumbnailsDirectory = 'assets/images/products/thumbnails/';

  
  currentSlide: number = 0;
  carouselItems = [
    { title: 'CALIDAD', text: 'Antenas certificadas y garantizadas' },
    { title: 'VARIEDAD', text: 'Amplio catálogo de modelos' },
    { title: 'EXPERIENCIA', text: 'Más de 10 años en el mercado' }
  ];
  autoplayInterval: any;

  constructor(
    public apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.iniciarAutoplay();
  }

  ngOnDestroy(): void {
    this.detenerAutoplay();
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
    
    if (!this.estaLogueado()) {
      
      this.router.navigate(['/login']);
      return;
    }

   
    if (catId) {
      this.router.navigate(['/home/catalog', catId]);
    } else {
      this.router.navigate(['/home/catalog']);
    }
  }

 
  verProducto(prod: Product) {
    if (!this.estaLogueado()) { 
      this.router.navigate(['/login']);
      return;
    }

    console.log('Ver producto:', prod);
  }


  estaLogueado(): boolean {
    return localStorage.getItem('userId') !== null;
  }


  irALogin() {
    if (!this.estaLogueado()) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/home/catalog']);
    }
  }

  siguienteSlide() {
    this.detenerAutoplay();
    this.currentSlide = (this.currentSlide + 1) % this.carouselItems.length;
    this.iniciarAutoplay();
  }

  anteriorSlide() {
    this.detenerAutoplay();
    this.currentSlide = (this.currentSlide - 1 + this.carouselItems.length) % this.carouselItems.length;
    this.iniciarAutoplay();
  }

  irASlide(index: number) {
    this.detenerAutoplay();
    this.currentSlide = index;
    this.iniciarAutoplay();
  }

  pausarAutoplay() {
    this.detenerAutoplay();
  }

  reanudarAutoplay() {
    this.iniciarAutoplay();
  }

  iniciarAutoplay() {
    this.detenerAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.currentSlide = (this.currentSlide + 1) % this.carouselItems.length;
    }, 5000);
  }

  detenerAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
}