import * as faceapi from 'face-api.js';

class FaceRecognitionService {
  private static instance: FaceRecognitionService;
  private isLoaded: boolean = false;
  private MODEL_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

  private constructor() {}

  public static getInstance(): FaceRecognitionService {
    if (!FaceRecognitionService.instance) {
      FaceRecognitionService.instance = new FaceRecognitionService();
    }
    return FaceRecognitionService.instance;
  }

  public async loadModels() {
    if (this.isLoaded) return;
    
    try {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri(this.MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(this.MODEL_URL),
      ]);
      this.isLoaded = true;
      console.log('Face models loaded successfully');
    } catch (error) {
      console.error('Error loading face models:', error);
      throw error;
    }
  }

  public async getFaceEmbedding(input: HTMLImageElement | HTMLCanvasElement): Promise<Float32Array | null> {
    await this.loadModels();
    const result = await faceapi
      .detectSingleFace(input)
      .withFaceLandmarks()
      .withFaceDescriptor();
    
    return result ? result.descriptor : null;
  }

  public async detectAllFaces(input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
    await this.loadModels();
    return await faceapi.detectAllFaces(input).withFaceLandmarks().withFaceDescriptors();
  }

  public euclideanDistance(v1: Float32Array, v2: Float32Array): number {
    return Math.sqrt(v1.reduce((acc, cur, i) => acc + Math.pow(cur - v2[i], 2), 0));
  }

  // Find matches between detected faces and saved student embeddings
  public findMatches(detectedFaces: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection; }>>[], students: { id: string; name: string; descriptor: Float32Array }[]) {
    return detectedFaces.map(detected => {
      let bestMatch = { id: 'unknown', name: 'Unknown', distance: 1.0 };
      
      students.forEach(student => {
        const distance = this.euclideanDistance(detected.descriptor, student.descriptor);
        if (distance < 0.6 && distance < bestMatch.distance) {
          bestMatch = { id: student.id, name: student.name, distance };
        }
      });

      return {
        ...bestMatch,
        box: detected.detection.box
      };
    });
  }
}

export const faceService = FaceRecognitionService.getInstance();
