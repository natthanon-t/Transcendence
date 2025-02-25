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
