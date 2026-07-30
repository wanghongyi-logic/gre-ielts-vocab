# Offline neural voice notices

This application includes the following components for optional, on-device
English text-to-speech. Inference runs locally in the browser; no text is sent
to a speech API.

- Piper TTS Web, Copyright its contributors, MIT License:
  https://github.com/Mintplex-Labs/piper-tts-web
- Piper en_US-ljspeech-medium voice, MIT-compatible model distribution;
  the LJ Speech source recordings are public domain:
  https://huggingface.co/rhasspy/piper-voices/tree/main/en/en_US/ljspeech/medium
- ONNX Runtime, Copyright Microsoft Corporation, MIT License:
  https://github.com/microsoft/onnxruntime
- piper-phonemize and eSpeak NG components, MIT and GPL-compatible upstream
  notices:
  https://github.com/rhasspy/piper-phonemize

The optional voice pack is versioned separately from the vocabulary
application so routine content updates do not download it again.
