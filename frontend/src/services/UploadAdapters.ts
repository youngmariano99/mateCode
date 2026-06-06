export interface IUploadAdapter {
  uploadImage(file: Blob | File): Promise<string>;
  uploadRawFile(file: File): Promise<string>;
}

export class CloudinaryUploadAdapter implements IUploadAdapter {
  private cloudName: string;
  private uploadPreset: string;

  constructor() {
    // Lectura de variables de entorno de Vite o fallbacks
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';
  }

  async uploadImage(file: Blob | File): Promise<string> {
    return this.upload(file, 'image');
  }

  async uploadRawFile(file: File): Promise<string> {
    // Límite de tamaño del cliente: 20 MB
    const MAX_SIZE = 20 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error('El archivo supera el límite permitido de 20 MB.');
    }
    return this.upload(file, 'auto');
  }

  private async upload(file: Blob | File, resourceType: 'image' | 'auto'): Promise<string> {
    if (!this.cloudName || !this.uploadPreset) {
      // Si no hay keys cargadas, lanzar un error claro para el usuario
      throw new Error('Cloudinary no está configurado. Carga las variables VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET.');
    }

    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/${resourceType}/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorJson;
      try {
        errorJson = JSON.parse(errorText);
      } catch {
        /* ignore */
      }
      throw new Error(errorJson?.error?.message || 'Error al subir el archivo a Cloudinary.');
    }

    const data = await response.json();
    return data.secure_url;
  }
}

// Adaptador simulado de prueba para cuando las credenciales no estén listas
export class MockUploadAdapter implements IUploadAdapter {
  async uploadImage(file: Blob | File): Promise<string> {
    console.log('Mock upload de imagen ejecutándose...', file);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop');
      }, 1000);
    });
  }

  async uploadRawFile(file: File): Promise<string> {
    console.log('Mock upload de archivo ejecutándose...', file);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
      }, 1000);
    });
  }
}

export const UploadAdapterFactory = {
  getAdapter(): IUploadAdapter {
    const provider = import.meta.env.VITE_STORAGE_PROVIDER || 'cloudinary';
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    // Si está configurado Cloudinary y las llaves existen, usarlo. De lo contrario, usar Mock para no trabar el dev
    if (provider === 'cloudinary' && cloudName && uploadPreset) {
      return new CloudinaryUploadAdapter();
    }
    
    return new MockUploadAdapter();
  }
};
