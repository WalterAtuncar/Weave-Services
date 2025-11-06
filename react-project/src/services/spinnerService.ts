// Tipo para el callback de cambio de estado
type SpinnerCallback = (isVisible: boolean, loadingText?: string) => void;

class SpinnerService {
  private callbacks: SpinnerCallback[] = [];
  private isVisible: boolean = false;
  private loadingText: string = '';

  /**
   * Registra un callback para escuchar cambios en el estado del spinner
   */
  subscribe(callback: SpinnerCallback): () => void {
    this.callbacks.push(callback);
    
    // Retorna función para desuscribirse
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  /**
   * Muestra el spinner con texto opcional
   */
  show(textLoading?: string): void {
    if (!this.isVisible) {
      this.isVisible = true;
      this.loadingText = textLoading || '';
      this.notifyCallbacks();
    }
  }

  /**
   * Oculta el spinner
   */
  hide(): void {
    if (this.isVisible) {
      this.isVisible = false;
      this.loadingText = '';
      this.notifyCallbacks();
    }
  }

  /**
   * Retorna el estado actual del spinner
   */
  getState(): boolean {
    return this.isVisible;
  }

  /**
   * Retorna el texto de carga actual
   */
  getLoadingText(): string {
    return this.loadingText;
  }

  /**
   * Notifica a todos los callbacks registrados
   */
  private notifyCallbacks(): void {
    this.callbacks.forEach(callback => callback(this.isVisible, this.loadingText));
  }
}

// Exportar una instancia singleton
export const spinnerService = new SpinnerService(); 