# backend/utils.py
import io
import numpy as np
import soundfile as sf
from scipy.signal import resample
import scipy.io.wavfile as wavfile

TARGET_SAMPLE_RATE = 16000
TARGET_SAMPLES = 64600  # AASIST input length (~4.0375 seconds at 16kHz)

def preprocess_audio(file_bytes: bytes) -> tuple[np.ndarray, float, int]:
    """
    Decodes audio bytes (WAV, MP3, OGG, WEBM, FLAC), converts to mono,
    resamples to 16kHz, and normalizes/pads to 64600 samples.
    """
    data = None
    sr = TARGET_SAMPLE_RATE

    # Attempt 1: SoundFile (handles standard WAV, FLAC, OGG, and modern MP3)
    try:
        data, sr = sf.read(io.BytesIO(file_bytes))
    except Exception:
        pass

    # Attempt 2: Torchaudio (handles deep/streaming codecs)
    if data is None:
        try:
            import torchaudio
            waveform, sr = torchaudio.load(io.BytesIO(file_bytes))
            data = waveform.squeeze().cpu().numpy()
        except Exception:
            pass

    # Attempt 3: Scipy WAV parser
    if data is None:
        try:
            sr, data = wavfile.read(io.BytesIO(file_bytes))
        except Exception:
            pass

    # Attempt 4: Fallback synthetic noise buffer if format is completely raw/unknown
    if data is None or len(data) == 0:
        raise ValueError("Unsupported audio format or empty audio stream. Please upload a .wav, .mp3, .ogg, or .webm file.")

    # Convert to float32
    if data.dtype != np.float32:
        if np.issubdtype(data.dtype, np.integer):
            max_int = np.iinfo(data.dtype).max
            data = data.astype(np.float32) / float(max_int)
        else:
            data = data.astype(np.float32)

    # Convert stereo to mono by averaging channels
    if data.ndim > 1:
        data = np.mean(data, axis=1)

    duration = float(len(data)) / float(sr)

    # Resample to 16kHz if needed
    if sr != TARGET_SAMPLE_RATE:
        target_len = int(len(data) * TARGET_SAMPLE_RATE / sr)
        data = resample(data, target_len).astype(np.float32)
        sr = TARGET_SAMPLE_RATE

    # Normalize amplitude (-1.0 to 1.0)
    max_val = np.max(np.abs(data))
    if max_val > 1e-6:
        data = data / max_val

    # Pad or repeat/truncate to exactly 64,600 samples for AASIST
    length = len(data)
    if length < TARGET_SAMPLES:
        num_repeats = (TARGET_SAMPLES // length) + 1
        data = np.tile(data, num_repeats)[:TARGET_SAMPLES]
    else:
        data = data[:TARGET_SAMPLES]

    return data, duration, sr
