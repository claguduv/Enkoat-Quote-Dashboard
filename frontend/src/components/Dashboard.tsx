import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, Line, Pie, PieChart, Cell, Legend } from "recharts";
import axios from "axios";
import { useEffect, useState } from "react";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { GoogleMap, useJsApiLoader, HeatmapLayerF } from "@react-google-maps/api";
import html2pdf from "html2pdf.js";
import { Button } from "@/components/ui/button"; // If using shadcn/ui button

// State & city options
const stateOptions = {
  "All States": [], // Represents all states together
  Arizona: ["Phoenix", "Tempe", "Tucson", "Mesa", "Scottsdale"],
  California: ["Los Angeles", "San Diego", "San Jose", "Sacramento", "Fresno"],
  Texas: ["Austin", "Dallas", "Houston", "San Antonio", "Fort Worth"],
  Nevada: ["Las Vegas", "Reno", "Henderson"],
  Colorado: ["Denver", "Boulder", "Colorado Springs"],
  Florida: ["Miami", "Orlando", "Tampa", "Jacksonville", "St. Petersburg"],
  NewYork: ["New York City", "Buffalo", "Rochester", "Albany"],
  Georgia: ["Atlanta", "Savannah", "Augusta", "Macon"],
  Illinois: ["Chicago", "Springfield", "Naperville"],
  Washington: ["Seattle", "Tacoma", "Spokane", "Bellevue"],
};

