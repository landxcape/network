import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
# from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth.decorators import login_required
from django.core.paginator import Paginator

from .models import User, Posts, Comments


posts_per_page = 10


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
    data = json.loads(request.body)

    # Filter posts returned based on mailbox
    if page == "all_posts":
        posts = Posts.objects.all()
    elif page == "posts_following":
        posts = Posts.objects.filter(user_id__followers=(
            User.objects.get(username=request.user.username)))
        print("posts", posts)
    elif page.split('-')[0] == 'username':
        posts = Posts.objects.filter(
            user_id=User.objects.get(username=page.split('-')[1]))
    else:
        return JsonResponse({"error": "Invalid page."}, status=400)

    # Return posts in reverse chronologial order
    posts = posts.order_by("-timestamp").all()

    paginator = Paginator(posts, posts_per_page)
    page_number = data.get("page")
    page_obj = paginator.get_page(page_number)

    return JsonResponse({
        "has_previous": page_obj.has_previous(),
        "has_next": page_obj.has_next(),
        "previous_page_number": page_obj.previous_page_number() if page_obj.has_previous() else 1,
        "current_page": page_obj.number,
        "next_page_number": page_obj.next_page_number() if page_obj.has_next() else page_obj.paginator.num_pages,
        "total_pages": page_obj.paginator.num_pages,
        "object_list": [post.serialize(request.user) for post in page_obj.object_list]
    })


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


@login_required(login_url="login")
def profile(request, username):
    if request.method == "POST":
        # Query for requested post
        try:
            user = User.objects.get(username=request.user.username)
        except user.DoesNotExist:
            return JsonResponse({"error": "user not found."}, status=404)

        data = json.loads(request.body)
        if data.get("follow_check") is not None:
            return JsonResponse({
                "follow_check": user.followings.filter(username=data["follow_check"]).exists()
            })
        elif data.get("get_counts") is not None:
            return JsonResponse({
                "posts_count": Posts.objects.filter(user_id=User.objects.get(username=username)).count(),
                "following_count": User.objects.get(username=username).followings.count(),
                "followers_count": User.objects.get(username=username).followers.count()
            })
        elif data.get("follow") is not None:
            if user.followings.filter(username=data["follow"]).exists():
                user.followings.remove(
                    User.objects.get(username=data["follow"]))
                message = "removed"
            else:
                user.followings.add(
                    User.objects.get(username=data["follow"]))
                message = "added"
            return JsonResponse({
                "follow_check": user.followings.filter(username=data["follow"]).exists()
            })
        elif data.get("get_follow"):
            if data["get_follow"] == "get_followers":
                follows = User.objects.get(
                    username=username).followers.all()
            elif data["get_follow"] == "get_followings":
                follows = User.objects.get(
                    username=username).followings.all()
            follows = follows.order_by("username")
            follows = [follow.username for follow in follows]
            return JsonResponse(follows, safe=False)
        else:
            return JsonResponse({"error": "invalid request"})

    return JsonResponse({
        "username": username,
    })
