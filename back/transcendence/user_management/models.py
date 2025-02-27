from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth.password_validation import validate_password

class CustomUserManager(BaseUserManager):
	def create_user(self, username, email, password=None, **extra_fields):
		email = self.normalize_email(email)
		user = self.model(username=username.strip(), email=email, **extra_fields)
		validate_password(password, user)
		user.set_password(password)
		user.save(using=self._db)
		return user

	def create_superuser(self, username, email, password=None, **extra_fields):
		extra_fields.setdefault('is_staff', True)
		extra_fields.setdefault('is_superuser', True)

		if extra_fields.get('is_staff') is not True:
			raise ValueError('Superuser must have is_staff=True.')
		if extra_fields.get('is_superuser') is not True:
			raise ValueError('Superuser must have is_superuser=True.')

		return self.create_user(username, email, password, **extra_fields)

class CustomUser(AbstractUser):
	username = models.CharField(
		max_length=15,
		unique=True,
		validators=[],
		error_messages={
			'unique': "username-exists-error",
		}
	)
	alias = models.CharField(
        max_length=12,
        validators=[],
        blank=True,  # Allowing it to be optional
        null=True,   # Allowing it to be null in the database
    )
	email = models.EmailField(
		unique=True,
		error_messages={
			'unique': "email-exists-error",
		}
	)
	profile_picture = models.ImageField(upload_to='profile_pictures/', default='profile_pictures/default.jpg')
	friends = models.ManyToManyField('self', blank=True) #--- get friend list
	gdpr = models.BooleanField(default=True)
	online_status = models.BooleanField(default=False)
	gdpr_int = models.IntegerField(default=0)
	two_factor_secret = models.CharField(max_length=255, blank=True, null=True)
	objects = CustomUserManager()

	def __str__(self):
		return self.username

#### TOURNAMENT ####
class Tournament(models.Model):
    creator = models.ForeignKey('CustomUser', on_delete=models.CASCADE, related_name='created_tournaments')
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=[
        ('PENDING', 'Pending'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed')
    ], default='PENDING')

class TournamentPlayer(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='players')
    user = models.ForeignKey('CustomUser', on_delete=models.SET_NULL, null=True, blank=True)
    guest_name = models.CharField(max_length=50, null=True, blank=True)
    eliminated = models.BooleanField(default=False)
    position = models.IntegerField(default=0)  # For bracket positioning

    class Meta:
        unique_together = [['tournament', 'user'], ['tournament', 'guest_name']]

class TournamentMatch(models.Model):
    tournament = models.ForeignKey(Tournament, on_delete=models.CASCADE, related_name='matches')
    player1 = models.ForeignKey(TournamentPlayer, on_delete=models.CASCADE, null=True, blank=True, related_name='matches_as_player1') # Added null=True, blank=True
    player2 = models.ForeignKey(TournamentPlayer, on_delete=models.CASCADE, null=True, blank=True, related_name='matches_as_player2') # Added null=True, blank=True
    winner = models.ForeignKey(TournamentPlayer, on_delete=models.CASCADE, null=True, blank=True, related_name='matches_won')
    round_number = models.IntegerField()
    match_number = models.IntegerField()
    completed = models.BooleanField(default=False)
    player1_score = models.IntegerField(default=0)
    player2_score = models.IntegerField(default=0)

### HISTORY ###
class MatchHistory(models.Model):
    # Match metadata
    match_date = models.DateTimeField(auto_now_add=True)
    match_type = models.CharField(max_length=20, choices=[
        ('TOURNAMENT', 'Tournament Match'),
        ('FRIENDLY', '1v1 Friendly Match')
    ])
    
    # Players involved (nullable for guest players)
    player1 = models.ForeignKey(CustomUser, on_delete=models.CASCADE, 
                              related_name='matches_as_player1', null=True, blank=True)
    player2 = models.ForeignKey(CustomUser, on_delete=models.CASCADE, 
                              related_name='matches_as_player2', null=True, blank=True)
    
    # Guest name fields
    player1_guest_name = models.CharField(max_length=50, null=True, blank=True)
    player2_guest_name = models.CharField(max_length=50, null=True, blank=True)
    
    # Tournament reference
    tournament = models.ForeignKey(Tournament, on_delete=models.SET_NULL, 
                                  null=True, blank=True)
    tournament_round = models.IntegerField(null=True, blank=True)
    
    # Results
    player1_score = models.IntegerField()
    player2_score = models.IntegerField()
    winner = models.ForeignKey(CustomUser, on_delete=models.CASCADE, 
                             related_name='matches_won', null=True, blank=True)
    winner_guest_name = models.CharField(max_length=50, null=True, blank=True)
    
    @property
    def player1_display_name(self):
        return self.player1_guest_name if self.player1_guest_name else (
            self.player1.username if self.player1 else "Unknown")
    
    @property
    def player2_display_name(self):
        return self.player2_guest_name if self.player2_guest_name else (
            self.player2.username if self.player2 else "Unknown")
    
    @property
    def winner_display_name(self):
        return self.winner_guest_name if self.winner_guest_name else (
            self.winner.username if self.winner else "Unknown")
    
    @property
    def is_player1_winner(self):
        if self.winner and self.player1:
            return self.winner.id == self.player1.id
        if self.winner_guest_name and self.player1_guest_name:
            return self.winner_guest_name == self.player1_guest_name
        return False