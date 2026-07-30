# Offline neural voice notices

This application includes the following components for optional, on-device
English text-to-speech. Inference runs locally in the browser; no text is sent
to a speech API.

- Kokoro.js, Copyright its contributors, Apache License 2.0:
  https://github.com/hexgrad/kokoro
- Kokoro-82M v1.0 ONNX model, Apache License 2.0:
  https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX
- Transformers.js, Copyright Hugging Face, Apache License 2.0:
  https://github.com/huggingface/transformers.js
- ONNX Runtime, Copyright Microsoft Corporation, MIT License:
  https://github.com/microsoft/onnxruntime
- phonemizer.js / eSpeak NG components, Apache License 2.0 and compatible
  upstream notices:
  https://github.com/xenova/phonemizer.js

The optional voice pack is versioned separately from the vocabulary
application so routine content updates do not download it again.
