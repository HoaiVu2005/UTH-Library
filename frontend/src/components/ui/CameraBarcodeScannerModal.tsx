import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ScanLine,
  Upload,
  Image as ImageIcon,
  HelpCircle,
  SwitchCamera,
  Flashlight,
  Sparkles,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { BrowserMultiFormatReader, BrowserCodeReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

interface CameraBarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (scannedCode: string) => void;
  title?: string;
  description?: string;
}

export const CameraBarcodeScannerModal: React.FC<CameraBarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'Quét mã vạch / QR trực tiếp bằng Camera',
  description = 'Hướng Camera vào Mã QR, Mã vạch trên Thẻ sinh viên hoặc Bìa sách để nhận diện',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);

  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [isDecodingImage, setIsDecodingImage] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);

  // Audio Beep feedback
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1950;
      gain.gain.value = 0.25;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.12);
    } catch (e) {
      // AudioContext blocked
    }
  };

  const handleDetected = (code: string) => {
    const cleaned = code.trim();
    if (!cleaned) return;
    playBeep();
    setLastScannedCode(cleaned);

    // Stop scanner immediately
    if (controlsRef.current) {
      try {
        controlsRef.current.stop();
        controlsRef.current = null;
      } catch (e) {
        // ignore
      }
    }

    setTimeout(() => {
      onScanSuccess(cleaned);
      onClose();
    }, 400);
  };

  // Enumerate camera devices
  useEffect(() => {
    if (!isOpen) return;

    if (navigator?.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((allDevices) => {
          const videoDevices = allDevices.filter((d) => d.kind === 'videoinput');
          setDevices(videoDevices);
          if (videoDevices.length > 0 && !selectedDeviceId) {
            const backCam = videoDevices.find((d) =>
              /back|rear|sau|environment/i.test(d.label)
            );
            setSelectedDeviceId(backCam ? backCam.deviceId : videoDevices[0].deviceId);
          }
        })
        .catch((err) => {
          console.warn('Cannot list camera devices', err);
        });
    }
  }, [isOpen, selectedDeviceId]);

  // Start Real-Time Live Video Scanning Loop (Dual Engine: Native BarcodeDetector + ZXing)
  useEffect(() => {
    if (!isOpen) {
      if (controlsRef.current) {
        try {
          controlsRef.current.stop();
          controlsRef.current = null;
        } catch (e) {
          // ignore
        }
      }
      setLastScannedCode(null);
      setCameraError(null);
      setTorchOn(false);
      setHasTorch(false);
      return;
    }

    setIsInitializing(true);
    setCameraError(null);
    setLastScannedCode(null);

    let isScanningActive = true;
    let detectorTimer: any = null;

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.CODE_128,
      BarcodeFormat.EAN_13,
      BarcodeFormat.CODE_39,
      BarcodeFormat.UPC_A,
      BarcodeFormat.ITF,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);

    const codeReader = new BrowserMultiFormatReader(hints, { delayBetweenScanAttempts: 80 });

    const startScanner = async () => {
      try {
        if (!videoRef.current) return;

        // Check if browser context allows camera access
        if (!navigator?.mediaDevices?.getUserMedia) {
          throw new Error(
            'Trình duyệt yêu cầu kết nối HTTPS bảo mật để mở Camera trực tiếp trên điện thoại.'
          );
        }

        const deviceIdToUse = selectedDeviceId || undefined;
        let controls: any;

        try {
          const hdConstraints: MediaStreamConstraints = {
            video: {
              deviceId: deviceIdToUse ? { exact: deviceIdToUse } : undefined,
              facingMode: deviceIdToUse ? undefined : { ideal: 'environment' },
              width: { ideal: 1920 },
              height: { ideal: 1080 },
            },
          };
          controls = await codeReader.decodeFromConstraints(
            hdConstraints,
            videoRef.current,
            (result) => {
              if (result && result.getText() && isScanningActive) {
                isScanningActive = false;
                handleDetected(result.getText());
              }
            }
          );
        } catch (errConstraints) {
          controls = await codeReader.decodeFromVideoDevice(
            deviceIdToUse,
            videoRef.current,
            (result) => {
              if (result && result.getText() && isScanningActive) {
                isScanningActive = false;
                handleDetected(result.getText());
              }
            }
          );
        }

        controlsRef.current = controls;
        setIsInitializing(false);

        // Native BarcodeDetector Acceleration Loop (60 FPS hardware scanner on Android Chrome)
        if ('BarcodeDetector' in window) {
          try {
            const nativeDetector = new (window as any).BarcodeDetector({
              formats: ['qr_code', 'code_128', 'ean_13', 'code_39', 'upc_a'],
            });

            const runNativeDetection = async () => {
              if (!isScanningActive || !videoRef.current) return;
              if (videoRef.current.readyState >= 2) {
                try {
                  const detected = await nativeDetector.detect(videoRef.current);
                  if (detected && detected.length > 0 && detected[0].rawValue && isScanningActive) {
                    isScanningActive = false;
                    handleDetected(detected[0].rawValue);
                    return;
                  }
                } catch (e) {
                  // ignore frame error
                }
              }
              if (isScanningActive) {
                detectorTimer = setTimeout(runNativeDetection, 70);
              }
            };
            detectorTimer = setTimeout(runNativeDetection, 200);
          } catch (e) {
            // BarcodeDetector fallback to ZXing
          }
        }

        // Check Torch support
        try {
          const stream = videoRef.current?.srcObject as MediaStream;
          const track = stream?.getVideoTracks()[0];
          if (track && (track.getCapabilities as any)?.().torch) {
            setHasTorch(true);
          }
        } catch (e) {
          // Torch check not supported
        }
      } catch (err: any) {
        console.warn('Live camera error:', err);
        setIsInitializing(false);
        const errMsg = err?.message || String(err);
        if (errMsg.includes('HTTPS') || !window.isSecureContext) {
          setCameraError(
            'Trình duyệt di động chặn mở Camera qua HTTP thông thường. Vui lòng chuyển sang đường dẫn HTTPS để quét trực tiếp.'
          );
        } else if (err?.name === 'NotAllowedError' || errMsg.includes('Permission')) {
          setCameraError(
            'Bạn chưa cấp quyền truy cập Camera. Vui lòng nhấn vào biểu tượng ổ khóa/cài đặt trên thanh địa chỉ và chọn "Cho phép Camera".'
          );
        } else {
          setCameraError('Không thể mở Camera trực tiếp: ' + errMsg);
        }
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 120);

    return () => {
      isScanningActive = false;
      clearTimeout(timer);
      if (detectorTimer) clearTimeout(detectorTimer);
      if (controlsRef.current) {
        try {
          controlsRef.current.stop();
          controlsRef.current = null;
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isOpen, selectedDeviceId]);

  // Toggle Torch if supported
  const toggleTorch = async () => {
    try {
      const stream = videoRef.current?.srcObject as MediaStream;
      const track = stream?.getVideoTracks()[0];
      if (track) {
        const nextState = !torchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      }
    } catch (e) {
      console.warn('Cannot toggle torch', e);
    }
  };

  // Multi-pass barcode decoder for phone photos (handles high-res 12MP+, rotation 90deg, and central crop)
  const decodeMultiPass = async (img: HTMLImageElement): Promise<string | null> => {
    // 1. Try Native BarcodeDetector if available (hardware-accelerated on Android Chrome)
    if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      try {
        const detector = new (window as any).BarcodeDetector({
          formats: ['code_128', 'ean_13', 'code_39', 'qr_code', 'upc_a', 'itf'],
        });
        const detected = await detector.detect(img);
        if (detected && detected.length > 0 && detected[0].rawValue) {
          return detected[0].rawValue;
        }
      } catch (e) {
        // Fallback to ZXing
      }
    }

    const hints = new Map();
    hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.CODE_128,
      BarcodeFormat.EAN_13,
      BarcodeFormat.CODE_39,
      BarcodeFormat.QR_CODE,
      BarcodeFormat.UPC_A,
      BarcodeFormat.ITF,
    ]);
    hints.set(DecodeHintType.TRY_HARDER, true);
    const codeReader = new BrowserMultiFormatReader(hints);

    // Compute downscaled size (max 1280px) to prevent OOM and match 1D line sampling density
    const maxDim = 1280;
    let targetWidth = img.naturalWidth || img.width;
    let targetHeight = img.naturalHeight || img.height;

    if (targetWidth > maxDim || targetHeight > maxDim) {
      if (targetWidth > targetHeight) {
        targetHeight = Math.round((targetHeight * maxDim) / targetWidth);
        targetWidth = maxDim;
      } else {
        targetWidth = Math.round((targetWidth * maxDim) / targetHeight);
        targetHeight = maxDim;
      }
    }

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return null;

    // Pass 1: Standard orientation (0 degrees)
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
    try {
      const res = codeReader.decodeFromCanvas(canvas);
      if (res && res.getText()) return res.getText();
    } catch (e) {
      // continue
    }

    // Pass 2: Rotated 90 degrees (essential for mobile portrait photos where 1D bars become vertical!)
    canvas.width = targetHeight;
    canvas.height = targetWidth;
    ctx.save();
    ctx.translate(targetHeight / 2, targetWidth / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
    ctx.restore();
    try {
      const res = codeReader.decodeFromCanvas(canvas);
      if (res && res.getText()) return res.getText();
    } catch (e) {
      // continue
    }

    // Pass 3: Rotated 270 degrees
    canvas.width = targetHeight;
    canvas.height = targetWidth;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(targetHeight / 2, targetWidth / 2);
    ctx.rotate((270 * Math.PI) / 180);
    ctx.drawImage(img, -targetWidth / 2, -targetHeight / 2, targetWidth, targetHeight);
    ctx.restore();
    try {
      const res = codeReader.decodeFromCanvas(canvas);
      if (res && res.getText()) return res.getText();
    } catch (e) {
      // continue
    }

    // Pass 4: Central Crop 75% at 0 degrees (zooms in on barcode, removes background clutter)
    const cropW = Math.round(targetWidth * 0.75);
    const cropH = Math.round(targetHeight * 0.75);
    const cropX = Math.round((targetWidth - cropW) / 2);
    const cropY = Math.round((targetHeight - cropH) / 2);

    canvas.width = cropW;
    canvas.height = cropH;
    ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
    try {
      const res = codeReader.decodeFromCanvas(canvas);
      if (res && res.getText()) return res.getText();
    } catch (e) {
      // continue
    }

    // Pass 5: Central Crop rotated 90 degrees
    canvas.width = cropH;
    canvas.height = cropW;
    ctx.save();
    ctx.translate(cropH / 2, cropW / 2);
    ctx.rotate((90 * Math.PI) / 180);
    ctx.drawImage(img, cropX, cropY, cropW, cropH, -cropW / 2, -cropH / 2, cropW, cropH);
    ctx.restore();
    try {
      const res = codeReader.decodeFromCanvas(canvas);
      if (res && res.getText()) return res.getText();
    } catch (e) {
      // continue
    }

    return null;
  };

  // Decode from uploaded image or camera snapshot
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsDecodingImage(true);
    setCameraError(null);

    const url = URL.createObjectURL(file);
    const img = new Image();
    img.src = url;

    img.onload = async () => {
      try {
        const decodedText = await decodeMultiPass(img);

        if (decodedText) {
          handleDetected(decodedText);
        } else {
          setCameraError(
            'Không tìm thấy mã vạch hoặc mã QR trong ảnh. Mẹo: Khi chụp, hãy giữ máy ảnh thẳng, song song với mã và đủ ánh sáng.'
          );
        }
      } catch (err: any) {
        setCameraError('Không thể nhận diện mã từ ảnh. Vui lòng chụp rõ nét hơn hoặc nhập mã trực tiếp.');
      } finally {
        setIsDecodingImage(false);
        URL.revokeObjectURL(url);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (captureInputRef.current) captureInputRef.current.value = '';
      }
    };

    img.onerror = () => {
      setIsDecodingImage(false);
      setCameraError('Lỗi đọc ảnh từ thiết bị.');
      URL.revokeObjectURL(url);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (captureInputRef.current) captureInputRef.current.value = '';
    };
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) return;
    handleDetected(manualInput.trim());
  };

  const toggleCamera = () => {
    if (devices.length <= 1) return;
    const currentIndex = devices.findIndex((d) => d.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setSelectedDeviceId(devices[nextIndex].deviceId);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title={title}>
      <ModalBody>
        <p className="text-xs text-textSecondary mb-2.5">
          {description}
        </p>

        {/* Viewfinder Container */}
        <div className="relative w-full aspect-video sm:aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
          {/* Success Flash Overlay */}
          {lastScannedCode && (
            <div className="absolute inset-0 bg-emerald-600/95 text-white flex flex-col items-center justify-center z-30 animate-in fade-in zoom-in-95 duration-150">
              <CheckCircle2 className="w-16 h-16 text-white mb-2 animate-bounce" />
              <p className="text-sm font-semibold tracking-wide">QUÉT THÀNH CÔNG!</p>
              <p className="text-xl font-mono font-bold mt-1 bg-black/30 px-4 py-1.5 rounded-xl shadow-inner border border-white/20">
                {lastScannedCode}
              </p>
            </div>
          )}

          {/* Decoding Image Overlay */}
          {isDecodingImage && (
            <div className="absolute inset-0 bg-slate-950/90 text-white flex flex-col items-center justify-center z-30">
              <RefreshCw className="w-10 h-10 text-teal-400 animate-spin mb-3" />
              <p className="text-sm font-semibold">Đang giải mã ảnh chụp...</p>
              <p className="text-xs text-slate-400 mt-1">Đang phân tích Mã vạch và Mã QR</p>
            </div>
          )}

          {/* Video Live Stream Viewfinder */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Loading Indicator */}
          {isInitializing && !cameraError && (
            <div className="absolute inset-0 bg-slate-900/85 text-white flex flex-col items-center justify-center z-20">
              <RefreshCw className="w-8 h-8 text-teal-400 animate-spin mb-2" />
              <p className="text-xs text-slate-300">Đang khởi động Camera trực tiếp...</p>
            </div>
          )}

          {/* Viewfinder Target Graphic: Live Laser Line & Corner Guides */}
          {!cameraError && !lastScannedCode && (
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-4">
              <div className="relative w-72 sm:w-88 h-48 sm:h-56 border border-teal-400/40 rounded-2xl bg-teal-500/[0.02] shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                <div className="absolute -top-1 -left-1 w-7 h-7 border-t-[3.5px] border-l-[3.5px] border-teal-400 rounded-tl-xl drop-shadow-[0_0_4px_#2dd4bf]" />
                <div className="absolute -top-1 -right-1 w-7 h-7 border-t-[3.5px] border-r-[3.5px] border-teal-400 rounded-tr-xl drop-shadow-[0_0_4px_#2dd4bf]" />
                <div className="absolute -bottom-1 -left-1 w-7 h-7 border-b-[3.5px] border-l-[3.5px] border-teal-400 rounded-bl-xl drop-shadow-[0_0_4px_#2dd4bf]" />
                <div className="absolute -bottom-1 -right-1 w-7 h-7 border-b-[3.5px] border-r-[3.5px] border-teal-400 rounded-br-xl drop-shadow-[0_0_4px_#2dd4bf]" />
                <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-red-500/80 to-transparent shadow-[0_0_8px_#ef4444] animate-pulse top-1/2 -translate-y-1/2" />
              </div>

              <div className="mt-4 px-3.5 py-1.5 bg-black/75 backdrop-blur-md rounded-full border border-white/10 text-center flex items-center gap-1.5 shadow-lg">
                <ScanLine className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
                <span className="text-[11.5px] text-slate-200 font-medium">
                  Đưa Mã QR hoặc Mã vạch vào giữa khung hình để quét tức thì
                </span>
              </div>
            </div>
          )}

          {/* Camera Error Message with One-Click HTTPS Switch */}
          {cameraError && (
            <div className="absolute inset-0 bg-slate-900/95 text-white flex flex-col items-center justify-center p-6 text-center z-20">
              <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
              <p className="text-sm font-semibold mb-1">Cần quyền Camera để quét trực tiếp</p>
              <p className="text-xs text-slate-300 max-w-sm mb-4 leading-relaxed">{cameraError}</p>
              
              <div className="flex flex-col sm:flex-row items-center gap-2.5">
                {typeof window !== 'undefined' && window.location.protocol === 'http:' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      window.location.href = window.location.href.replace('http:', 'https:');
                    }}
                    className="bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-slate-900" />
                    Chuyển sang HTTPS để mở Camera trực tiếp
                  </Button>
                )}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => captureInputRef.current?.click()}
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <Camera className="w-3.5 h-3.5 mr-1.5" />
                  Chụp ảnh quét dự phòng
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Helpful Scanning Tips */}
        <div className="mt-2.5 p-2.5 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-2 text-[12px] text-teal-900">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong>Mẹo nhận diện:</strong> Hệ thống tự động đọc cả <strong>Mã vạch Code128</strong> (trên bìa/gáy sách) và <strong>Mã QR</strong> (trên Thẻ sinh viên). Khi quét bằng máy ảnh điện thoại, chỉ cần chụp rõ nét là máy nhận diện trong 0.05 giây!
          </div>
        </div>

        {/* Hidden File Input for Native Camera Snapshot (Works on mobile HTTP & HTTPS!) */}
        <input
          ref={captureInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Hidden File Input for Image Upload from Gallery */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* Action Controls Toolbar */}
        <div className="mt-3.5 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {devices.length > 1 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleCamera}
                className="text-xs"
                title="Chuyển đổi giữa các Camera"
              >
                <SwitchCamera className="w-3.5 h-3.5 mr-1.5 text-brand" />
                Đổi Camera ({devices.length})
              </Button>
            )}

            {hasTorch && (
              <Button
                variant="secondary"
                size="sm"
                onClick={toggleTorch}
                className={`text-xs ${torchOn ? 'bg-amber-100 text-amber-800 border-amber-300' : ''}`}
                title="Bật/Tắt đèn pin hỗ trợ quét"
              >
                <Flashlight className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                {torchOn ? 'Tắt đèn' : 'Bật đèn'}
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => captureInputRef.current?.click()}
              className="text-xs text-slate-600 hover:text-slate-900"
              title="Chụp ảnh quét dự phòng nếu camera gặp khó khăn"
            >
              <Camera className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Chụp ảnh phụ
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              isLoading={isDecodingImage}
              className="text-xs"
              title="Chọn ảnh chụp mã có sẵn trong thư viện"
            >
              <Upload className="w-3.5 h-3.5 mr-1.5 text-brand" />
              Tải ảnh từ máy
            </Button>
          </div>

          {/* Quick manual code input */}
          <form onSubmit={handleManualSubmit} className="flex items-center gap-1.5 w-full sm:w-auto">
            <input
              type="text"
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder="Nhập mã (VD: SV20260001, KS1V019483)..."
              className="text-xs font-mono px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand flex-1 sm:w-64"
            />
            <Button variant="primary" size="sm" type="submit" disabled={!manualInput.trim()}>
              Nhận diện
            </Button>
          </form>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="secondary" size="sm" onClick={onClose}>
          Đóng
        </Button>
      </ModalFooter>
    </Modal>
  );
};
