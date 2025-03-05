from rest_framework import serializers
from .models import CustomUser
from django.conf import settings
from django.core.validators import validate_email as validate_email_func
from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import validate_password
from django.urls import reverse

### USER MANAGEMENT ###

class CustomUserSerializer(serializers.ModelSerializer):
	profile_picture_url = serializers.SerializerMethodField()
	gdpr = serializers.BooleanField(required=False)


	class Meta:
		model = CustomUser
		fields = ('id', 'username', 'email', 'password', 'profile_picture', 'profile_picture_url', 'online_status' ,'alias' ,'gdpr' ,'gdpr_int','two_factor_secret')
		extra_kwargs = {'password': {'write_only': True}}

	def get_profile_picture_url(self, obj):
		if obj.profile_picture:
			return settings.HOST_NAME + obj.profile_picture.url
		else:
			return None

	def to_internal_value(self, data):
		if 'email' in data and not data['email']:
			raise serializers.ValidationError({'email': ['e-mail-empty-error']})
		if 'username' in data and not data['username']:
			raise serializers.ValidationError({'username': ['username-empty-error']})
		if 'password' in data and not data['password']:
			raise serializers.ValidationError({'password': ['password-empty-error']})
		# if 'gdpr' in data and data['gdpr'] not in [True, False]:  # Correct indentation
		# 	raise serializers.ValidationError({'gdpr': ['invalid-gdpr-consent']})
		if 'alias' in data:
			alias = data['alias']
			if not (1 <= len(alias) <= 12):
				raise serializers.ValidationError({'alias': ['alias-length-error']})

		return super().to_internal_value(data)

	def create(self, validated_data):
		# Ensure gdpr consent is set to True if not provided
		# gdpr = validated_data.get('gdpr', True)
		# validated_data['gdpr'] = gdpr
		return CustomUser.objects.create_user(**validated_data)

	def update(self, instance, validated_data):
		instance.profile_picture = validated_data.get('profile_picture', instance.profile_picture)
		if 'email' in validated_data:
			email = CustomUser.objects.normalize_email(validated_data['email'])
			try:
				validate_email_func(email)
			except ValidationError:
				raise serializers.ValidationError({'email': ['Saississez une adresse e-mail valide.']})
			if CustomUser.objects.filter(email=email).exclude(id=instance.id).exists():
				raise serializers.ValidationError({'email': ['email-exists-error']})
			instance.email = email
		if 'username' in validated_data:
			username = validated_data['username']
			if CustomUser.objects.filter(username=username).exclude(id=instance.id).exists():
				raise serializers.ValidationError({'username': ['username-exists-error']})
			instance.username = username
		if 'alias' in validated_data:
			instance.alias = validated_data['alias']
		if 'gdpr' in validated_data:
			gdpr_value = validated_data['gdpr']
			if not isinstance(gdpr_value, bool):  # Ensure it's a Boolean value
				raise serializers.ValidationError({'gdpr': ['invalid-gdpr-consent']})
			instance.gdpr = gdpr_value
		        # **Delete account and log out if gdpr is set to False**
			if not gdpr_value:
				request = self.context.get('request')  # Get request object from serializer context
				instance.delete()  # Delete the user
				return None  # Stop execution and return immediately
		instance.save()
		return instance

### TOURNAMENT ###
from rest_framework import serializers
from .models import Tournament, TournamentPlayer, TournamentMatch

class TournamentPlayerSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    display_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TournamentPlayer
        fields = ['id', 'username', 'guest_name', 'eliminated', 'position', 'display_name']
    
    def get_username(self, obj):
        return obj.user.username if obj.user else None
        
    def get_display_name(self, obj):
        # Return alias if available, otherwise username or guest_name
        if obj.user and obj.user.alias:
            return obj.user.alias
        elif obj.user:
            return obj.user.username
        else:
            return obj.guest_name

class TournamentMatchSerializer(serializers.ModelSerializer):
    player1 = TournamentPlayerSerializer()
    player2 = TournamentPlayerSerializer()
    winner = TournamentPlayerSerializer()
    
    class Meta:
        model = TournamentMatch
        fields = ['id', 'player1', 'player2', 'winner', 'round_number', 
                 'match_number', 'completed', 'player1_score', 'player2_score']

### HISTORY ###
from .models import MatchHistory

class TournamentSerializer(serializers.ModelSerializer):
    players = TournamentPlayerSerializer(many=True, read_only=True)
    matches = TournamentMatchSerializer(many=True, read_only=True)
    
    class Meta:
        model = Tournament
        fields = ['id', 'creator', 'created_at', 'status', 'players', 'matches']

class MatchHistorySerializer(serializers.ModelSerializer):
    player1_display_name = serializers.SerializerMethodField()
    player2_display_name = serializers.SerializerMethodField()
    winner_display_name = serializers.SerializerMethodField()
    is_player1_winner = serializers.ReadOnlyField()
    
    class Meta:
        model = MatchHistory
        fields = ['id', 'match_date', 'match_type', 
                 'player1', 'player2', 'player1_guest_name', 'player2_guest_name',
                 'player1_display_name', 'player2_display_name',
                 'player1_score', 'player2_score', 
                 'winner', 'winner_guest_name', 'winner_display_name', 
                 'is_player1_winner', 'tournament', 'tournament_round']
    
    def get_player1_display_name(self, obj):
        # Use alias if available, otherwise follow existing logic
        if obj.player1 and obj.player1.alias:
            return obj.player1.alias
        return obj.player1_guest_name if obj.player1_guest_name else (
            obj.player1.username if obj.player1 else "Unknown")
    
    def get_player2_display_name(self, obj):
        # Use alias if available, otherwise follow existing logic
        if obj.player2 and obj.player2.alias:
            return obj.player2.alias
        return obj.player2_guest_name if obj.player2_guest_name else (
            obj.player2.username if obj.player2 else "Unknown")
    
    def get_winner_display_name(self, obj):
        # Use alias if available, otherwise follow existing logic
        if obj.winner and obj.winner.alias:
            return obj.winner.alias
        return obj.winner_guest_name if obj.winner_guest_name else (
            obj.winner.username if obj.winner else "Unknown")