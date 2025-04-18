import logging

logger = logging.getLogger(__name__)

from rest_framework import generics
from .models import Quote
from .serializers import QuoteSerializer
from django.db.models.functions import TruncMonth
from django.db.models import Count
from rest_framework.response import Response
from rest_framework.views import APIView
import calendar
from django.db.models import Avg
from rest_framework import status
from .city_coords import CITY_COORDS
from django.db.models import Count
# POST /api/submit/
class QuoteCreateView(generics.CreateAPIView):
    queryset = Quote.objects.all()
    serializer_class = QuoteSerializer
    
    def create(self, request, *args, **kwargs):
        logger.info("Received quote submission with data: %s", request.data)
        response = super().create(request, *args, **kwargs)
        logger.info("Successfully created quote with data: %s", response.data)
        return response

# GET /api/state/<state>/ 
class QuoteByStateView(generics.ListAPIView):
    serializer_class = QuoteSerializer

    def get_queryset(self):
        state = self.kwargs['state']
        return Quote.objects.filter(state__iexact=state)

# GET /api/roof/<roof_type>/ 
class QuoteByRoofTypeView(generics.ListAPIView):
    serializer_class = QuoteSerializer

    def get_queryset(self):
        roof_type = self.kwargs['roof_type']
        return Quote.objects.filter(roof_type__iexact=roof_type)
class MonthlyProjectTrendView(APIView):
    def get(self, request):
        data = (
            Quote.objects
            .annotate(month=TruncMonth("project_date"))
            .values("month")
            .annotate(count=Count("id"))
            .order_by("month")
        )
        # Convert date to month name (e.g., "Jan", "Feb")
        result = [
            {
                "month": calendar.month_abbr[item["month"].month],
                "projects": item["count"]
            }
            for item in data
        ]
        return Response(result)
class RoofTypeAggregationView(APIView):
    def get(self, request):
        data = (
            Quote.objects
            .values("roof_type")
            .annotate(count=Count("id"))
            .order_by("roof_type")
        )
        result = [
            {
                "type": item["roof_type"],
                "count": item["count"]
            }
            for item in data
        ]
        return Response(result)

class EnergySavingsView(APIView):
    def get(self, request):
        logger.info("Calculating energy savings")
        ROOF_TYPE_SAVINGS = {
            "Metal": 22.0,
            "TPO": 25.5,
            "Foam": 28.0,
            "EPDM": 24.0,
            "Built-up": 20.0,
            "Modified Bitumen": 21.0,
            "PVC": 26.5,
        }
        logger.debug("Using savings map: %s", ROOF_TYPE_SAVINGS)

        roof_type = request.GET.get("roof_type")

        if roof_type:
            savings = ROOF_TYPE_SAVINGS.get(roof_type, 0)
            return Response({"average_energy_savings": savings})

        quotes = Quote.objects.all()
        total_savings = 0
        count = 0

        for quote in quotes:
            savings = ROOF_TYPE_SAVINGS.get(quote.roof_type, 0)
            total_savings += savings
            count += 1

        avg_savings = round(total_savings / count, 2) if count else 0.0

        return Response({"average_energy_savings": avg_savings})
class AverageRoofSizeByTypeView(APIView):
    def get(self, request):
        data = (
            Quote.objects
            .values("roof_type")
            .annotate(avg_size=Avg("roof_size"))
            .order_by("roof_type")
        )

        result = [
            {
                "type": item["roof_type"],
                "avg_size": round(item["avg_size"], 2) if item["avg_size"] else 0
            }
            for item in data
        ]
        return Response(result)

class ProjectCountView(APIView):
    def get(self, request):
        state = request.GET.get("state")
        city = request.GET.get("city")

        if city:
            count = Quote.objects.filter(city__iexact=city).count()
        elif state:
            count = Quote.objects.filter(state__iexact=state).count()
        else:
            count = Quote.objects.count()

        return Response({"total_projects": count}, status=status.HTTP_200_OK)

