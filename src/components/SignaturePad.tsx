import React, { useRef, useEffect } from 'react';
import SignaturePad from 'signature_pad';

interface SignaturePadProps {
  onSave: (signatureData: string) => void;
  width?: number;
  height?: number;
}

export function SignaturePadComponent({ onSave, width = 500, height = 200 }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      signaturePadRef.current = new SignaturePad(canvasRef.current);
    }

    return () => {
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
      }
    };
  }, []);

  const handleClear = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
  };

  const handleSave = () => {
    if (signaturePadRef.current && !signaturePadRef.current.isEmpty()) {
      const signatureData = signaturePadRef.current.toDataURL();
      onSave(signatureData);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-2 bg-white">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="border rounded touch-none"
        />
      </div>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={handleClear}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Borrar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Guardar Firma
        </button>
      </div>
    </div>
  );
}