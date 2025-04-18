import axios from "axios";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// const roofTypes = [
//   "Metal",
//   "TPO",
//   "Foam",
//   "EPDM",
//   "Built-up",
//   "Modified Bitumen",
//   "PVC",
// ];
const roofTypes = [
  "METAL",
  "TPO",
  "FOAM",
  "EPDM",
  "BUILT-UP",
  "MODIFIED BITUMEN",
  "PVC",
  "OTHER",
];

const stateOptions = {
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

export const QuoteForm = () => {
  const [formData, setFormData] = useState({
    contractorName: "",
    company: "",
    roofSize: "",
    roofType: "",
    city: "",
    state: "",
    projectDate: "",
  });

  const [selectedState, setSelectedState] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // inside your component...
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submission started with data:', formData);
  
    toast.promise(
      axios.post("http://127.0.0.1:8000/api/submit/", {
        contractor_name: formData.contractorName,
        company: formData.company,
        roof_size: Number(formData.roofSize),
        roof_type: formData.roofType,
        city: formData.city,
        state: formData.state,
        project_date: formData.projectDate,
      }).then(response => {
        console.log('Form submission successful:', response.data);
        return response;
      }).catch(error => {
        console.error('Form submission failed:', error.response?.data || error.message);
        throw error;
      }),
      {
        loading: "Submitting quote...",
        success: "Quote submitted successfully!",
        error: "Failed to submit quote",
      }
    );
  };
  
  // Utility to auto-capitalize roof type
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <Card className="w-full max-w-2xl mx-auto backdrop-blur-xl bg-white/50 border-white/20">
      <form onSubmit={handleSubmit} className="space-y-6 p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="contractorName" className="font-medium">Contractor Name</Label>
              <Input
                id="contractorName"
                value={formData.contractorName}
                onChange={(e) =>
                  setFormData({ ...formData, contractorName: e.target.value })
                }
                className="bg-white/70 border-white/20 focus:border-primary/50"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company" className="font-medium">Company</Label>
              <Input
                id="company"
                value={formData.company}
                className="bg-white/70 border-white/20 focus:border-primary/50"
                onChange={(e) =>
                  setFormData({ ...formData, company: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="roofSize" className="font-medium">Roof Size (sq ft)</Label>
              <Input
                id="roofSize"
                type="number"
                value={formData.roofSize}
                className="bg-white/70 border-white/20 focus:border-primary/50"
                onChange={(e) =>
                  setFormData({ ...formData, roofSize: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roofType" className="font-medium">Roof Type</Label>
              <Select
                onValueChange={(value) =>
                  setFormData({ ...formData, roofType: value })
                }
              >
                <SelectTrigger className="bg-white/70 border-white/20">
                  <SelectValue placeholder="Select roof type" />
                </SelectTrigger>
                  <SelectContent>
                    {roofTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="state" className="font-medium">State</Label>
              <Select
              onValueChange={(value) => {
                setSelectedState(value);
                setSelectedCity(""); // Reset city
                setFormData({ ...formData, state: value, city: "" });
              }}
                // onValueChange={(value) => {
                //   setSelectedState(value);
                //   setSelectedCity(""); // Reset city on state change
                // }}
              >
                <SelectTrigger className="bg-white/70 border-white/20">
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(stateOptions).map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="city" className="font-medium">City</Label>
              <Select
                // onValueChange={(value) => setSelectedCity(value)}
                onValueChange={(value) => {
                  setSelectedCity(value);
                  setFormData({ ...formData, city: value });
                }}
                disabled={!selectedState}
              >
                <SelectTrigger className="bg-white/70 border-white/20">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {selectedState &&
                    stateOptions[selectedState].map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectDate" className="font-medium">Project Date</Label>
            <Input
              id="projectDate"
              type="date"
              value={formData.projectDate}
              className="bg-white/70 border-white/20 focus:border-primary/50"
              onChange={(e) =>
                setFormData({ ...formData, projectDate: e.target.value })
              }
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
          Submit Quote
        </Button>
      </form>
    </Card>
  );
};
