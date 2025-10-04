from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def health(request):
    """
    Endpoint público que devuelve el estado del servicio.
    No requiere autenticación.
    """
    return Response({
        "status": "ok",
        "service": "factoryflow-lite",
        "version": "1.0.0"
    })
