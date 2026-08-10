# Offline neural voice notices

This application includes the following components for optional, on-device
English text-to-speech. Inference runs locally in the browser; no text is sent
to a speech API.

- Piper TTS Web, Copyright its contributors, MIT License:
  https://github.com/Mintplex-Labs/piper-tts-web
- Piper en_US-ljspeech-medium and en_US-ljspeech-high voices, distributed by
  the Piper voices project. The application includes 8-bit-quantized ONNX
  variants with unsigned dynamic weights for ONNX Runtime Web/WASM
  compatibility; the LJ Speech source recordings are public domain:
  https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ljspeech/medium
  https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ljspeech/high
- ONNX Runtime, Copyright Microsoft Corporation, MIT License:
  https://github.com/microsoft/onnxruntime
- piper-phonemize and eSpeak NG components, MIT and GPL-compatible upstream
  notices:
  https://github.com/rhasspy/piper-phonemize

The standard and optional HD voice packs are versioned separately from the
vocabulary application so routine content updates do not download them again.
