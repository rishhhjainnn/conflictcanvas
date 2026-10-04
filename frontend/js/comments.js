// Comments Module
class CommentsManager {
  constructor() {
    this.comments = [];
  }

  async getComments(taskId) {
    try {
      this.comments = await api.getComments(taskId);
      return this.comments;
    } catch (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }
  }

  async addComment(taskId, content) {
    try {
      const comment = await api.addComment(taskId, { content });
      this.comments.push(comment);
      notifications.show('success', 'Comment added');
      return comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      notifications.show('error', 'Failed to add comment');
      throw error;
    }
  }
}

const comments = new CommentsManager();
