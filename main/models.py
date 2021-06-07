from django.db import models


class User(models.Model):
    login = models.CharField(max_length=400)
    github_id = models.BigIntegerField()
    created_at = models.DateTimeField(auto_now_add=True)


class Repository(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    name = models.CharField(max_length=200)
    github_id = models.BigIntegerField()
