from django.urls import path
from .views import QuoteCreateView, QuoteByStateView, QuoteByRoofTypeView,MonthlyProjectTrendView,RoofTypeAggregationView,EnergySavingsView, AverageRoofSizeByTypeView,ProjectCountView,OverallAverageRoofSize,ProjectLocationHeatmapView,CityInsightsView,CityReportView
urlpatterns = [
    path('submit/', QuoteCreateView.as_view(), name='quote-submit'),
    path('state/<str:state>/', QuoteByStateView.as_view(), name='quote-by-state'),
    path('roof/<str:roof_type>/', QuoteByRoofTypeView.as_view(), name='quote-by-roof'),
    path('monthly-projects/', MonthlyProjectTrendView.as_view(), name='monthly-projects'),
    path('roof-aggregation/', RoofTypeAggregationView.as_view(), name='roof-aggregation'),   
    path('energy-savings/', EnergySavingsView.as_view(), name='energy-savings'),
    path("avg-roof-size/", AverageRoofSizeByTypeView.as_view(), name="avg-roof-size"),
    path("project-count/", ProjectCountView.as_view(), name="project-count"),
    path("average-roof-size/", OverallAverageRoofSize.as_view(), name="overall-average-roof-size"),
    path("project-locations/", ProjectLocationHeatmapView.as_view(), name="project-locations"),
    path("city-insights/", CityInsightsView.as_view(), name="city-insights"),
    path("city-report/", CityReportView.as_view(), name="city-report"),
]
