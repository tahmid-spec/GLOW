/**
 * Candle Audio Service
 * - Web Audio API & MediaRecorder for 10-second walkie-talkie voice notes
 * - Dynamic waveform extraction and rendering
 * - Tactile sound effects (mic open, chirp, send)
 * - Safe fallback synthetic audio generator if mic is denied
 */

class AudioService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  private recordingStartTime: number = 0;
  private maxDurationTimer: any = null;

  private currentAudioElement: HTMLAudioElement | null = null;

  // Sound effects generator using Web Audio API
  private getContext(): AudioContext {
    if (!this.audioContext || this.audioContext.state === 'suspended') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioCtx();
    }
    return this.audioContext;
  }

  // Play gentle walkie-talkie beep/chirp
  public playWalkieTalkieChirp(type: 'start' | 'stop' | 'send') {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'start') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now); // D5
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.08); // A5
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'stop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(587.33, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'send') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(659.25, now + 0.06); // E5
        osc.frequency.setValueAtTime(783.99, now + 0.12); // G5
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch {
      // Ignore audio synthesis errors on older devices
    }
  }

  // Start recording
  public async startRecording(
    onWaveformUpdate: (amplitudes: number[]) => void,
    onMaxReached: () => void
  ): Promise<boolean> {
    this.playWalkieTalkieChirp('start');
    this.audioChunks = [];
    this.recordingStartTime = Date.now();

    try {
      // Request mic stream
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = this.getContext();
      const source = ctx.createMediaStreamSource(this.micStream);
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      this.mediaRecorder = mimeType ? new MediaRecorder(this.micStream, { mimeType }) : new MediaRecorder(this.micStream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start(100);

      // Start waveform polling loop
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateLoop = () => {
        if (!this.analyser) return;
        this.analyser.getByteFrequencyData(dataArray);

        // Compress into 20 normalized bars
        const barsCount = 20;
        const step = Math.floor(bufferLength / barsCount) || 1;
        const bars: number[] = [];
        for (let i = 0; i < barsCount; i++) {
          const val = dataArray[i * step] || 0;
          bars.push(Math.max(0.12, Math.min(1.0, val / 255)));
        }
        onWaveformUpdate(bars);

        this.animationFrameId = requestAnimationFrame(updateLoop);
      };
      this.animationFrameId = requestAnimationFrame(updateLoop);

      // Strictly stop at 10.0 seconds
      this.maxDurationTimer = setTimeout(() => {
        onMaxReached();
      }, 10000);

      return true;
    } catch (err) {
      console.warn('Microphone permission denied or not available. Using simulated walkie-talkie mode:', err);
      // Start simulated waveform loop so user can still test voice walkie-talkie!
      const startTime = Date.now();
      const simLoop = () => {
        const elapsed = (Date.now() - startTime) / 1000;
        const bars: number[] = [];
        for (let i = 0; i < 20; i++) {
          const wave = Math.sin(elapsed * 6 + i * 0.4) * 0.4 + 0.5;
          bars.push(Math.max(0.15, Math.min(0.95, wave)));
        }
        onWaveformUpdate(bars);
        this.animationFrameId = requestAnimationFrame(simLoop);
      };
      this.animationFrameId = requestAnimationFrame(simLoop);

      this.maxDurationTimer = setTimeout(() => {
        onMaxReached();
      }, 10000);

      return true;
    }
  }

  // Stop recording and retrieve result
  public async stopRecording(): Promise<{
    duration: number;
    audioUrl: string;
    waveform: number[];
  }> {
    this.playWalkieTalkieChirp('stop');
    if (this.maxDurationTimer) {
      clearTimeout(this.maxDurationTimer);
      this.maxDurationTimer = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    const durationSec = Math.min(10, Math.max(0.5, (Date.now() - this.recordingStartTime) / 1000));

    // Sample fallback waveform
    const sampleWaveform: number[] = [];
    for (let i = 0; i < 24; i++) {
      const v = Math.sin(i * 0.6) * 0.35 + 0.55 + (Math.random() * 0.15);
      sampleWaveform.push(Number(v.toFixed(2)));
    }

    // If real mediaRecorder was active
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      return new Promise((resolve) => {
        if (!this.mediaRecorder) return;
        this.mediaRecorder.onstop = async () => {
          const blob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
          const audioUrl = await this.blobToDataUrl(blob);
          this.cleanupMicStream();
          resolve({
            duration: Math.round(durationSec * 10) / 10,
            audioUrl,
            waveform: sampleWaveform
          });
        };
        this.mediaRecorder.stop();
      });
    }

    this.cleanupMicStream();

    // Fallback: generate a lovely synthetic warm voice note audio tone
    const fallbackAudioUrl = await this.generateSyntheticVoiceNoteAudio(durationSec);

    return {
      duration: Math.round(durationSec * 10) / 10,
      audioUrl: fallbackAudioUrl,
      waveform: sampleWaveform
    };
  }

  public cancelRecording() {
    if (this.maxDurationTimer) {
      clearTimeout(this.maxDurationTimer);
      this.maxDurationTimer = null;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
    }
    this.cleanupMicStream();
  }

  private cleanupMicStream() {
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
  }

  // Play audio url with progress callbacks
  public playAudio(
    audioUrl: string,
    onProgress: (progress: number, currentTime: number) => void,
    onEnded: () => void
  ): { stop: () => void } {
    this.stopPlayback();

    // If audioUrl is empty or sample, synthesize audio
    let urlToPlay = audioUrl;
    if (!urlToPlay || urlToPlay.length < 50) {
      // Synthesize demo sound
      this.playSyntheticDemoSound(6, onProgress, onEnded);
      return {
        stop: () => this.stopPlayback()
      };
    }

    const audio = new Audio(urlToPlay);
    this.currentAudioElement = audio;

    audio.ontimeupdate = () => {
      if (audio.duration && audio.duration > 0) {
        onProgress(audio.currentTime / audio.duration, audio.currentTime);
      }
    };

    audio.onended = () => {
      onEnded();
      this.currentAudioElement = null;
    };

    audio.onerror = () => {
      // Fallback to synthetic sound if browser codec rejects data
      this.playSyntheticDemoSound(4, onProgress, onEnded);
    };

    audio.play().catch(() => {
      this.playSyntheticDemoSound(4, onProgress, onEnded);
    });

    return {
      stop: () => {
        if (this.currentAudioElement) {
          this.currentAudioElement.pause();
          this.currentAudioElement = null;
        }
      }
    };
  }

  public stopPlayback() {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement = null;
    }
  }

  // Helper to convert blob to base64 data url
  private blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // Generates a self-contained WAV audio file with warm chords for simulated voice playback
  private async generateSyntheticVoiceNoteAudio(durationSec: number): Promise<string> {
    const sampleRate = 22050;
    const numSamples = Math.floor(sampleRate * durationSec);
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF identifier
    this.writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    this.writeString(view, 8, 'WAVE');
    this.writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    this.writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Generate gentle ambient melody
    const notes = [261.63, 329.63, 392.0, 523.25]; // C, E, G, C
    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const noteIndex = Math.floor(t * 1.5) % notes.length;
      const freq = notes[noteIndex];
      const envelope = Math.exp(-((t % (1 / 1.5)) * 3));
      const sample = Math.sin(2 * Math.PI * freq * t) * envelope * 0.25;
      const intSample = Math.max(-32768, Math.min(32767, sample * 32767));
      view.setInt16(offset, intSample, true);
      offset += 2;
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return this.blobToDataUrl(blob);
  }

  private writeString(view: DataView, offset: number, string: string) {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  }

  private playSyntheticDemoSound(
    duration: number,
    onProgress: (p: number, t: number) => void,
    onEnded: () => void
  ) {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(554.37, ctx.currentTime + duration * 0.5);
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.start();
      osc.stop(ctx.currentTime + duration);

      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= duration) {
          clearInterval(interval);
          onEnded();
        } else {
          onProgress(elapsed / duration, elapsed);
        }
      }, 100);
    } catch {
      setTimeout(onEnded, duration * 1000);
    }
  }
}

export const audioService = new AudioService();
