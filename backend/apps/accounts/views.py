from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response

class CookieTokenObtainPairView(TokenObtainPairView):
    def finalize_response(self, request, response, *args, **kwargs):
        if response.data.get('refresh'):

            cookie_max_age = 3600 * 24 * 7 # 7 days
            response.set_cookie(
                'refresh_token', 
                response.data['refresh'], 
                max_age=cookie_max_age, 
                httponly=True, 
                samesite='Lax'
            )
            del response.data['refresh'] # Remove from JSON body
        return super().finalize_response(request, response, *args, **kwargs)