class OverallAverageRoofSize(APIView):
    def get(self, request):
        avg = Quote.objects.aggregate(avg=Avg("roof_size"))["avg"]
        return Response({"average_roof_size": round(avg or 0, 2)})
from rest_framework.views import APIView
from rest_framework.response import Response

class ProjectLocationHeatmapView(APIView):
    def get(self, request):
        data = (
            Quote.objects
            .values("city")
            .annotate(count=Count("id"))
            .order_by("-count")
        )

        result = []
        for item in data:
            city = item["city"]
            if city in CITY_COORDS:
                coords = CITY_COORDS[city]
                result.append({
                    "city": city,
                    "lat": coords["lat"],
                    "lng": coords["lng"],
                    "count": item["count"]
                })

        return Response(result)
class CityInsightsView(APIView):
    def get(self, request):
        city = request.GET.get("city")
        logger.info("Fetching insights for city: %s", city)
        if not city:
            logger.warning("City parameter not provided in request")
            return Response({"error": "City not provided"}, status=status.HTTP_400_BAD_REQUEST)

        quotes = Quote.objects.filter(city__iexact=city)

        if not quotes.exists():
            return Response({"message": "No data for this city."}, status=status.HTTP_404_NOT_FOUND)

        total_projects = quotes.count()
        avg_roof_size = round(quotes.aggregate(avg=Avg("roof_size"))["avg"] or 0.0, 2)

        # Most common roof type
        roof_type_counts = quotes.values("roof_type").annotate(count=Count("id")).order_by("-count")
        most_common_roof = roof_type_counts[0]["roof_type"] if roof_type_counts else "Unknown"

        # Estimate savings like the other API
        ROOF_TYPE_SAVINGS = {
            "METAL": 22.0,
            "TPO": 25.5,
            "FOAM": 28.0,
            "EPDM": 24.0,
            "BUILT-UP": 20.0,
            "MODIFIED BITUMEN": 21.0,
            "PVC": 26.5,
        }

        savings = ROOF_TYPE_SAVINGS.get(most_common_roof, 0.0)

        return Response({
            "city": city,
            "total_projects": total_projects,
            "avg_roof_size": avg_roof_size,
            "most_common_roof": most_common_roof,
            "estimated_savings": savings,
        })

class CityReportView(APIView):
    def get(self, request):
        city = request.GET.get("city")
        if not city:
            return Response({"error": "City parameter is required"}, status=400)

        quotes = Quote.objects.filter(city__iexact=city)

        # Define savings map inside the method
        ROOF_TYPE_SAVINGS = {
            "METAL": 22.0,
            "TPO": 25.5,
            "FOAM": 28.0,
            "EPDM": 24.0,
            "BUILT-UP": 20.0,
            "MODIFIED BITUMEN": 21.0,
            "PVC": 26.5,
        }
        # Summary insights
        roof_agg = (
            quotes
            .values("roof_type")
            .annotate(count=Count("roof_type"))
            .order_by("-count")
        )
        most_used_roof = roof_agg[0]["roof_type"] if roof_agg else None

        total_projects = quotes.count()
        avg_roof_size = round(quotes.aggregate(avg=Avg("roof_size"))["avg"] or 0, 2)

        energy_saving = ROOF_TYPE_SAVINGS.get(most_used_roof, 0.0) if most_used_roof else 0.0

        summary = {
            "most_used_roof": most_used_roof,
            "total_projects": total_projects,
            "avg_roof_size": avg_roof_size,
            "energy_savings": energy_saving,
        }

        # Detailed project info
        projects = quotes.values(
            "contractor_name",
            "company",
            "roof_size",
            "roof_type",
            "city",
            "state",
            "project_date"
        ).order_by("-project_date")

        return Response({
            "summary": summary,
            "projects": list(projects)
        })
