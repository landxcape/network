from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("posts", views.posts, name="posts"),
    path("posts/<int:post_id>", views.post, name="post"),
    path("posts/<str:page>", views.page, name="page"),
    path("profile/<str:username>", views.profile, name="profile")
]
