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

  // Variables para el carrusel
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
    if (catId) {
      this.router.navigate(['/home/catalog', catId]);
    } else {
      this.router.navigate(['/home/catalog']);
    }
  }

  verProducto(prod: Product) {
    console.log('Ver producto:', prod);
  }

  // Métodos del carrusel
  siguienteSlide() {
    this.detenerAutoplay(); // Detener autoplay
    this.currentSlide = (this.currentSlide + 1) % this.carouselItems.length;
    this.iniciarAutoplay(); // Reiniciar autoplay
  }

  anteriorSlide() {
    this.detenerAutoplay(); // Detener autoplay
    this.currentSlide = (this.currentSlide - 1 + this.carouselItems.length) % this.carouselItems.length;
    this.iniciarAutoplay(); // Reiniciar autoplay
  }

  irASlide(index: number) {
    this.detenerAutoplay(); // Detener autoplay
    this.currentSlide = index;
    this.iniciarAutoplay(); // Reiniciar autoplay
  }

  pausarAutoplay() {
    this.detenerAutoplay();
  }

  reanudarAutoplay() {
    this.iniciarAutoplay();
  }

  iniciarAutoplay() {
    // Primero detener cualquier autoplay existente
    this.detenerAutoplay();
    // Iniciar nuevo autoplay
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