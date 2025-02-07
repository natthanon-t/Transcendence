from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.contrib.auth.password_validation import validate_password
from django.core.validators import MinLengthValidator, MaxLengthValidator


class CustomUserManager(BaseUserManager):
	def create_user(self, username, email, password=None, **extra_fields):
		email = self.normalize_email(email)
		user = self.model(username=username.strip(), email=email, **extra_fields)
		validate_password(password, user)
		user.set_password(password)
		user.save(using=self._db)
		return user

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
        validators=[MinLengthValidator(1), MaxLengthValidator(12)],
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
	online_status = models.BooleanField(default=False)
	gdprCheckbox = models.BooleanField(default=True)
	objects = CustomUserManager()

	def __str__(self):
		return self.username
