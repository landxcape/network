from django.contrib import admin

from .models import User, Posts, Comments

# Register your models here.
admin.site.register(User)
admin.site.register(Posts)
admin.site.register(Comments)
