const fs = require('fs');
const path = require('path');
const config = require('../../config/test.config');

/**
 * VideoRecorder - Helper class for recording test execution videos
 *
 * Provides automatic video recording using Appium's built-in screen recording
 * capabilities for both Android and iOS platforms.
 */
class VideoRecorder {
  constructor(driver, platform, testName = 'test') {
    this.driver = driver;
    this.platform = platform.toLowerCase();
    this.testName = testName;
    this.isRecording = false;
    this.videoPath = null;
  }

  /**
   * Start recording screen
   * @param {Object} options - Recording options
   * @returns {Promise<boolean>} - Success status
   */
  async startRecording(options = {}) {
    if (!this.driver) {
      console.warn('⚠️  No driver available for video recording');
      return false;
    }

    if (this.isRecording) {
      console.warn('⚠️  Recording already in progress');
      return false;
    }

    try {
      const recordingOptions = this.getRecordingOptions(options);

      console.log(`🎥 Starting video recording (${this.platform})...`);

      if (this.platform === 'android') {
        await this.driver.startRecordingScreen(recordingOptions);
      } else if (this.platform === 'ios') {
        await this.driver.startRecordingScreen(recordingOptions);
      } else {
        console.warn(`⚠️  Video recording not supported for platform: ${this.platform}`);
        return false;
      }

      this.isRecording = true;
      console.log('✅ Video recording started');
      return true;
    } catch (error) {
      console.error('❌ Failed to start video recording:', error.message);
      return false;
    }
  }

  /**
   * Stop recording and save video
   * @param {string} filename - Optional filename (without extension)
   * @returns {Promise<string|null>} - Path to saved video or null
   */
  async stopRecording(filename) {
    if (!this.isRecording) {
      console.warn('⚠️  No recording in progress');
      return null;
    }

    try {
      console.log('🎥 Stopping video recording...');

      // Stop recording and get base64 video data
      const videoBase64 = await this.driver.stopRecordingScreen();

      if (!videoBase64) {
        console.error('❌ No video data received');
        this.isRecording = false;
        return null;
      }

      // Save video to file
      const videoPath = await this.saveVideo(videoBase64, filename);

      this.isRecording = false;
      this.videoPath = videoPath;

      console.log(`✅ Video saved: ${videoPath}`);
      return videoPath;
    } catch (error) {
      console.error('❌ Failed to stop video recording:', error.message);
      this.isRecording = false;
      return null;
    }
  }

  /**
   * Save base64 video data to file
   * @param {string} videoBase64 - Base64 encoded video
   * @param {string} filename - Filename without extension
   * @returns {Promise<string>} - Path to saved file
   */
  async saveVideo(videoBase64, filename) {
    // Ensure videos directory exists
    const videosDir = config.videos?.path || path.join(process.cwd(), 'videos');
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const videoFilename = filename
      ? `${filename}-${this.platform}-${timestamp}.mp4`
      : `${this.testName}-${this.platform}-${timestamp}.mp4`;

    const videoPath = path.join(videosDir, videoFilename);

    // Convert base64 to buffer and save
    const videoBuffer = Buffer.from(videoBase64, 'base64');
    fs.writeFileSync(videoPath, videoBuffer);

    return videoPath;
  }

  /**
   * Get platform-specific recording options
   * @param {Object} customOptions - Custom options to override defaults
   * @returns {Object} - Recording options
   */
  getRecordingOptions(customOptions = {}) {
    const baseOptions = {
      videoQuality: customOptions.quality || 'medium',
      videoType: 'mp4',
      timeLimit: customOptions.timeLimit || '600', // 10 minutes max
    };

    if (this.platform === 'android') {
      return {
        ...baseOptions,
        videoSize: customOptions.videoSize || '720x1280',
        bitRate: customOptions.bitRate || '4000000', // 4 Mbps
        bugReport: customOptions.bugReport || 'false',
      };
    } else if (this.platform === 'ios') {
      return {
        ...baseOptions,
        videoScale: customOptions.videoScale || '75:100', // 75% scale
        videoFps: customOptions.videoFps || '10', // 10 fps
      };
    }

    return baseOptions;
  }

  /**
   * Check if recording is in progress
   * @returns {boolean}
   */
  isCurrentlyRecording() {
    return this.isRecording;
  }

  /**
   * Get the path of the last recorded video
   * @returns {string|null}
   */
  getLastVideoPath() {
    return this.videoPath;
  }

  /**
   * Clean up old videos (keep last N videos)
   * @param {number} keepCount - Number of videos to keep
   */
  static cleanupOldVideos(keepCount = 10) {
    try {
      const videosDir = config.videos?.path || path.join(process.cwd(), 'videos');

      if (!fs.existsSync(videosDir)) {
        return;
      }

      const files = fs.readdirSync(videosDir)
        .filter(file => file.endsWith('.mp4'))
        .map(file => ({
          name: file,
          path: path.join(videosDir, file),
          time: fs.statSync(path.join(videosDir, file)).mtime.getTime(),
        }))
        .sort((a, b) => b.time - a.time); // Newest first

      // Delete old videos
      if (files.length > keepCount) {
        const filesToDelete = files.slice(keepCount);
        filesToDelete.forEach(file => {
          fs.unlinkSync(file.path);
          console.log(`🗑️  Deleted old video: ${file.name}`);
        });
        console.log(`✅ Cleaned up ${filesToDelete.length} old video(s)`);
      }
    } catch (error) {
      console.error('❌ Failed to cleanup videos:', error.message);
    }
  }

  /**
   * Get video file size in MB
   * @param {string} videoPath - Path to video file
   * @returns {number} - Size in MB
   */
  static getVideoSize(videoPath) {
    try {
      if (!fs.existsSync(videoPath)) {
        return 0;
      }
      const stats = fs.statSync(videoPath);
      return (stats.size / (1024 * 1024)).toFixed(2);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get total size of all videos
   * @returns {number} - Total size in MB
   */
  static getTotalVideosSize() {
    try {
      const videosDir = config.videos?.path || path.join(process.cwd(), 'videos');

      if (!fs.existsSync(videosDir)) {
        return 0;
      }

      const files = fs.readdirSync(videosDir)
        .filter(file => file.endsWith('.mp4'));

      let totalSize = 0;
      files.forEach(file => {
        const filePath = path.join(videosDir, file);
        const stats = fs.statSync(filePath);
        totalSize += stats.size;
      });

      return (totalSize / (1024 * 1024)).toFixed(2);
    } catch (error) {
      return 0;
    }
  }
}

module.exports = VideoRecorder;
