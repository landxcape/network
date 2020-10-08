from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField(
        "User", blank=True, related_name="followers")


class Post(models.Model):
    user_id = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="posts")
    text = models.CharField(max_length=1000)
    likes = models.IntegerField()
    comments_id = models.ManyToManyField(
        "Comments", blank=True, related_name="post_id")
    timestamp = models.DateTimeField(auto_now_add=True)

    def serialize(self):
        return {
            "id": self.id,
            "poster": self.user_id.username,
            "text": self.text,
            "likes": self.likes,
            "comments": [
                {
                    'id': comment.id,
                    "username": comment.user_id.username,
                    "text": comment.text,
                    "timestamp": comment.timestamp
                } for comment in self.comments_id.all()
            ],
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p")
        }


class Comments(models.Model):
    user_id = models.ForeignKey(
        "User", on_delete=models.CASCADE, related_name="comments")
    text = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
