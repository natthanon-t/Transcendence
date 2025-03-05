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

#TOURNAMENT
import random
import math
from django.db.models import Max
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Tournament, TournamentPlayer, TournamentMatch

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
                    'online_status': serializer.data['online_status'],
                    'alias': serializer.data['alias']
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
            response.set_cookie(key='jwt', value=token.key, httponly=True, secure=True ,max_age=86400)
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

### TOURNAMENT ###
class CreateTournament(APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        tournament = Tournament.objects.create(creator=request.user)
        players_data = request.data.get('players', [])
        
        if not 3 <= len(players_data) <= 8:
            return Response({"error": "Tournament must have 3-8 players"}, status=400)
        
        # Create tournament players
        for player_data in players_data:
            if player_data.get('type') == 'user':
                try:
                    user = CustomUser.objects.get(username=player_data['username'])
                    TournamentPlayer.objects.create(
                        tournament=tournament,
                        user=user
                    )
                except CustomUser.DoesNotExist:
                    return Response({"error": f"User {player_data['username']} not found"}, status=400)
            else:
                TournamentPlayer.objects.create(
                    tournament=tournament,
                    guest_name=player_data['name']
                )
        
        # Generate initial matches
        self.generate_tournament_brackets(tournament)
        return Response({"tournament_id": tournament.id}, status=201)
        
    def generate_tournament_brackets(self, tournament):
        """
		Creates all necessary matches for a tournament based on player count
		"""
        import math
		
        players = list(tournament.players.all())
        random.shuffle(players)  # Randomize player order
		
        player_count = len(players)
        print(f"Generating tournament for {player_count} players")
		
		# Special case for 5 players
        if player_count == 5:
            print("Creating 5-player tournament bracket")
			
			# Create first round - 1 match with 2 players
            first_round_match = TournamentMatch.objects.create(
				tournament=tournament,
				player1=players[0],
				player2=players[1],
				round_number=1,
				match_number=0
			)
			
			# Create first semi-final - winner of first round vs first bye player
            semi1 = TournamentMatch.objects.create(
				tournament=tournament,
				player1=players[2],  # First bye player
				player2=None,  # Will be filled with first round winner
				round_number=2,
				match_number=0
			)
			
			# Create second semi-final - between the other two bye players
            semi2 = TournamentMatch.objects.create(
				tournament=tournament,
				player1=players[3],
				player2=players[4],
				round_number=2,
				match_number=1
			)
			
			# Create final match
            final = TournamentMatch.objects.create(
				tournament=tournament,
				player1=None,
				player2=None,
				round_number=3,
				match_number=0
			)
			
            print("5-player tournament bracket created successfully")
            return
		
		# Special case for 6 players
        elif player_count == 6:
            print("Creating 6-player tournament bracket")
			
			# Create first round - 2 matches with 4 players
            first_round_match1 = TournamentMatch.objects.create(
				tournament=tournament,
				player1=players[0],
				player2=players[1],
				round_number=1,
				match_number=0
			)
			
            first_round_match2 = TournamentMatch.objects.create(
				tournament=tournament,
				player1=players[2],
				player2=players[3],
				round_number=1,
				match_number=1
			)
			
			# Create first semi-final - winner of first match vs first bye player
            semi1 = TournamentMatch.objects.create(
				tournament=tournament,
				player1=players[4],  # First bye player
				player2=None,  # Will be filled with first match winner
				round_number=2,
				match_number=0
			)
			
			# Create second semi-final - winner of second match vs second bye player
            semi2 = TournamentMatch.objects.create(
				tournament=tournament,
				player1=players[5],  # Second bye player
				player2=None,  # Will be filled with second match winner
				round_number=2,
				match_number=1
			)
			
			# Create final match
            final = TournamentMatch.objects.create(
				tournament=tournament,
				player1=None,
				player2=None,
				round_number=3,
				match_number=0
			)
			
            print("6-player tournament bracket created successfully")
            return
		
		# For other player counts (3, 4, 7, 8), use the previous implementation
		# Calculate rounds and byes
        rounds_needed = math.ceil(math.log2(player_count))
        perfect_bracket_size = 2 ** rounds_needed
        bye_count = perfect_bracket_size - player_count
		
        if player_count == 3:
			# First create the only first round match between two players
            TournamentMatch.objects.create(
				tournament=tournament,
				player1=players[1],
				player2=players[2],
				round_number=1,
				match_number=0
			)
			
			# Create the final with the bye player already set
            TournamentMatch.objects.create(
				tournament=tournament,
				player1=players[0],  # Bye player
				player2=None,        # Will be filled with first round winner
				round_number=2,      # This is the final
				match_number=0
			)
            return
		
		# Handle 4 and 8 players (perfect brackets)
        if player_count in [4, 8]:
			# Create first round matches
            for i in range(0, player_count, 2):
                TournamentMatch.objects.create(
					tournament=tournament,
					player1=players[i],
					player2=players[i+1],
					round_number=1,
					match_number=i // 2
				)
			
			# For 4 players, create the final match
            if player_count == 4:
                TournamentMatch.objects.create(
					tournament=tournament,
					player1=None,
					player2=None,
					round_number=2,
					match_number=0
				)
				
			# For 8 players, create semi-finals and final
            elif player_count == 8:
				# Create semi-finals
                for i in range(2):
                    TournamentMatch.objects.create(
						tournament=tournament,
						player1=None,
						player2=None,
						round_number=2,
						match_number=i
					)
				
				# Create final
                TournamentMatch.objects.create(
					tournament=tournament,
					player1=None,
					player2=None,
					round_number=3,
					match_number=0
				)
            return
		
		# Handle 7 players
        if player_count == 7:
			# Create first round - 3 matches with 6 players
            for i in range(0, 6, 2):
                TournamentMatch.objects.create(
					tournament=tournament,
					player1=players[i],
					player2=players[i+1],
					round_number=1,
					match_number=i // 2
				)
			
			# Create first semi-final - bye player vs first match winner
            TournamentMatch.objects.create(
				tournament=tournament,
				player1=players[6],  # Bye player
				player2=None,        # Will be filled with first match winner
				round_number=2,
				match_number=0
			)
			
			# Create second semi-final - for winners of second and third matches
            TournamentMatch.objects.create(
				tournament=tournament,
				player1=None,
				player2=None,
				round_number=2,
				match_number=1
			)
			
			# Create final
            TournamentMatch.objects.create(
				tournament=tournament,
				player1=None,
				player2=None,
				round_number=3,
				match_number=0
			)
            return

class UpdateTournamentMatch(APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, match_id):
        try:
            match = TournamentMatch.objects.get(id=match_id)
        except TournamentMatch.DoesNotExist:
            return Response({"error": "Match not found"}, status=404)

        winner_id = request.data.get('winner_id')
        player1_score = request.data.get('player1_score')
        player2_score = request.data.get('player2_score')

        # Validate data
        if not winner_id or player1_score is None or player2_score is None:
            return Response({"error": "Missing required fields"}, status=400)

        try:
            winner = TournamentPlayer.objects.get(id=winner_id)
            if winner not in [match.player1, match.player2]:
                return Response({"error": "Invalid winner"}, status=400)
        except TournamentPlayer.DoesNotExist:
            return Response({"error": "Winner not found"}, status=400)

        # Update match results
        try:
            match.winner = winner
            match.player1_score = int(player1_score)
            match.player2_score = int(player2_score)
            match.completed = True
            match.save()
            
            try:
                match_data = {
                    'match_type': 'TOURNAMENT',
                    'player1_score': match.player1_score,
                    'player2_score': match.player2_score,
                    'tournament': match.tournament,
                    'tournament_round': match.round_number
                }
                
                # Handle player1
                if match.player1:
                    if match.player1.user:
                        match_data['player1'] = match.player1.user
                        # Store alias separately if needed for reference
                        if match.player1.user.alias:
                            match_data['player1_guest_name'] = match.player1.user.alias
                    else:
                        match_data['player1_guest_name'] = match.player1.guest_name
                
                # Handle player2
                if match.player2:
                    if match.player2.user:
                        match_data['player2'] = match.player2.user
                        # Store alias separately if needed for reference
                        if match.player2.user.alias:
                            match_data['player2_guest_name'] = match.player2.user.alias
                    else:
                        match_data['player2_guest_name'] = match.player2.guest_name
                
                # Handle winner
                if match.winner:
                    if match.winner.user:
                        match_data['winner'] = match.winner.user
                        # Store alias separately if needed for reference
                        if match.winner.user.alias:
                            match_data['winner_guest_name'] = match.winner.user.alias
                    else:
                        match_data['winner_guest_name'] = match.winner.guest_name
                
                MatchHistory.objects.create(**match_data)
                print(f"Match history recorded for tournament match {match.id}")
            except Exception as e:
                print(f"Error recording match history: {str(e)}")

            # Mark loser as eliminated
            loser = match.player2 if winner == match.player1 else match.player1
            if loser:
                loser.eliminated = True
                loser.save()

            # Update tournament progression
            self.create_next_round_match(match)
            
            return Response({"status": "Match updated successfully"}, status=200)
            
        except Exception as e:
            import traceback
            print(f"Error updating match: {str(e)}")
            print(traceback.format_exc())
            return Response({"error": f"Server error: {str(e)}"}, status=500)

    def create_next_round_match(self, completed_match):
        """
        Advances a winner to the next round's match
        """
        import traceback
        
        tournament = completed_match.tournament
        current_round = completed_match.round_number
        match_number = completed_match.match_number
        winner = completed_match.winner
        
        # Add debugging information
        print(f"Processing match advancement for match #{completed_match.id}")
        print(f"Round: {current_round}, Match Number: {match_number}")
        print(f"Winner: {winner.user.username if winner and winner.user else (winner.guest_name if winner else 'None')}")
        
        if not winner:
            print("Warning: No winner set for completed match")
            return
        
        try:
            # Get all tournament matches
            all_matches = TournamentMatch.objects.filter(tournament=tournament)
            
            # Count the players to determine tournament type
            player_count = TournamentPlayer.objects.filter(tournament=tournament).count()
            print(f"Tournament has {player_count} players")
            
            # Find the maximum round number
            max_round = all_matches.aggregate(max_round=Max('round_number'))['max_round']
            print(f"Maximum round number: {max_round}")
            
            # Check if this is the final match
            if current_round == max_round:
                # This was the final - tournament is complete
                tournament.status = 'COMPLETED'
                tournament.save()
                print(f"Tournament {tournament.id} completed!")
                return
            
            # Special handling for 7-player tournament
            if player_count == 7 and current_round == 1:
                print(f"Processing 7-player tournament, round 1, match {match_number}")
                
                if match_number == 0:
                    # First match winner goes to semi-final 1 as player2 (with bye player)
                    next_match = TournamentMatch.objects.get(
                        tournament=tournament,
                        round_number=2,
                        match_number=0
                    )
                    next_match.player2 = winner
                elif match_number == 1:
                    # Second match winner goes to semi-final 2 as player1
                    next_match = TournamentMatch.objects.get(
                        tournament=tournament,
                        round_number=2,
                        match_number=1
                    )
                    next_match.player1 = winner
                elif match_number == 2:
                    # Third match winner goes to semi-final 2 as player2
                    next_match = TournamentMatch.objects.get(
                        tournament=tournament,
                        round_number=2,
                        match_number=1
                    )
                    next_match.player2 = winner
                
                next_match.save()
                print(f"Advanced 7-player tournament round 1 winner to appropriate semi-final")
                return
            elif player_count == 7 and current_round == 2:
                # Semi-final winners advance to final
                next_match = TournamentMatch.objects.get(
                    tournament=tournament,
                    round_number=3,
                    match_number=0
                )
                
                # Determine which player slot to fill
                if next_match.player1 is None:
                    next_match.player1 = winner
                else:
                    next_match.player2 = winner
                
                next_match.save()
                print(f"Advanced semi-final winner to final in 7-player tournament")
                return
            
            # Special handling for 5-player tournament
            if player_count == 5:
                if current_round == 1:
                    # First round winner advances to first semi-final as player2
                    next_match = TournamentMatch.objects.get(
                        tournament=tournament,
                        round_number=2,
                        match_number=0
                    )
                    next_match.player2 = winner
                    next_match.save()
                    print(f"Advanced winner to first semi-final in 5-player tournament")
                    return
                elif current_round == 2:
                    # Semi-final winners advance to final
                    next_match = TournamentMatch.objects.get(
                        tournament=tournament,
                        round_number=3,
                        match_number=0
                    )
                    
                    # Determine which player slot to fill
                    if next_match.player1 is None:
                        next_match.player1 = winner
                    else:
                        next_match.player2 = winner
                    
                    next_match.save()
                    print(f"Advanced winner to final in 5-player tournament")
                    return
            
            # Special handling for 6-player tournament
            if player_count == 6:
                if current_round == 1:
                    # First round winner advances to semi-final
                    next_match_number = 0 if match_number == 0 else 1
                    next_match = TournamentMatch.objects.get(
                        tournament=tournament,
                        round_number=2,
                        match_number=next_match_number
                    )
                    next_match.player2 = winner
                    next_match.save()
                    print(f"Advanced winner to semi-final #{next_match_number} in 6-player tournament")
                    return
                elif current_round == 2:
                    # Semi-final winners advance to final
                    next_match = TournamentMatch.objects.get(
                        tournament=tournament,
                        round_number=3,
                        match_number=0
                    )
                    
                    # Determine which player slot to fill
                    if next_match.player1 is None:
                        next_match.player1 = winner
                    else:
                        next_match.player2 = winner
                    
                    next_match.save()
                    print(f"Advanced winner to final in 6-player tournament")
                    return
            
            # Special handling for 3-player tournament
            if player_count == 3 and current_round == 1:
                # First round winner advances to final
                next_match = TournamentMatch.objects.get(
                    tournament=tournament,
                    round_number=2,
                    match_number=0
                )
                next_match.player2 = winner
                next_match.save()
                print(f"Advanced winner to the final in 3-player tournament")
                return
            
            # Generic handling for 4 and 8 player tournaments (perfect brackets)
            next_round = current_round + 1
            next_match_number = match_number // 2
            
            print(f"Advancing to round {next_round}, match {next_match_number}")
            
            # Get the next round match
            next_match = TournamentMatch.objects.get(
                tournament=tournament,
                round_number=next_round,
                match_number=next_match_number
            )
            
            # Determine which player slot to fill
            if match_number % 2 == 0:  # Even match numbers go to player1
                next_match.player1 = winner
                print(f"Set as player1 in next match")
            else:  # Odd match numbers go to player2
                next_match.player2 = winner
                print(f"Set as player2 in next match")
            
            next_match.save()
            print(f"Successfully advanced winner to round {next_round}, match {next_match_number}")
            
        except Exception as e:
            print(f"Error advancing winner: {str(e)}")
            print(traceback.format_exc())
            # Re-raise to make the error visible in the response
            raise

class TournamentMatches(APIView):
    """
    Get all matches for a specific tournament
    """
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, tournament_id):
        try:
            tournament = Tournament.objects.get(id=tournament_id)
        except Tournament.DoesNotExist:
            return Response({"error": "Tournament not found"}, status=404)
        
        matches = TournamentMatch.objects.filter(tournament=tournament)
        serializer = TournamentMatchSerializer(matches, many=True)
        return Response({"matches": serializer.data})
    
