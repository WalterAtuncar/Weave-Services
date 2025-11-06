import { PublicClientApplication, AccountInfo, AuthenticationResult, SilentRequest, RedirectRequest, PopupRequest } from '@azure/msal-browser';
import { 
  ValidarAdResponseData, 
  MsalConfig, 
  FederatedAuthState, 
  FederatedLoginRequest, 
  FederatedLoginResponse 
} from './types/auth.types';
import { authService } from './auth.service';

/**
 * Servicio para manejar autenticación federada con Azure AD usando MSAL
 */
export class FederatedAuthService {
  private msalInstance: PublicClientApplication | null = null;
  private currentConfig: ValidarAdResponseData | null = null;
  private currentAccount: AccountInfo | null = null;

  /**
   * Configurar MSAL con los parámetros dados
   */
  private configureMsal(config: any): void {
    try {
      const msalConfig = {
        auth: {
          clientId: config.clientId,
          authority: `https://login.microsoftonline.com/${config.tenantId}`,
          redirectUri: window.location.origin + '/login',
          postLogoutRedirectUri: window.location.origin
        },
        cache: {
          cacheLocation: 'sessionStorage' as const,
          storeAuthStateInCookie: false
        }
      };

      this.msalInstance = new PublicClientApplication(msalConfig);

      // Inicializar MSAL
      this.msalInstance.initialize().then(() => {
        // Verificar si hay una cuenta activa
        const accounts = this.msalInstance?.getAllAccounts();
        if (accounts && accounts.length > 0) {
        this.currentAccount = accounts[0];
        }
      });
    } catch (error) {
      console.error('❌ Error al configurar MSAL:', error);
      throw error;
    }
  }

  /**
   * Realizar login federado
   */
  async loginFederado(request: any): Promise<any> {
    try {
      if (!this.msalInstance) {
        throw new Error('MSAL no está configurado');
      }

      const loginRequest = {
        scopes: ['openid', 'profile', 'User.Read'],
        prompt: 'select_account'
      };

      const result = await this.msalInstance.loginPopup(loginRequest);

      if (result && result.account) {
      this.currentAccount = result.account;

        // Enviar datos al backend para validación
        const response = await fetch('/api/auth/federated-login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
        accessToken: result.accessToken,
            account: result.account,
            dominio: request.dominio
          })
        });

        const data = await response.json();
        
        return data;
      }
      
      throw new Error('Login federado falló');
    } catch (error) {
      console.error('❌ Error en login federado:', error);
      throw error;
    }
  }

  /**
   * Obtener token silenciosamente
   */
  async getTokenSilently(): Promise<string | null> {
    try {
      if (!this.msalInstance || !this.currentAccount) {
        return null;
      }

      const silentRequest = {
        scopes: ['openid', 'profile', 'User.Read'],
        account: this.currentAccount
      };

      const result = await this.msalInstance.acquireTokenSilent(silentRequest);
      
      return result.accessToken;
    } catch (error) {
      console.error('❌ Error al obtener token silenciosamente:', error);
      return null;
    }
  }

  /**
   * Logout federado
   */
  async logoutFederado(): Promise<void> {
    try {
      if (!this.msalInstance) {
        return;
      }

      const logoutRequest = {
        account: this.currentAccount
      };

      await this.msalInstance.logoutPopup(logoutRequest);
      this.currentAccount = null;
    } catch (error) {
      console.error('❌ Error en logout federado:', error);
      throw error;
    }
  }

  /**
   * Limpiar configuración MSAL
   */
  limpiarConfiguracion(): void {
    try {
      this.msalInstance = null;
      this.currentAccount = null;
    } catch (error) {
      console.error('❌ Error al limpiar configuración MSAL:', error);
    }
  }

  /**
   * Proceso completo de autenticación federada
   */
  async autenticarFederado(dominio: string): Promise<any> {
    try {
      // 1. Validar configuración AD
      const configResponse = await fetch(`/api/auth/validar-ad/${encodeURIComponent(dominio)}`);
      const config = await configResponse.json();
      
      if (!config.success) {
        throw new Error(config.mensaje || 'Configuración AD no válida');
      }

      // 2. Configurar MSAL con los datos obtenidos
      this.configureMsal(config.data);

      // 3. Realizar login federado
      const loginResult = await this.loginFederado({ dominio });

      return loginResult;
    } catch (error) {
      console.error('❌ Error en proceso de autenticación federada:', error);
      throw error;
    }
  }

  /**
   * Verifica si hay una sesión federada activa
   */
  isAuthenticated(): boolean {
    if (!this.msalInstance) return false;
    
    const accounts = this.msalInstance.getAllAccounts();
    return accounts.length > 0;
  }

  /**
   * Obtiene la cuenta activa actual
   */
  getCurrentAccount(): AccountInfo | null {
    return this.currentAccount;
  }

  /**
   * Obtiene el estado actual de autenticación federada
   */
  getAuthState(): FederatedAuthState {
    return {
      isConfigured: this.msalInstance !== null,
      isAuthenticated: this.isAuthenticated(),
      config: this.currentConfig,
      msalInstance: this.msalInstance,
      account: this.currentAccount
    };
  }

  /**
   * Limpia toda la configuración de MSAL
   */
  cleanup(): void {

    this.msalInstance = null;
    this.currentConfig = null;
    this.currentAccount = null;
  }
}

// Exportar instancia singleton
export const federatedAuthService = new FederatedAuthService(); 