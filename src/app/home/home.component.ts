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
  
  // Variable para controlar el estado del menú móvil
  menuMovilAbierto: boolean = false;
  
  currentSlide: number = 0;
  carouselItems = [
    { 
      title: 'PIJAMAs', 
      text: 'Amplia variedad de diseños',
      image: 'assets/images/PIJAMA.jpeg'
    },
    { 
      title: 'PINES', 
      text: 'Accesorios de calidad certificada',
      image: 'assets/images/PINES.jpeg'
    },
    { 
      title: 'PLUMILLAS', 
      text: 'Tecnología y durabilidad',
      image: 'assets/images/PLUMILLAS.jpeg'
    }
  ];

  currentAboutSlide: number = 0;
  aboutImages: string[] = [
    'assets/images/PORTADA.jpeg',
    'assets/images/PORTADA2.jpeg',
  ];

  autoplayInterval: any;
  aboutAutoplayInterval: any;

  constructor(
    public apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
    this.iniciarAutoplay();
    this.iniciarAboutAutoplay();
  }

  ngOnDestroy(): void {
    this.detenerAutoplay();
    this.detenerAboutAutoplay();
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

  // Método para alternar el menú móvil
  toggleMenuMovil() {
    this.menuMovilAbierto = !this.menuMovilAbierto;
  }

  // Método para cerrar el menú móvil
  cerrarMenuMovil() {
    this.menuMovilAbierto = false;
  }

  irCatalog(catId?: number) {
    this.cerrarMenuMovil(); // Cerrar menú al navegar
    
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
    this.cerrarMenuMovil(); // Cerrar menú al navegar
    
    if (!this.estaLogueado()) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/home/catalog']);
    }
  }

  navegarA(seccion: string) {
    this.cerrarMenuMovil(); // Cerrar menú al navegar
    
    // Scroll suave a la sección
    const elemento = document.querySelector(seccion);
    if (elemento) {
      elemento.scrollIntoView({ behavior: 'smooth' });
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
    }, 7000);
  }

  detenerAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }
  
  iniciarAboutAutoplay() {
    this.detenerAboutAutoplay();
    this.aboutAutoplayInterval = setInterval(() => {
      this.currentAboutSlide = (this.currentAboutSlide + 1) % this.aboutImages.length;
    }, 7000);
  }

  detenerAboutAutoplay() {
    if (this.aboutAutoplayInterval) {
      clearInterval(this.aboutAutoplayInterval);
      this.aboutAutoplayInterval = null;
    }
  }
}