## logs
from django.http import HttpResponse
import logging

## cash
from django.core.cache import cache  # To store OTP temporarily
from django.contrib.auth.hashers import make_password

## oauth
import requests
from django.shortcuts import redirect
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token


#2FA
import random
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.views import APIView
from django.http import JsonResponse

from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import *
from .models import CustomUser
from rest_framework import status
from rest_framework import serializers
from rest_framework import views
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from django.shortcuts import get_object_or_404
from rest_framework.decorators import authentication_classes, permission_classes
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated
from django.core.exceptions import ValidationError
from django.http import FileResponse
from rest_framework.exceptions import APIException
from rest_framework.generics import ListAPIView
from django.db.models import Q
from django.contrib.contenttypes.models import ContentType

User = get_user_model()

### reset pass
class ResetPasswordRequestView(views.APIView):

    def post(self, request):
        email = request.data['email']

        # Check if the email exists in the database
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': ['email-not-found']}, status=status.HTTP_400_BAD_REQUEST)

        # Generate a random OTP (6-digit code)
        otp_code = str(random.randint(100000, 999999))

        # Store OTP in cache with expiration (e.g., 10 minutes)
        cache.set(f"reset_otp_{email}", otp_code, timeout=600)

        # Send email with OTP
        try:
            self.send_reset_email(email, otp_code)
        except Exception as e:
            print(f"Error sending email: {e}")
            return Response({'error': ['email-send-failed']}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({'message': 'reset-email-sent'}, status=status.HTTP_200_OK)

    def send_reset_email(self, email, otp_code):
        subject = 'Password Reset OTP'
        message = f"Your password reset OTP is: {otp_code}. It is valid for 10 minutes."
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])


class VerifyOTPResetPasswordView(views.APIView):
       def post(self, request):
        email = request.data.get("email")
        otp_code = request.data.get("otp")
        new_password = request.data.get("new_password")

        if not email or not otp_code or not new_password:
            return Response({"error": ["missing-fields"]}, status=status.HTTP_400_BAD_REQUEST)

        # Check if the email exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": ["invalid-email"]}, status=status.HTTP_400_BAD_REQUEST)

        # Retrieve OTP from cache
        stored_otp = cache.get(f"reset_otp_{email}")

        if stored_otp is None:
            return Response({"error": ["otp-expired-or-invalid"]}, status=status.HTTP_400_BAD_REQUEST)

        if stored_otp != otp_code:
            return Response({"error": ["invalid-otp"]}, status=status.HTTP_400_BAD_REQUEST)

        # OTP is valid → Reset password
        user.password = make_password(new_password)
        user.save()

        # Remove OTP from cache after successful verification
        cache.delete(f"reset_otp_{email}")

        return Response({"message": "password-reset-success"}, status=status.HTTP_200_OK)

# start Oauth
class FortyTwoOAuthLogin(APIView):
    def get(self, request):
        client_id = settings.FORTYTWO_CLIENT_ID
        redirect_uri = settings.FORTYTWO_REDIRECT_URI
        auth_url = f"https://api.intra.42.fr/oauth/authorize?client_id={client_id}&redirect_uri={redirect_uri}&response_type=code"
        return redirect(auth_url)

class FortyTwoOAuthCallback(APIView):
    def get(self, request):
        code = request.GET.get("code")
        if not code:
            return Response({"error": "Authorization code not provided"}, status=400)

        # Exchange code for access token
        token_url = "https://api.intra.42.fr/oauth/token"
        token_data = {
            "grant_type": "authorization_code",
            "client_id": settings.FORTYTWO_CLIENT_ID,
            "client_secret": settings.FORTYTWO_CLIENT_SECRET,
            "code": code,
            "redirect_uri": settings.FORTYTWO_REDIRECT_URI,
        }
        response = requests.post(token_url, data=token_data)
        token_json = response.json()

        if "access_token" not in token_json:
            return Response({"error": "Failed to retrieve access token"}, status=400)

        access_token = token_json["access_token"]

        # Fetch user data from 42 API
        user_info_url = "https://api.intra.42.fr/v2/me"
        headers = {"Authorization": f"Bearer {access_token}"}
        user_response = requests.get(user_info_url, headers=headers)
        user_data = user_response.json()

        # Extract relevant user info
        username = user_data["login"]
        email = user_data.get("email", f"{username}@42.fr")

        # Check if user exists, otherwise create one
        user, created = User.objects.get_or_create(username=username, defaults={"email": email})
        
        # Create session token
        token, _ = Token.objects.get_or_create(user=user)

        return Response({"message": "Login successful", "token": token.key})

# END Oauth
    
