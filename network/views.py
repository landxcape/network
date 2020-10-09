import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required

from .models import User, Posts, Comments


@login_required(login_url="login")
def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required(login_url="login")
def posts(request):
    if request.method == "POST":
        data = json.loads(request.body)
        text = data.get("post_text", "")
        p_form = Posts(
            user_id=request.user,
            text=text
        )
        p_form.save()
    return JsonResponse({"message": "Post network successfully."}, status=201)


@csrf_exempt
@login_required(login_url="login")
def page(request, page):

    # Filter posts returned based on mailbox
    if page == "all_posts":
        posts = Posts.objects.all()
    else:
        return JsonResponse({"error": "Invalid page."}, status=400)

    # Return posts in reverse chronologial order
    posts = posts.order_by("-timestamp").all()
    return JsonResponse([post.serialize() for post in posts], safe=False)
    # return JsonResponse([posts[0]], safe=False)