class TournamentMatchDetail(APIView):
    """
    Get details for a specific match
    """
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request, match_id):
        try:
            match = TournamentMatch.objects.get(id=match_id)
        except TournamentMatch.DoesNotExist:
            return Response({"error": "Match not found"}, status=404)
        
        serializer = TournamentMatchSerializer(match)
        return Response(serializer.data)
    
class CheckUserExists(APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        username = request.query_params.get('username')
        if not username:
            return Response({"error": "Username is required"}, status=400)
        
        exists = CustomUser.objects.filter(username=username).exists()
        return Response({"exists": exists})

### MATCH HISTORY ###
# class RecordMatchHistory(APIView):
#     authentication_classes = [CookieTokenAuthentication]
#     permission_classes = [IsAuthenticated]
    
#     def post(self, request):
#         match_type = request.data.get('match_type')
#         player1_id = request.data.get('player1_id')
#         player2_id = request.data.get('player2_id')
#         winner_id = request.data.get('winner_id')
#         player1_score = request.data.get('player1_score')
#         player2_score = request.data.get('player2_score')
#         player1_guest_name = request.data.get('player1_guest_name')
#         player2_guest_name = request.data.get('player2_guest_name')
#         winner_guest_name = request.data.get('winner_guest_name')
        
#         match_data = {
#             'match_type': match_type,
#             'player1_score': player1_score,
#             'player2_score': player2_score,
#             'player1_guest_name': player1_guest_name,
#             'player2_guest_name': player2_guest_name,
#             'winner_guest_name': winner_guest_name,
#         }
        
#         # Set registered user players if provided
#         if player1_id:
#             try:
#                 match_data['player1'] = CustomUser.objects.get(id=player1_id)
#             except CustomUser.DoesNotExist:
#                 return Response({"error": f"User with ID {player1_id} not found"}, status=400)
                
#         if player2_id:
#             try:
#                 match_data['player2'] = CustomUser.objects.get(id=player2_id)
#             except CustomUser.DoesNotExist:
#                 return Response({"error": f"User with ID {player2_id} not found"}, status=400)
                
#         if winner_id:
#             try:
#                 match_data['winner'] = CustomUser.objects.get(id=winner_id)
#             except CustomUser.DoesNotExist:
#                 return Response({"error": f"User with ID {winner_id} not found"}, status=400)
            
#         # Add tournament data if applicable
#         if match_type == 'TOURNAMENT':
#             tournament_id = request.data.get('tournament_id')
#             round_number = request.data.get('round')
            
#             if tournament_id:
#                 try:
#                     match_data['tournament'] = Tournament.objects.get(id=tournament_id)
#                     match_data['tournament_round'] = round_number
#                 except Tournament.DoesNotExist:
#                     return Response({"error": f"Tournament not found"}, status=400)
        
#         try:
#             # Create the match history record
#             MatchHistory.objects.create(**match_data)
#             return Response({"status": "Match recorded successfully"}, status=200)
#         except Exception as e:
#             return Response({"error": str(e)}, status=400)

class UserMatchHistory(APIView):
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        
        # Get all matches where the user was a player
        matches = MatchHistory.objects.filter(
            Q(player1=user) | Q(player2=user)
        ).order_by('-match_date')
        
        serializer = MatchHistorySerializer(matches, many=True)
        return Response(serializer.data)
    
class RecordMatchView(APIView):
    """
    API endpoint to record match results for both tournament and 1v1 matches
    """
    authentication_classes = [CookieTokenAuthentication]
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        match_type = request.data.get('match_type', 'FRIENDLY')
        player1_id = request.data.get('player1_id')
        player2_id = request.data.get('player2_id')
        player1_guest_name = request.data.get('player1_guest_name')
        player2_guest_name = request.data.get('player2_guest_name')
        player1_score = request.data.get('player1_score')
        player2_score = request.data.get('player2_score')
        winner_id = request.data.get('winner_id')
        winner_guest_name = request.data.get('winner_guest_name')
        
        # Validate required fields
        if player1_score is None or player2_score is None:
            return Response({"error": "Player scores are required"}, status=status.HTTP_400_BAD_REQUEST)
            
        if not ((player1_id or player1_guest_name) and (player2_id or player2_guest_name)):
            return Response({"error": "Both players must be specified"}, status=status.HTTP_400_BAD_REQUEST)
            
        if not (winner_id or winner_guest_name):
            return Response({"error": "Winner must be specified"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Prepare match data
        match_data = {
            'match_type': match_type,
            'player1_score': player1_score,
            'player2_score': player2_score,
            'player1_guest_name': player1_guest_name,
            'player2_guest_name': player2_guest_name,
            'winner_guest_name': winner_guest_name,
        }
        
        # Set player objects if IDs are provided
        if player1_id:
            try:
                user1 = CustomUser.objects.get(id=player1_id)
                match_data['player1'] = user1
                # If user has an alias and no guest name is provided, use alias as guest name
                if user1.alias and not player1_guest_name:
                    match_data['player1_guest_name'] = user1.alias
            except CustomUser.DoesNotExist:
                return Response({"error": f"User with ID {player1_id} not found"}, status=status.HTTP_400_BAD_REQUEST)
                
        if player2_id:
            try:
                user2 = CustomUser.objects.get(id=player2_id)
                match_data['player2'] = user2
                # If user has an alias and no guest name is provided, use alias as guest name
                if user2.alias and not player2_guest_name:
                    match_data['player2_guest_name'] = user2.alias
            except CustomUser.DoesNotExist:
                return Response({"error": f"User with ID {player2_id} not found"}, status=status.HTTP_400_BAD_REQUEST)
                
        if winner_id:
            try:
                winner = CustomUser.objects.get(id=winner_id)
                match_data['winner'] = winner
                # If winner has an alias and no winner guest name is provided, use alias
                if winner.alias and not winner_guest_name:
                    match_data['winner_guest_name'] = winner.alias
            except CustomUser.DoesNotExist:
                return Response({"error": f"User with ID {winner_id} not found"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Add tournament data if applicable
        if match_type == 'TOURNAMENT':
            tournament_id = request.data.get('tournament_id')
            tournament_round = request.data.get('tournament_round')
            
            if tournament_id:
                try:
                    match_data['tournament'] = Tournament.objects.get(id=tournament_id)
                    if tournament_round:
                        match_data['tournament_round'] = tournament_round
                except Tournament.DoesNotExist:
                    return Response({"error": f"Tournament not found"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create the match history record
            match = MatchHistory.objects.create(**match_data)
            return Response({
                "status": "success",
                "message": "Match recorded successfully",
                "match_id": match.id
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logger.error(f"Error recording match: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)