class CookieTokenAuthentication(TokenAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get('jwt')
        if not token:
            raise AuthenticationFailed('No jwt cookie found')
        return super().authenticate_credentials(token)

### AUTHENTICATION ###


class login(views.APIView):
    def post(self, request):
        username = request.data['username']
        password = request.data['password']
        gdpr = request.data.get('gdpr_consent', False)  # Default to False if not provided

        user = authenticate(username=username, password=password)
        if user:
            if not gdpr and not user.gdpr:
                return Response({'error': ['gdpr-consent-required']}, status=status.HTTP_403_FORBIDDEN)

            # Update GDPR consent if given
            if gdpr:
                user.gdpr = True
            user.online_status = True
            two_factor_code = str(random.randint(100000, 999999))

            # Save the generated 2FA code to the user's record in the database
            user.two_factor_secret = two_factor_code
      
            user.save()
            token, created = Token.objects.get_or_create(user=user)
            
            # Try to send the 2FA email
            try:
                self.send_2fa_email(user.email, two_factor_code)
            except Exception as e:
                # Log the error for debugging purposes
                # print(f"Error sending 2FA email: {e}")
                # Return a response indicating the failure
                return Response({'error': ['email-send-failed']}, status=status.HTTP_400_BAD_REQUEST)

            serializer = CustomUserSerializer(instance=user)
            response = Response(status=status.HTTP_200_OK)
            #response.set_cookie(key='jwt', value=token.key, httponly=True, secure=True ,max_age=200)
            return response
        return Response({'error': ['invalid-credentials-error']}, status=status.HTTP_400_BAD_REQUEST)

    def send_2fa_email(self, user_email, two_factor_code):
        subject = 'Your 2FA Verification Code'
        message = f"Your 2FA code is: {two_factor_code}"
        send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user_email])

class signup(views.APIView):
    def post(self, request):
        serializer = CustomUserSerializer(data=request.data)
        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as e:
                return Response({'password': e.messages}, status=status.HTTP_400_BAD_REQUEST)
            user = CustomUser.objects.get(username=serializer.data['username'])
            return Response(status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class logout(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        request.user.online_status = False
        request.user.save()
        request.user.auth_token.delete()
        return Response(status=status.HTTP_200_OK)

### USER PROFILE ###

class profile(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response({"user": serializer.data}, status=status.HTTP_200_OK)

class UpdateUser(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def put(self, request):
        user = request.user
        serializer = CustomUserSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            try:
                serializer.save()
            except ValidationError as e:
                return Response({'password': e.messages}, status=status.HTTP_400_BAD_REQUEST)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserAvatar(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        if user.profile_picture:
            return FileResponse(open(user.profile_picture.path, 'rb'), content_type='image/jpeg')
        else:
            return Response({"error": "No profile photo found"}, status=status.HTTP_404_NOT_FOUND)

### FRIENDS ###

class AddFriend(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        friend_username = request.data.get('username')
        if friend_username == request.user.username:
            return Response({"error": "You cannot add yourself as a friend"}, status=status.HTTP_400_BAD_REQUEST)
        friend = get_object_or_404(CustomUser, username=friend_username)
        if friend in request.user.friends.all():
            return Response({"error": "This user is already your friend"}, status=status.HTTP_400_BAD_REQUEST)
        request.user.friends.add(friend)
        return Response(status=status.HTTP_200_OK)

class RemoveFriend(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        friend_username = request.data.get('username')
        if friend_username == request.user.username:
            return Response({"error": "You cannot remove yourself from friends"}, status=status.HTTP_400_BAD_REQUEST)
        friend = get_object_or_404(CustomUser, username=friend_username)
        if friend not in request.user.friends.all():
            return Response({"error": "This user is not your friend"}, status=status.HTTP_400_BAD_REQUEST)
        request.user.friends.remove(friend)
        return Response(status=status.HTTP_200_OK)

class FriendsList(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        friends = request.user.friends.all()
        friends_data = []
        for friend in friends:
            serializer = CustomUserSerializer(friend)
            friend_data = {
                'username': serializer.data['username'],
                'profile_picture_url': serializer.data['profile_picture_url'],
                'online_status': serializer.data['online_status']
            }
            friends_data.append(friend_data)
        return Response(friends_data, status=status.HTTP_200_OK)

class UsersList(views.APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            users = CustomUser.objects.all()
            users_data = []
            for user in users:
                serializer = CustomUserSerializer(user)
                user_data = {
                    'username': serializer.data['username'],
                    'profile_picture_url': serializer.data['profile_picture_url'],
                    'online_status': serializer.data['online_status']
                }
                users_data.append(user_data)
            return Response(users_data, status=status.HTTP_200_OK)
        except Exception as e:
            raise APIException(str(e))

class Verify2FA(views.APIView):
    def post(self, request):
        
        # username = request.data.get('username')
        # two_factor_code = request.data.get('two_factor_code')
        username = request.data['username']
        two_factor_code = request.data['twoFactorCode']

        if not username or not two_factor_code:
            return Response({'error': 'Username and 2FA code are required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(username=username)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)

        # Check if 2FA code matches
        if user.two_factor_secret and user.two_factor_secret == two_factor_code:
    
            user.two_factor_secret = str(random.randint(100000, 999999))
            user.save()


            token, created = Token.objects.get_or_create(user=user)
            serializer = CustomUserSerializer(instance=user)
            response = Response(status=status.HTTP_200_OK)
            response.set_cookie(key='jwt', value=token.key, httponly=True, secure=True ,max_age=200)
            return response
            #return Response({'message': '2FA verified successfully'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid 2FA code'}, status=status.HTTP_400_BAD_REQUEST)



logger = logging.getLogger(__name__)

def my_view(request):
    logger.debug("This is a debug message.")
    logger.info("This is an info message.")
    logger.error("This is an error message.")
    return HttpResponse("Logging test.")


# add error log
# except Exception as e:
#     logger.error(f"Error sending email: {e}")