// Files Module
class FilesManager {
  constructor() {
    this.attachments = [];
  }

  async uploadFile(taskId, file) {
    try {
      // Validate file
      if (!this.validateFile(file)) {
        throw new Error('Invalid file');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('task_id', taskId);

      // In a real implementation, this would use the API
      // For demo, we'll simulate upload
      await this.simulateUpload(file);

      notifications.show('success', 'File uploaded successfully');
      return { filename: file.name, size: file.size };
    } catch (error) {
      console.error('Error uploading file:', error);
      notifications.show('error', 'Failed to upload file');
      throw error;
    }
  }

  validateFile(file) {
    // Check file size
    if (file.size > CONFIG.FILE_UPLOAD.maxSize) {
      notifications.show('error', 'File size exceeds 10MB limit');
      return false;
    }

    // Check file type
    if (!CONFIG.FILE_UPLOAD.allowedTypes.includes(file.type)) {
      notifications.show('error', 'File type not allowed');
      return false;
    }

    return true;
  }

  simulateUpload(file) {
    return new Promise((resolve) => {
      setTimeout(resolve, 1000);
    });
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }
}

const files = new FilesManager();
