from django.urls import path
from django.conf import settings
from django.conf.urls.static import static

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
] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
