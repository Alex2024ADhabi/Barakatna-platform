import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select } from "../components/ui/select";
import { beneficiaryService } from "../services/beneficiaryService";
import {
  dataValidationService,
  SchemaType,
} from "../lib/api/core/dataValidation";

export default function BeneficiaryValidationDemo() {
  const [formData, setFormData] = useState({
    emiratesId: "",
    fullNameEn: "",
    fullNameAr: "",
    dateOfBirth: null,
    gender: "male",
    contactNumber: "",
    secondaryContactNumber: "",
    address: {
      emirate: "Dubai",
      area: "",
      street: "",
      buildingVilla: "",
      gpsCoordinates: "",
    },
    propertyDetails: {
      propertyType: "apartment",
      ownership: "owned",
      bedrooms: 2,
      bathrooms: 2,
      floors: 1,
      yearOfConstruction: 2010,
    },
    clientTypeId: 1, // 1: FDF, 2: ADHA, 3: Cash-Based
  });

  const [validationResult, setValidationResult] = useState({
    valid: true,
    errors: {},
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Handle nested properties
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleValidate = async () => {
    const result = await beneficiaryService.validateBeneficiary(formData);
    setValidationResult(result);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await beneficiaryService.createBeneficiary(formData);
      setSubmitResult(result);
    } catch (error) {
      setSubmitResult({
        success: false,
        message: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Beneficiary Validation Demo</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="emiratesId">Emirates ID</Label>
            <Input
              id="emiratesId"
              name="emiratesId"
              value={formData.emiratesId}
              onChange={handleChange}
              placeholder="123-4567-8901234-5"
              className={
                validationResult.errors?.emiratesId ? "border-red-500" : ""
              }
            />
            {validationResult.errors?.emiratesId && (
              <p className="text-red-500 text-sm">
                {validationResult.errors.emiratesId[0]}
              </p>
            )}
            <p className="text-xs text-gray-500">Format: 123-4567-8901234-5</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullNameEn">Full Name (English)</Label>
            <Input
              id="fullNameEn"
              name="fullNameEn"
              value={formData.fullNameEn}
              onChange={handleChange}
              className={
                validationResult.errors?.fullNameEn ? "border-red-500" : ""
              }
            />
            {validationResult.errors?.fullNameEn && (
              <p className="text-red-500 text-sm">
                {validationResult.errors.fullNameEn[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fullNameAr">Full Name (Arabic)</Label>
            <Input
              id="fullNameAr"
              name="fullNameAr"
              value={formData.fullNameAr}
              onChange={handleChange}
              dir="rtl"
              className={
                validationResult.errors?.fullNameAr ? "border-red-500" : ""
              }
            />
            {validationResult.errors?.fullNameAr && (
              <p className="text-red-500 text-sm">
                {validationResult.errors.fullNameAr[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <Select
              id="gender"
              name="gender"
              value={formData.gender}
              onValueChange={(value) =>
                setFormData({ ...formData, gender: value })
              }
              className={
                validationResult.errors?.gender ? "border-red-500" : ""
              }
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
            {validationResult.errors?.gender && (
              <p className="text-red-500 text-sm">
                {validationResult.errors.gender[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input
              id="contactNumber"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              placeholder="+971501234567"
              className={
                validationResult.errors?.contactNumber ? "border-red-500" : ""
              }
            />
            {validationResult.errors?.contactNumber && (
              <p className="text-red-500 text-sm">
                {validationResult.errors.contactNumber[0]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="clientTypeId">Client Type</Label>
            <Select
              id="clientTypeId"
              name="clientTypeId"
              value={formData.clientTypeId.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, clientTypeId: parseInt(value) })
              }
              className={
                validationResult.errors?.clientTypeId ? "border-red-500" : ""
              }
            >
              <option value="1">FDF</option>
              <option value="2">ADHA</option>
              <option value="3">Cash-Based</option>
            </Select>
            {validationResult.errors?.clientTypeId && (
              <p className="text-red-500 text-sm">
                {validationResult.errors.clientTypeId[0]}
              </p>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Address</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="address.emirate">Emirate</Label>
              <Select
                id="address.emirate"
                name="address.emirate"
                value={formData.address.emirate}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, emirate: value },
                  })
                }
                className={
                  validationResult.errors?.["address.emirate"]
                    ? "border-red-500"
                    : ""
                }
              >
                <option value="Abu Dhabi">Abu Dhabi</option>
                <option value="Dubai">Dubai</option>
                <option value="Sharjah">Sharjah</option>
                <option value="Ajman">Ajman</option>
                <option value="Umm Al Quwain">Umm Al Quwain</option>
                <option value="Fujairah">Fujairah</option>
                <option value="Ras Al Khaimah">Ras Al Khaimah</option>
              </Select>
              {validationResult.errors?.["address.emirate"] && (
                <p className="text-red-500 text-sm">
                  {validationResult.errors["address.emirate"][0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="address.area">Area</Label>
              <Input
                id="address.area"
                name="address.area"
                value={formData.address.area}
                onChange={handleChange}
                className={
                  validationResult.errors?.["address.area"]
                    ? "border-red-500"
                    : ""
                }
              />
              {validationResult.errors?.["address.area"] && (
                <p className="text-red-500 text-sm">
                  {validationResult.errors["address.area"][0]}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <h2 className="text-lg font-semibold mb-4">Property Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="propertyDetails.propertyType">
                Property Type
              </Label>
              <Select
                id="propertyDetails.propertyType"
                name="propertyDetails.propertyType"
                value={formData.propertyDetails.propertyType}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    propertyDetails: {
                      ...formData.propertyDetails,
                      propertyType: value,
                    },
                  })
                }
                className={
                  validationResult.errors?.["propertyDetails.propertyType"]
                    ? "border-red-500"
                    : ""
                }
              >
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="townhouse">Townhouse</option>
              </Select>
              {validationResult.errors?.["propertyDetails.propertyType"] && (
                <p className="text-red-500 text-sm">
                  {validationResult.errors["propertyDetails.propertyType"][0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyDetails.bedrooms">Bedrooms</Label>
              <Input
                id="propertyDetails.bedrooms"
                name="propertyDetails.bedrooms"
                type="number"
                value={formData.propertyDetails.bedrooms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    propertyDetails: {
                      ...formData.propertyDetails,
                      bedrooms: parseInt(e.target.value),
                    },
                  })
                }
                className={
                  validationResult.errors?.["propertyDetails.bedrooms"]
                    ? "border-red-500"
                    : ""
                }
              />
              {validationResult.errors?.["propertyDetails.bedrooms"] && (
                <p className="text-red-500 text-sm">
                  {validationResult.errors["propertyDetails.bedrooms"][0]}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="propertyDetails.bathrooms">Bathrooms</Label>
              <Input
                id="propertyDetails.bathrooms"
                name="propertyDetails.bathrooms"
                type="number"
                value={formData.propertyDetails.bathrooms}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    propertyDetails: {
                      ...formData.propertyDetails,
                      bathrooms: parseInt(e.target.value),
                    },
                  })
                }
                className={
                  validationResult.errors?.["propertyDetails.bathrooms"]
                    ? "border-red-500"
                    : ""
                }
              />
              {validationResult.errors?.["propertyDetails.bathrooms"] && (
                <p className="text-red-500 text-sm">
                  {validationResult.errors["propertyDetails.bathrooms"][0]}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-6">
          <Button type="button" variant="outline" onClick={handleValidate}>
            Validate Only
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </form>

      {!validationResult.valid && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="text-lg font-medium text-red-800">
            Validation Errors
          </h3>
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {Object.entries(validationResult.errors).map(
              ([field, messages]) => (
                <li key={field} className="text-sm text-red-700">
                  <strong>{field}:</strong> {messages[0]}
                </li>
              ),
            )}
          </ul>
        </div>
      )}

      {submitResult && (
        <div
          className={`mt-6 p-4 ${submitResult.success ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border rounded-md`}
        >
          <h3
            className={`text-lg font-medium ${submitResult.success ? "text-green-800" : "text-red-800"}`}
          >
            {submitResult.success ? "Success!" : "Error"}
          </h3>
          <p
            className={`mt-2 text-sm ${submitResult.success ? "text-green-700" : "text-red-700"}`}
          >
            {submitResult.success
              ? `Beneficiary created successfully with ID: ${submitResult.data?.id}`
              : submitResult.message}
          </p>
          {submitResult.validationErrors && (
            <ul className="mt-2 list-disc pl-5 space-y-1">
              {Object.entries(submitResult.validationErrors).map(
                ([field, messages]) => (
                  <li key={field} className="text-sm text-red-700">
                    <strong>{field}:</strong> {messages[0]}
                  </li>
                ),
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
