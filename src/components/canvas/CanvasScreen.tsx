import React, { useRef, useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Undo2, 
  Redo2, 
  Send, 
  Eraser, 
  Sparkles, 
  RotateCcw, 
  Check, 
  Trash2,
  Smile,
  Type
} from 'lucide-react';
import { CanvasStroke, CanvasSticker, DoodleItem, UserProfile } from '../../types';
import { storage } from '../../services/storage';
import confetti from 'canvas-confetti';

interface CanvasScreenProps {
  currentUser: UserProfile;
  partner: UserProfile;
  pairId: string;
  onBack: () => void;
  onDoodleSent: () => void;
}

const PALETTE = [
  { name: 'pink', value: '#F5A8D0' },
  { name: 'cyan', value: '#79E6DF' },
  { name: 'yellow', value: '#FFE28A' },
  { name: 'purple', value: '#BBA2FF' },
  { name: 'white', value: '#F8F6FC' },
];

const STICKER_PRESETS = [
  { text: 'you\'re special', color: '#BBA2FF' },
  { text: 'miss you ♡', color: '#F5A8D0' },
  { text: 'better together', color: '#79E6DF' },
  { text: 'love you ✨', color: '#FFE28A' }
];

export const CanvasScreen: React.FC<CanvasScreenProps> = ({
  currentUser,
  partner,
  pairId,
  onBack,
  onDoodleSent
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<CanvasStroke[]>([]);
  const [redoStack, setRedoStack] = useState<CanvasStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<CanvasStroke | null>(null);
  const [stickers, setStickers] = useState<CanvasSticker[]>([]);
  
  // Tool state
  const [activeColor, setActiveColor] = useState<string>('#F5A8D0');
  const [brushSize, setBrushSize] = useState<number>(4);
  const [isEraser, setIsEraser] = useState<boolean>(false);
  const [showSizePicker, setShowSizePicker] = useState<boolean>(false);
  const [showStickerTray, setShowStickerTray] = useState<boolean>(false);
  const [mode, setMode] = useState<'canvas' | 'direct'>('direct');
  const [isSending, setIsSending] = useState(false);

  // Load initial canvas state or prefill with lovely starter art if empty
  useEffect(() => {
    // If pair has saved canvas strokes in storage
    const myPair = storage.getMyPair();
    if (myPair.pair && myPair.pair.canvasStrokes.length > 0) {
      setStrokes(myPair.pair.canvasStrokes);
      setStickers(myPair.pair.canvasStickers || []);
    } else {
      // Seed initial cute drawing matching mockup
      const seedStrokes: CanvasStroke[] = [
        {
          points: [
            { x: 140, y: 150 }, { x: 180, y: 90 }, { x: 220, y: 140 }, 
            { x: 180, y: 200 }, { x: 140, y: 150 }
          ],
          color: '#F5A8D0',
          size: 4.5
        }
      ];
      const seedStickers: CanvasSticker[] = [
        { id: 'st1', type: 'text', text: "you're special", x: 130, y: 260, scale: 1.2, color: '#BBA2FF' },
        { id: 'st2', type: 'star', x: 90, y: 220, scale: 1, color: '#FFE28A' },
        { id: 'st3', type: 'sparkle', x: 250, y: 230, scale: 1, color: '#79E6DF' }
      ];
      setStrokes(seedStrokes);
      setStickers(seedStickers);
    }
  }, [pairId]);

  // Re-draw canvas whenever strokes or stickers change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High DPI scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Draw background (dark #11101A)
    ctx.fillStyle = '#11101A';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Helper to draw a single stroke
    const renderStroke = (stroke: CanvasStroke) => {
      if (stroke.points.length === 0) return;
      ctx.beginPath();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = stroke.isEraser ? '#11101A' : stroke.color;
      ctx.lineWidth = stroke.isEraser ? stroke.size * 3 : stroke.size;

      if (stroke.points.length === 1) {
        ctx.arc(stroke.points[0].x, stroke.points[0].y, stroke.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = stroke.isEraser ? '#11101A' : stroke.color;
        ctx.fill();
        return;
      }

      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        const xc = (stroke.points[i - 1].x + stroke.points[i].x) / 2;
        const yc = (stroke.points[i - 1].y + stroke.points[i].y) / 2;
        ctx.quadraticCurveTo(stroke.points[i - 1].x, stroke.points[i - 1].y, xc, yc);
      }
      ctx.stroke();
    };

    // Draw all strokes
    strokes.forEach(renderStroke);
    if (currentStroke) {
      renderStroke(currentStroke);
    }

    // Draw stickers & text
    stickers.forEach((st) => {
      ctx.save();
      ctx.translate(st.x, st.y);
      if (st.type === 'text' && st.text) {
        ctx.font = `600 ${Math.floor(18 * st.scale)}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = st.color;
        ctx.textAlign = 'center';
        ctx.fillText(st.text, 0, 0);
      } else if (st.type === 'star') {
        ctx.strokeStyle = st.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        drawStarPath(ctx, 0, 0, 5, 12 * st.scale, 6 * st.scale);
        ctx.stroke();
      } else if (st.type === 'sparkle') {
        ctx.strokeStyle = st.color;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        drawSparklePath(ctx, 0, 0, 10 * st.scale);
        ctx.stroke();
      } else if (st.type === 'heart') {
        ctx.fillStyle = st.color;
        ctx.beginPath();
        ctx.arc(-4 * st.scale, -4 * st.scale, 5 * st.scale, 0, Math.PI * 2);
        ctx.arc(4 * st.scale, -4 * st.scale, 5 * st.scale, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    ctx.restore();
  }, [strokes, currentStroke, stickers]);

  const drawStarPath = (ctx: CanvasRenderingContext2D, cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number) => {
    let rot = Math.PI / 2 * 3;
    let x = cx;
    let y = cy;
    const step = Math.PI / spikes;

    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
  };

  const drawSparklePath = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) => {
    ctx.moveTo(cx, cy - size);
    ctx.quadraticCurveTo(cx, cy, cx + size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy + size);
    ctx.quadraticCurveTo(cx, cy, cx - size, cy);
    ctx.quadraticCurveTo(cx, cy, cx, cy - size);
    ctx.closePath();
  };

  // Mouse / Touch drawing handlers
  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if ('touches' in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const newStroke: CanvasStroke = {
      points: [{ x, y }],
      color: activeColor,
      size: brushSize,
      isEraser
    };
    setCurrentStroke(newStroke);
    setRedoStack([]);
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!currentStroke) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    setCurrentStroke((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        points: [...prev.points, { x, y }]
      };
    });
  };

  const handlePointerUp = () => {
    if (currentStroke && currentStroke.points.length > 0) {
      setStrokes((prev) => [...prev, currentStroke]);
      setCurrentStroke(null);
    }
  };

  const handleUndo = () => {
    if (strokes.length === 0) return;
    const last = strokes[strokes.length - 1];
    setStrokes((prev) => prev.slice(0, prev.length - 1));
    setRedoStack((prev) => [...prev, last]);
  };

  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    setRedoStack((prev) => prev.slice(0, prev.length - 1));
    setStrokes((prev) => [...prev, next]);
  };

  const handleClear = () => {
    if (window.confirm('Clear canvas?')) {
      setStrokes([]);
      setStickers([]);
      setRedoStack([]);
    }
  };

  const handleAddPresetSticker = (preset: { text: string; color: string }) => {
    const canvas = canvasRef.current;
    const width = canvas ? canvas.clientWidth : 300;
    const height = canvas ? canvas.clientHeight : 400;

    const newSticker: CanvasSticker = {
      id: `st_${Date.now()}`,
      type: 'text',
      text: preset.text,
      x: width / 2 + (Math.random() * 40 - 20),
      y: height / 2 + (Math.random() * 40 - 20),
      scale: 1.1,
      color: preset.color
    };
    setStickers((prev) => [...prev, newSticker]);
    setShowStickerTray(false);
  };

  const handleAddShapeSticker = (type: 'star' | 'sparkle' | 'heart') => {
    const canvas = canvasRef.current;
    const width = canvas ? canvas.clientWidth : 300;
    const height = canvas ? canvas.clientHeight : 400;

    const newSticker: CanvasSticker = {
      id: `st_${Date.now()}`,
      type,
      x: width / 2 + (Math.random() * 60 - 30),
      y: height / 2 + (Math.random() * 60 - 30),
      scale: 1.2,
      color: activeColor
    };
    setStickers((prev) => [...prev, newSticker]);
    setShowStickerTray(false);
  };

  // Save or Send Doodle
  const handleSend = () => {
    setIsSending(true);
    const canvas = canvasRef.current;
    const previewUrl = canvas ? canvas.toDataURL('image/png') : '';

    const newDoodle: Omit<DoodleItem, 'id' | 'createdAt'> = {
      pairId,
      authorId: currentUser.id,
      authorName: currentUser.displayName,
      authorAvatar: currentUser.avatar,
      title: mode === 'direct' ? 'Doodle for you' : 'Our Canvas update',
      strokes,
      stickers,
      previewUrl,
      mode
    };

    storage.addDoodle(newDoodle);

    confetti({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.5 },
      colors: ['#F5A8D0', '#79E6DF', '#FFE28A', '#BBA2FF']
    });

    setTimeout(() => {
      setIsSending(false);
      onDoodleSent();
    }, 400);
  };

  return (
    <div className="flex flex-col h-screen bg-[#11101A] text-[#F8F6FC] select-none overflow-hidden">
      {/* Top Bar matching mockup */}
      <div className="flex items-center justify-between px-5 py-3.5 z-20 bg-[#11101A]/90 backdrop-blur-md border-b border-[#242132]/60">
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-[#1B1927] border border-[#272336] flex items-center justify-center text-[#AAA5B8] hover:text-[#F8F6FC] transition-colors"
        >
          <ArrowLeft size={18} />
        </button>

        {/* Mode Toggle Pill */}
        <div className="flex items-center p-1 bg-[#1B1927] border border-[#272336] rounded-full">
          <button
            onClick={() => setMode('direct')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              mode === 'direct' ? 'bg-[#BBA2FF] text-[#11101A] shadow' : 'text-[#AAA5B8]'
            }`}
          >
            Draw for {partner.displayName}
          </button>
          <button
            onClick={() => setMode('canvas')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
              mode === 'canvas' ? 'bg-[#BBA2FF] text-[#11101A] shadow' : 'text-[#AAA5B8]'
            }`}
          >
            Our Canvas
          </button>
        </div>

        {/* Action icons: Undo, Redo, Send */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={strokes.length === 0}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#AAA5B8] hover:text-[#F8F6FC] disabled:opacity-30 transition-colors"
          >
            <Undo2 size={17} />
          </button>

          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#AAA5B8] hover:text-[#F8F6FC] disabled:opacity-30 transition-colors"
          >
            <Redo2 size={17} />
          </button>

          <button
            onClick={handleSend}
            disabled={isSending || (strokes.length === 0 && stickers.length === 0)}
            className="w-10 h-10 rounded-full bg-[#BBA2FF] text-[#11101A] flex items-center justify-center font-bold shadow-md shadow-[#BBA2FF]/20 hover:scale-105 active:scale-95 disabled:opacity-40 transition-all ml-1"
          >
            <Send size={16} />
          </button>
        </div>
      </div>

      {/* Main Drawing Canvas */}
      <div className="relative flex-1 w-full touch-none overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Ambient subtle corner glow */}
        <div className="absolute top-10 left-10 w-48 h-48 bg-[#BBA2FF]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#F5A8D0]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Floating Sticker Tray Dropdown */}
        {showStickerTray && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-[#1B1927]/95 border border-[#2E2842] backdrop-blur-xl rounded-2xl p-3 shadow-2xl z-30 max-w-xs w-[90%] animate-in fade-in zoom-in-95">
            <div className="text-[11px] font-bold text-[#AAA5B8] uppercase tracking-wider mb-2">
              Cute Stamps & Words
            </div>
            
            {/* Word Stickers */}
            <div className="grid grid-cols-2 gap-2 mb-2.5">
              {STICKER_PRESETS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAddPresetSticker(item)}
                  className="px-2.5 py-1.5 rounded-xl bg-[#151320] border border-[#262136] text-xs font-semibold hover:border-[#BBA2FF] text-left transition-colors truncate"
                  style={{ color: item.color }}
                >
                  {item.text}
                </button>
              ))}
            </div>

            {/* Shape Stamps */}
            <div className="flex items-center justify-around pt-2 border-t border-[#262136]">
              <button
                onClick={() => handleAddShapeSticker('heart')}
                className="p-2 rounded-xl bg-[#151320] hover:bg-[#251E33] text-[#F5A8D0]"
                title="Heart"
              >
                ♡ Heart
              </button>
              <button
                onClick={() => handleAddShapeSticker('star')}
                className="p-2 rounded-xl bg-[#151320] hover:bg-[#251E33] text-[#FFE28A]"
                title="Star"
              >
                ☆ Star
              </button>
              <button
                onClick={() => handleAddShapeSticker('sparkle')}
                className="p-2 rounded-xl bg-[#151320] hover:bg-[#251E33] text-[#79E6DF]"
                title="Sparkle"
              >
                ✨ Sparkle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Bottom Toolbar Matching Mockup Screen 5 */}
      <div className="px-4 pb-6 pt-2 z-20">
        <div className="max-w-xs mx-auto flex items-center justify-between px-3 py-2.5 rounded-full bg-[#1B1927]/95 backdrop-blur-xl border border-[#2B273E] shadow-2xl">
          {/* Pen Tool toggle */}
          <button
            onClick={() => {
              setIsEraser(false);
            }}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
              !isEraser ? 'bg-[#2B2544] text-[#BBA2FF]' : 'text-[#AAA5B8] hover:text-[#F8F6FC]'
            }`}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isEraser ? '#7D788E' : activeColor }} />
          </button>

          {/* Color Palette Bubbles */}
          <div className="flex items-center gap-2">
            {PALETTE.map((c) => {
              const isSelected = !isEraser && activeColor === c.value;
              return (
                <button
                  key={c.name}
                  onClick={() => {
                    setActiveColor(c.value);
                    setIsEraser(false);
                  }}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    isSelected ? 'scale-125 ring-2 ring-[#F8F6FC]' : 'hover:scale-110 opacity-90'
                  }`}
                  style={{ backgroundColor: c.value }}
                />
              );
            })}
          </div>

          {/* Brush Size Indicator */}
          <button
            onClick={() => {
              const nextSize = brushSize === 3 ? 6 : brushSize === 6 ? 10 : 3;
              setBrushSize(nextSize);
            }}
            className="w-8 h-8 rounded-full bg-[#151320] flex items-center justify-center text-xs font-bold text-[#AAA5B8] hover:text-[#F8F6FC] transition-colors"
          >
            {brushSize === 3 ? '1' : brushSize === 6 ? '2' : '3'}
          </button>

          {/* Eraser Tool */}
          <button
            onClick={() => setIsEraser(!isEraser)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isEraser ? 'bg-[#F5A8D0] text-[#11101A]' : 'text-[#AAA5B8] hover:text-[#F8F6FC]'
            }`}
          >
            <Eraser size={16} />
          </button>

          {/* Sticker Tray Toggle */}
          <button
            onClick={() => setShowStickerTray(!showStickerTray)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              showStickerTray ? 'bg-[#79E6DF] text-[#11101A]' : 'text-[#AAA5B8] hover:text-[#F8F6FC]'
            }`}
          >
            <Sparkles size={16} />
          </button>

          {/* Clear button */}
          <button
            onClick={handleClear}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#7D788E] hover:text-[#FF7D90] transition-colors"
            title="Clear all"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};
