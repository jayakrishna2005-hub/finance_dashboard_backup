from django.core.management.base import BaseCommand
from django.db import connection

class Command(BaseCommand):
    help = 'Test database connection and print current sql_mode'

    def handle(self, *args, **options):
        with connection.cursor() as cursor:
            cursor.execute("SELECT @@sql_mode;")
            sql_mode = cursor.fetchone()
            self.stdout.write(self.style.SUCCESS(f"Current sql_mode: {sql_mode[0]}"))
