class AudioCaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (input && input[0]) {
      const audioData = input[0];
      
      const int16Array = new Int16Array(audioData.length);
      for (let i = 0; i < audioData.length; i++) {
        const sample = Math.max(-1, Math.min(1, audioData[i]));
        int16Array[i] = sample * 32767;
      }
      
      this.port.postMessage(int16Array);
    }
    return true;
  }
}

registerProcessor('audio-capture-processor', AudioCaptureProcessor);