export const Dashboard = () => {
  const COLORS = ["#0EA5E9", "#10B981", "#F59E0B", "#EF4444", "#6366F1", "#D946EF", "#14B8A6"];
  const [roofData, setRoofData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [energySavings, setEnergySavings] = useState(0);
  const [avgRoofData, setAvgRoofData] = useState([]);
  const [selectedState, setSelectedState] = useState("All States");
  const [selectedCity, setSelectedCity] = useState("");
  const [projectCount, setProjectCount] = useState(0);
  const [selectedRoofType, setSelectedRoofType] = useState("");
  const [averageRoofSize, setAverageRoofSize] = useState(0);
  // const [heatmapData, setHeatmapData] = useState([]);
  const [heatmapData, setHeatmapData] = useState<google.maps.MVCArray<google.maps.visualization.WeightedLocation> | null>(null);
  const { isLoaded } = useJsApiLoader({
  googleMapsApiKey: "", // Replace this with your key
  libraries: ["visualization"],
});
  const [selectedCityForInsight, setSelectedCityForInsight] = useState("");
  const [cityInsight, setCityInsight] = useState(null);
  const [showSampleModal, setShowSampleModal] = useState(false);
  // Add a dropdown for roof type filter
  const roofTypes = [
    "Metal",
    "TPO",
    "Foam",
    "EPDM",
    "Built-up",
    "Modified Bitumen",
    "PVC",
  ];
  const [selectedInsightCity, setSelectedInsightCity] = useState("");
  const [cityReport, setCityReport] = useState<any | null>(null);

  useEffect(() => {
    if (!selectedInsightCity) return;
    console.log('Fetching city report for:', selectedInsightCity);
    axios.get(`http://127.0.0.1:8000/api/city-report/?city=${selectedInsightCity}`)
      .then(res => {
        console.log('City report data received:', res.data);
        setCityReport(res.data);
      })
      .catch((error) => {
        console.error('Failed to fetch city report:', error);
        setCityReport(null);
      });
  }, [selectedInsightCity]);

  useEffect(() => {
    if (!selectedCityForInsight) return;
    axios
      .get(`http://127.0.0.1:8000/api/city-insights/?city=${selectedCityForInsight}`)
      .then((res) => setCityInsight(res.data))
      .catch((err) => console.error("Failed to fetch city insight", err));
  }, [selectedCityForInsight]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/project-locations/")
      .then((res) => {
        const points = res.data.map((loc) => ({
          location: new google.maps.LatLng(loc.lat, loc.lng),
          weight: loc.count,
        }));
        console.log("Heatmap Data:", points);  
        setHeatmapData(points);
      })
      .catch((err) => {
        console.error("Failed to fetch heatmap data", err);
      });
  }, []);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/average-roof-size/")
      .then((res) => setAverageRoofSize(res.data.average_roof_size))
      .catch((err) => console.error("Failed to fetch average roof size", err));
  }, []);
  useEffect(() => {
    const fetchCount = async () => {
      let url = "http://127.0.0.1:8000/api/project-count/";
      if (selectedCity) url += `?city=${selectedCity}`;
      else if (selectedState && selectedState !== "All States") url += `?state=${selectedState}`;

      const res = await axios.get(url);
      setProjectCount(res.data.total_projects);
    };
    fetchCount();
  }, [selectedState, selectedCity]);

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/avg-roof-size/")
      .then((res) => {
        setAvgRoofData(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch average roof size", err);
      });
  }, []);

  useEffect(() => {
    const fetchEnergySavings = async () => {
      let url = "http://127.0.0.1:8000/api/energy-savings/";
      if (selectedRoofType) url += `?roof_type=${selectedRoofType}`;

      try {
        const res = await axios.get(url);
        setEnergySavings(res.data.average_energy_savings);
      } catch (err) {
        console.error("Failed to fetch energy savings", err);
      }
    };

    fetchEnergySavings();
  }, [selectedRoofType]);

  useEffect(() => {
    const fetchRoofData = async () => {
      console.log('Fetching roof aggregation data...');
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/roof-aggregation/");
        console.log('Received roof aggregation data:', res.data);
        setRoofData(res.data);
      } catch (err) {
        console.error("Dashboard data fetch failed:", err);
      }
    };

    const fetchMonthly = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/monthly-projects/");
        setMonthlyData(res.data);
      } catch (err) {
        console.error("Failed to fetch monthly data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoofData();
    fetchMonthly();
  }, []);

  const handleGeneratePDF = () => {
    const el = document.getElementById("project-table-pdf");
    if (!el) {
      console.error("PDF element not found!");
      return;
    }
  
    html2pdf()
      .from(el)
      .set({
        margin: 0.5,
        filename: `${selectedInsightCity}-project-details.pdf`,
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "landscape" }
      })
      .save();
  };
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
      <Card className="backdrop-blur-xl bg-white/50 border-white/20">
        <CardHeader className="flex flex-col gap-2 pb-2">
          <CardTitle className="text-sm font-medium">Number of Projects (by State/City)</CardTitle>
          <div className="flex gap-2">
            <Select
              onValueChange={(value) => {
                setSelectedState(value);
                setSelectedCity(""); // Reset city on state change
              }}
            >
              <SelectTrigger className="w-32 text-sm">
                <SelectValue placeholder="State" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(stateOptions).map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              onValueChange={(value) => setSelectedCity(value)}
              disabled={!selectedState || selectedState === "All States"}
            >
              <SelectTrigger className="w-32 text-sm">
                <SelectValue placeholder="City" />
              </SelectTrigger>
              <SelectContent className="absolute z-10 bg-white shadow-lg">
                {selectedState &&
                  stateOptions[selectedState].map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
    <div className="text-2xl font-bold text-primary">{projectCount}</div>
    <p className="text-xs text-muted-foreground">
      Showing {selectedCity || selectedState || "all projects"}
    </p>
  </CardContent>
</Card>

        <Card className="backdrop-blur-xl bg-white/50 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Roof Size</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {averageRoofSize.toLocaleString()} sq ft
            </div>
            <p className="text-xs text-muted-foreground">
              "More surface. More savings. More reasons customers choose EnKoat."
            </p>
          </CardContent>
        </Card>
        <Card className="backdrop-blur-xl bg-white/50 border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Energy Savings</CardTitle>
            <Select
              onValueChange={(value) => setSelectedRoofType(value)}
            >
              <SelectTrigger className="w-32 text-sm">
                <SelectValue placeholder="Roof Type" />
              </SelectTrigger>
              <SelectContent>
                {roofTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
          <div className="text-2xl font-bold text-success">{energySavings}%</div>
            <p className="text-xs text-muted-foreground">
              Energy savings for {selectedRoofType || "all roof types"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1 backdrop-blur-xl bg-white/50 border-white/20">
          <CardHeader>
            <CardTitle>Monthly Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip contentStyle={{ background: "rgba(255, 255, 255, 0.8)" }} />
                <Line
                  type="monotone"
                  dataKey="projects"
                  stroke="#0EA5E9"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 backdrop-blur-xl bg-white/50 border-white/20">
          <CardHeader>
            <CardTitle>Projects by Roof Type (count)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roofData}>
                {/* <XAxis dataKey="type" /> */}
                <XAxis
                  dataKey="type"
                  tickFormatter={(type) =>
                    type === "MODIFIED BITUMEN" ? "MOD. BIT" : type
                  }/>
                <YAxis />
                <Tooltip contentStyle={{ background: "rgba(255, 255, 255, 0.8)" }} />
                <Bar dataKey="count" fill="#06B6D4" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1 backdrop-blur-xl bg-white/50 border-white/20">
          <CardHeader>
          <CardTitle>Average Roof Size by substrate (sq ft)</CardTitle>
            </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={avgRoofData}
                      dataKey="avg_size"
                      nameKey="type"
                      cx="50%"
                      cy="45%"
                      outerRadius={90}
                      fill="#10B981"
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                    >
                      {avgRoofData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value} sq ft`, "Avg Roof Size"]}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      wrapperStyle={{ fontSize: "0.85rem" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-white/50 border-white/20 p-6">
  <CardHeader>
    <CardTitle>City Insights</CardTitle>
    <Select onValueChange={setSelectedInsightCity}>
      <SelectTrigger className="mt-4">
        <SelectValue placeholder="Select a city" />
      </SelectTrigger>
      <SelectContent>
        {Object.values(stateOptions).flat().map((city) => (
          <SelectItem key={city} value={city}>{city}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </CardHeader>

  {cityReport && (
    <CardContent className="space-y-4" id="pdf-report">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 shadow-inner">
          <p className="text-sm text-muted-foreground">Most Used Roof</p>
          <p className="text-xl font-bold">{cityReport.summary.most_used_roof}</p>
        </Card>
        <Card className="p-4 shadow-inner">
          <p className="text-sm text-muted-foreground">Total Projects</p>
          <p className="text-xl font-bold text-blue-600">{cityReport.summary.total_projects}</p>
        </Card>
        <Card className="p-4 shadow-inner">
          <p className="text-sm text-muted-foreground">Avg Roof Size</p>
          <p className="text-xl font-bold">{cityReport.summary.avg_roof_size} sq ft</p>
        </Card>
        <Card className="p-4 shadow-inner">
          <p className="text-sm text-muted-foreground">Energy Savings</p>
          <p className="text-xl font-bold text-green-600">{cityReport.summary.energy_savings}%</p>
        </Card>
      </div>

      {/* <div className="pt-6">
        <p className="text-md font-semibold pb-2">Project List</p>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm text-left">
            <thead className="bg-muted">
              <tr>
                <th className="border px-3 py-2">Contractor</th>
                <th className="border px-3 py-2">Company</th>
                <th className="border px-3 py-2">Roof Size</th>
                <th className="border px-3 py-2">Roof Type</th>
                <th className="border px-3 py-2">City</th>
                <th className="border px-3 py-2">State</th>
                <th className="border px-3 py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {cityReport.projects.map((proj: any, i: number) => (
                <tr key={i} className="even:bg-gray-100">
                  <td className="border px-3 py-1">{proj.contractor_name}</td>
                  <td className="border px-3 py-1">{proj.company}</td>
                  <td className="border px-3 py-1">{proj.roof_size}</td>
                  <td className="border px-3 py-1">{proj.roof_type}</td>
                  <td className="border px-3 py-1">{proj.city}</td>
                  <td className="border px-3 py-1">{proj.state}</td>
                  <td className="border px-3 py-1">{proj.project_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div> */}

      <div className="flex justify-end pt-4 gap-2">
      <Button onClick={() => setShowSampleModal(true)}>
  View Sample
</Button>
  {/* <Button onClick={handleGeneratePDF}>
  Download PDF Report
</Button> */}
</div>

    </CardContent>
  )}
</Card>
{showSampleModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white w-[90%] max-w-5xl p-6 rounded-lg shadow-lg overflow-y-auto max-h-[90vh]">
    <div className="flex justify-between items-center mb-4">
  <h2 className="text-xl font-semibold">
    Project Details for {selectedInsightCity}
  </h2>
  <div className="flex gap-2">
  <Button
      className="bg-blue-500 text-white hover:bg-blue-600"
      onClick={handleGeneratePDF}
    >
      Download PDF
    </Button>
    <Button variant="ghost" onClick={() => setShowSampleModal(false)}>
      Close
    </Button>
  </div>
</div>


      {/* ADD THIS ID */}
      <div id="project-table-pdf">
        <table className="min-w-full border text-sm text-left">
          <thead className="bg-muted">
            <tr>
              <th className="border px-3 py-2">Contractor</th>
              <th className="border px-3 py-2">Company</th>
              <th className="border px-3 py-2">Roof Size</th>
              <th className="border px-3 py-2">Roof Type</th>
              <th className="border px-3 py-2">City</th>
              <th className="border px-3 py-2">State</th>
              <th className="border px-3 py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {cityReport?.projects.map((proj: any, i: number) => (
              <tr key={i} className="even:bg-gray-100">
                <td className="border px-3 py-1">{proj.contractor_name}</td>
                <td className="border px-3 py-1">{proj.company}</td>
                <td className="border px-3 py-1">{proj.roof_size}</td>
                <td className="border px-3 py-1">{proj.roof_type}</td>
                <td className="border px-3 py-1">{proj.city}</td>
                <td className="border px-3 py-1">{proj.state}</td>
                <td className="border px-3 py-1">{proj.project_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
)}


        {isLoaded && (
        <Card className="col-span-2 backdrop-blur-xl bg-white/50 border-white/20">
          <CardHeader>
            <CardTitle>Projects Heatmap by City</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] p-0 overflow-hidden rounded-xl">
            {/* <GoogleMap
              mapContainerStyle={{ width: "100%", height: "100%" }}
              center={{ lat: 39.5, lng: -98.35 }} // USA center
              zoom={5}
            >
      
              <HeatmapLayerF 
                data={heatmapData} 
                options={{
                  radius: 50, // Adjust the radius for better visibility
                  opacity: 0.7, // Adjust the opacity for better blending
                }}
              />
            </GoogleMap> */}
            <GoogleMap
                mapContainerStyle={{ width: "100%", height: "100%" }}
                center={{ lat: 39.5, lng: -98.35 }}
                zoom={4}
              >
                {heatmapData && (
                  <HeatmapLayerF 
                    data={heatmapData}
                    options={{
                      radius: 30,
                      opacity: 0.7,
                    }}
                  />
                )}
            </GoogleMap>
          </CardContent>
        </Card>
      )}
      </div>
      {/* Hidden table used for PDF export */}
      <div
  id="project-table-pdf"
  style={{
    position: "absolute",
    left: "-9999px",
    top: "-9999px",
    visibility: "hidden",
  }}
>
  <h2 className="text-xl font-semibold mb-4">
    Project Details for {selectedInsightCity}
  </h2>
  <table className="min-w-full border text-sm text-left">
    <thead className="bg-muted">
      <tr>
        <th className="border px-3 py-2">Contractor</th>
        <th className="border px-3 py-2">Company</th>
        <th className="border px-3 py-2">Roof Size</th>
        <th className="border px-3 py-2">Roof Type</th>
        <th className="border px-3 py-2">City</th>
        <th className="border px-3 py-2">State</th>
        <th className="border px-3 py-2">Date</th>
      </tr>
    </thead>
    <tbody>
      {cityReport?.projects.map((proj: any, i: number) => (
        <tr key={i} className="even:bg-gray-100">
          <td className="border px-3 py-1">{proj.contractor_name}</td>
          <td className="border px-3 py-1">{proj.company}</td>
          <td className="border px-3 py-1">{proj.roof_size}</td>
          <td className="border px-3 py-1">{proj.roof_type}</td>
          <td className="border px-3 py-1">{proj.city}</td>
          <td className="border px-3 py-1">{proj.state}</td>
          <td className="border px-3 py-1">{proj.project_date}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>

    </div>


    
  );
};

