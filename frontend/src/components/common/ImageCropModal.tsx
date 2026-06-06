import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, ZoomIn, ZoomOut, Check } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  aspectRatio?: number;
  circular?: boolean;
  onClose: () => void;
  onConfirm: (croppedBlob: Blob) => void;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  aspectRatio = 1,
  circular = false,
  onClose,
  onConfirm
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixelsData: any) => {
    setCroppedAreaPixels(croppedAreaPixelsData);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous'); // Evita problemas de CORS al pintar en Canvas
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrcUrl: string,
    pixelCrop: any
  ): Promise<Blob> => {
    const image = await createImage(imageSrcUrl);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No se pudo obtener el contexto 2D del Canvas');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // Pintar la sección recortada en el canvas
    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas vacío'));
          return;
        }
        resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSave = async () => {
    try {
      if (croppedAreaPixels && imageSrc) {
        const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
        onConfirm(croppedBlob);
      }
    } catch (e) {
      console.error('Error recortando imagen', e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800/80 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[520px]">
        {/* Header */}
        <header className="px-6 py-4 bg-zinc-900/40 border-b border-zinc-800/60 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Recortar Imagen</h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">Ajusta el zoom y arrastra para encuadrar la imagen.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all"
          >
            <X size={14} />
          </button>
        </header>

        {/* Cropper Container */}
        <div className="flex-1 relative bg-zinc-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={aspectRatio}
            cropShape={circular ? 'round' : 'rect'}
            showGrid={true}
            onCropChange={setCrop}
            onCropComplete={onCropComplete}
            onZoomChange={setZoom}
            style={{
              containerStyle: { background: '#09090b' },
              cropAreaStyle: { border: '2px solid #10b981' }
            }}
          />
        </div>

        {/* Controls and Footer */}
        <div className="p-6 bg-zinc-950 border-t border-zinc-800/60 space-y-4">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <ZoomOut size={14} className="text-zinc-500" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-emerald-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
            />
            <ZoomIn size={14} className="text-zinc-500" />
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-zinc-300 hover:text-white text-xs font-bold rounded-xl transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/10"
            >
              <Check size={14} />
              <span>Aplicar Recorte</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
