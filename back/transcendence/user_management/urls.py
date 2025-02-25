from django.contrib import admin
from django.urls import path, re_path, include
from .views import *

urlpatterns = [
	re_path('login', login.as_view()),
	re_path('signup', signup.as_view()),
	re_path('logout', logout.as_view()),
	re_path('profile', profile.as_view()),
	re_path('update_user', UpdateUser.as_view()),
	re_path('user_avatar', UserAvatar.as_view()),
	re_path('add_friend', AddFriend.as_view()),
	re_path('remove_friend', RemoveFriend.as_view()),
	re_path('friends_list', FriendsList.as_view()),
	re_path('users_list', UsersList.as_view()),
    re_path('verify-2fa', Verify2FA.as_view()),
    re_path("auth/42/", FortyTwoOAuthLogin.as_view(), name="fortytwo-login"),
    re_path("auth/42/callback/", FortyTwoOAuthCallback.as_view(), name="fortytwo-callback"),
    re_path("resetpass", ResetPasswordRequestView.as_view()),
    re_path("verify-otp-reset-password", VerifyOTPResetPasswordView.as_view()),
    
	]
