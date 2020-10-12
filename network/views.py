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


@login_required(login_url="login")
def page(request, page):

    # Filter posts returned based on mailbox
    if page == "all_posts":
        posts = Posts.objects.all()
    elif page.split('-')[0] == 'username':
        posts_user = Posts.objects.filter(
            user_id=User.objects.get(username=page.split('-')[1]))
        posts_user = posts_user.order_by("-timestamp").all()
        return JsonResponse([post.serialize(request.user) for post in posts_user], safe=False)
    else:
        return JsonResponse({"error": "Invalid page."}, status=400)

    # Return posts in reverse chronologial order
    posts = posts.order_by("-timestamp").all()
    return JsonResponse([post.serialize(request.user) for post in posts], safe=False)


@login_required(login_url="login")
def post(request, post_id):
    # Query for requested post
    try:
        post = Posts.objects.get(pk=post_id)
    except Posts.DoesNotExist:
        return JsonResponse({"error": "Post not found."}, status=404)

    # Return post contents
    if request.method == "GET":
        return JsonResponse(post.serialize(request.user) | post.get_comments())

    # Update whether post like/unlike
    elif request.method == "PUT":
        data = json.loads(request.body)
        keys = []
        if data.get("like") is not None:
            if data["like"]:
                post.likes.add(request.user)
            else:
                post.likes.remove(request.user)
            keys = ["likes", "check_liked"]
        elif data.get("comment") is not None:
            comment = Comments(
                user_id=request.user,
                text=data["comment"]
            )
            comment.save()
            post.comments_id.add(comment)
            post.save()
            return JsonResponse(post.get_comments())
        elif data.get("text") is not None and request.user.username == post.user_id.username:
            post.text = data["text"]
            keys = ["text"]
        post.save()
        return JsonResponse({key: post.serialize(request.user)[key] for key in keys})

    # Post must be via GET or PUT
    else:
        return JsonResponse({
            "error": "GET or PUT request required."
        }, status=400)


def profile(request, username):
    posts = Posts.objects.filter(user_id=User.objects.get(username=username))
    posts.order_by("-timestamp").all()
    return JsonResponse({
        "username": username,
        "posts": [post.serialize(request.user) for post in posts],
    })
