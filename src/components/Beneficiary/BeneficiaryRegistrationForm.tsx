import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { beneficiaryService } from "@/services/beneficiaryService";
import { clientApi } from "@/lib/api/client/clientApi";
import { ClientType } from "@/lib/api/client/types";
import { clientConfigService } from "@/services/clientConfigService";
import { ClientTypeIndicator } from "./ClientTypeIndicator";
import {
  TextInput,
  DatePicker,
  SelectField,
  NumberInput,
  FormattedInput,
  ReadOnlyField,
} from "../ui/form-components";

// Types
interface Address {
  emirate: string;
  area: string;
  street: string;
  buildingVilla: string;
  gpsCoordinates: string;
}

interface PropertyDetails {
  propertyType: string;
  ownership: string;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  yearOfConstruction: number;
}

interface BeneficiaryData {
  beneficiaryId: string;
  registrationDate: Date;
  emiratesId: string;
  fullNameEn: string;
  fullNameAr: string;
  dateOfBirth: Date | null;
  gender: string;
  contactNumber: string;
  secondaryContactNumber: string;
  address: Address;
  propertyDetails: PropertyDetails;
  clientTypeId: number; // FDF, ADHA, or Cash-Based
}

// Helper function to generate beneficiary ID
const generateBeneficiaryId = (): string => {
  const year = new Date().getFullYear();
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `BEN-${year}-${randomNum}`;
};

// Client type specific fields components
const FDFSpecificFields: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 bg-blue-50 p-4 rounded-md">
      <h3 className="text-lg font-medium">
        {t("beneficiary.fdfSpecificInfo")}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("beneficiary.socialSecurityNumber")}
          </label>
          <Input type="text" placeholder="XXX-XX-XXXX" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("beneficiary.socialEvaluationDate")}
          </label>
          <Input type="date" />
        </div>
      </div>
    </div>
  );
};

const ADHASpecificFields: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 bg-green-50 p-4 rounded-md">
      <h3 className="text-lg font-medium">
        {t("beneficiary.adhaSpecificInfo")}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("beneficiary.propertyOwnershipNumber")}
          </label>
          <Input type="text" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("beneficiary.adhaApplicationNumber")}
          </label>
          <Input type="text" />
        </div>
      </div>
    </div>
  );
};

const CashBasedFields: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 bg-yellow-50 p-4 rounded-md">
      <h3 className="text-lg font-medium">{t("beneficiary.cashBasedInfo")}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("beneficiary.paymentMethod")}
          </label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder={t("beneficiary.selectPaymentMethod")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="credit_card">
                {t("beneficiary.creditCard")}
              </SelectItem>
              <SelectItem value="bank_transfer">
                {t("beneficiary.bankTransfer")}
              </SelectItem>
              <SelectItem value="cash">{t("beneficiary.cash")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {t("beneficiary.invoicePreference")}
          </label>
          <Select>
            <SelectTrigger>
              <SelectValue
                placeholder={t("beneficiary.selectInvoicePreference")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="email">{t("beneficiary.email")}</SelectItem>
              <SelectItem value="print">{t("beneficiary.print")}</SelectItem>
              <SelectItem value="both">{t("beneficiary.both")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

// Form container component
const FormContainer: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <div className="space-y-8 bg-white p-6 rounded-lg shadow-md">
      {children}
    </div>
  );
};

// Form header component
const FormHeader: React.FC<{ title: string; arabicTitle: string }> = ({
  title,
  arabicTitle,
}) => {
  const { t } = useTranslation();
  const { isRTL } = useTranslatedDirection();

  return (
    <div className="border-b pb-4 mb-6">
      <h2 className="text-2xl font-bold">{isRTL ? arabicTitle : title}</h2>
      <p className="text-gray-500">
        {t("beneficiary.registrationDescription")}
      </p>
    </div>
  );
};

// Form section component
const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">{t(title)}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
};

// Form actions component
const FormActions: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div className="flex justify-end space-x-4 pt-6">{children}</div>;
};

// Main BeneficiaryRegistrationForm component
export const BeneficiaryRegistrationForm: React.FC = () => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();

  // State for available client types
  const [clientTypes, setClientTypes] = useState<ClientType[]>([]);
  const [loadingClientTypes, setLoadingClientTypes] = useState(false);

  // Form state management with React Hooks
  const [formData, setFormData] = useState<BeneficiaryData>({
    beneficiaryId: generateBeneficiaryId(),
    registrationDate: new Date(),
    emiratesId: "",
    fullNameEn: "",
    fullNameAr: "",
    dateOfBirth: null,
    gender: "",
    contactNumber: "",
    secondaryContactNumber: "",
    address: {
      emirate: "",
      area: "",
      street: "",
      buildingVilla: "",
      gpsCoordinates: "",
    },
    propertyDetails: {
      propertyType: "",
      ownership: "",
      bedrooms: 0,
      bathrooms: 0,
      floors: 0,
      yearOfConstruction: 0,
    },
    clientTypeId: 0,
  });

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch client types on component mount
  useEffect(() => {
    const fetchClientTypes = async () => {
      setLoadingClientTypes(true);
      try {
        const response = await clientApi.getClientTypes();
        if (
          response.success &&
          response.data &&
          response.data.items.length > 0
        ) {
          setClientTypes(response.data.items);
        } else {
          // Fallback to default client types if API fails
          setClientTypes([
            {
              clientTypeId: 1,
              typeCode: "FDF",
              typeNameEN: "Family Development Foundation",
              typeNameAR: "مؤسسة تنمية الأسرة",
              description:
                "Clients supported by the Family Development Foundation program",
              isActive: true,
              createdBy: 1,
              createdDate: new Date(),
            },
            {
              clientTypeId: 2,
              typeCode: "ADHA",
              typeNameEN: "Abu Dhabi Housing Authority",
              typeNameAR: "هيئة أبوظبي للإسكان",
              description:
                "Clients supported by the Abu Dhabi Housing Authority program",
              isActive: true,
              createdBy: 1,
              createdDate: new Date(),
            },
            {
              clientTypeId: 3,
              typeCode: "CASH",
              typeNameEN: "Cash-Based Client",
              typeNameAR: "عميل نقدي",
              description: "Clients paying for services directly",
              isActive: true,
              createdBy: 1,
              createdDate: new Date(),
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching client types:", error);
      } finally {
        setLoadingClientTypes(false);
      }
    };

    fetchClientTypes();
  }, []);

  // Update client config service when client type changes
  useEffect(() => {
    if (formData.clientTypeId > 0) {
      clientConfigService.setActiveClientType(formData.clientTypeId);
    }
  }, [formData.clientTypeId]);

  // Client type specific fields display logic
  const renderClientTypeFields = (clientTypeId: number) => {
    // Find the client type by ID
    const clientType = clientTypes.find(
      (ct) => ct.clientTypeId === clientTypeId,
    );

    if (!clientType) return null;

    // Render specific fields based on client type code
    switch (clientType.typeCode) {
      case "FDF":
        return <FDFSpecificFields />;
      case "ADHA":
        return <ADHASpecificFields />;
      case "CASH":
        return <CashBasedFields />;
      default:
        // For any other client type, show a generic form
        return (
          <div className="space-y-4 bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium">
              {t(
                "beneficiary.clientSpecificInfo",
                "Client Specific Information",
              )}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("beneficiary.referenceNumber", "Reference Number")}
                </label>
                <Input type="text" placeholder="Reference #" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {t("beneficiary.registrationDate", "Registration Date")}
                </label>
                <Input type="date" />
              </div>
            </div>
          </div>
        );
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Emirates ID format validation (XXX-XXXX-XXXXXXX-X)
    const emiratesIdRegex = /^\d{3}-\d{4}-\d{7}-\d{1}$/;
    if (!formData.emiratesId) {
      newErrors.emiratesId = t("common.validation.required");
    } else if (!emiratesIdRegex.test(formData.emiratesId)) {
      newErrors.emiratesId = t("beneficiary.validation.invalidEmiratesId");
    }

    // Age validation (≥60)
    if (formData.dateOfBirth) {
      const today = new Date();
      const birthDate = new Date(formData.dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      if (age < 60) {
        newErrors.dateOfBirth = t("beneficiary.validation.minimumAge");
      }
    } else {
      newErrors.dateOfBirth = t("common.validation.required");
    }

    // Phone validation (UAE format)
    const phoneRegex = /^05\d-\d{3}-\d{4}$/;
    if (!formData.contactNumber) {
      newErrors.contactNumber = t("common.validation.required");
    } else if (!phoneRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = t("beneficiary.validation.invalidPhoneFormat");
    }

    // Required fields validation
    if (!formData.fullNameEn)
      newErrors.fullNameEn = t("common.validation.required");
    if (!formData.fullNameAr)
      newErrors.fullNameAr = t("common.validation.required");
    if (!formData.gender) newErrors.gender = t("common.validation.required");
    if (!formData.address.emirate)
      newErrors["address.emirate"] = t("common.validation.required");
    if (!formData.clientTypeId)
      newErrors.clientTypeId = t("common.validation.required");

    // Property details validation
    if (
      formData.propertyDetails.yearOfConstruction > new Date().getFullYear()
    ) {
      newErrors["propertyDetails.yearOfConstruction"] = t(
        "beneficiary.validation.invalidYear",
      );
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submission handler
  const handleSubmit = async () => {
    if (!validateForm()) {
      // Show error message
      console.error("Form validation failed");
      return;
    }

    try {
      // Convert form data to API request format
      const beneficiaryRequest = {
        emiratesId: formData.emiratesId,
        fullNameEn: formData.fullNameEn,
        fullNameAr: formData.fullNameAr,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        contactNumber: formData.contactNumber,
        secondaryContactNumber: formData.secondaryContactNumber,
        address: formData.address,
        propertyDetails: formData.propertyDetails,
        clientTypeId: formData.clientTypeId,
      };

      // Set the active client type in the client config service
      clientConfigService.setActiveClientType(formData.clientTypeId);

      // Call the beneficiary service to create a new beneficiary
      const { success, data, message } =
        await beneficiaryService.createBeneficiary(beneficiaryRequest);

      if (success && data) {
        console.log("Beneficiary created successfully:", data.beneficiaryId);
        console.log("Client type set to:", formData.clientTypeId);

        // Get client configuration for the selected client type
        const clientConfig = clientConfigService.getClientConfig(
          formData.clientTypeId,
        );
        console.log("Applied client configuration:", clientConfig);

        // Show success message
        alert(t("beneficiary.successMessage"));

        // Reset form or redirect to beneficiary profile
        // window.location.href = `/beneficiaries/${data.beneficiaryId}`;
      } else {
        console.error("Failed to create beneficiary:", message);
        alert(t("beneficiary.errorMessage"));
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(t("common.errorOccurred"));
    }
  };

  return (
    <FormContainer>
      <FormHeader
        title="Beneficiary Registration"
        arabicTitle="تسجيل المستفيد"
      />

      <div className={`${directionClass} w-full`}>
        <FormSection title="beneficiary.personalInformation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <TextInput
                label={t("beneficiary.fullNameEn")}
                arabicLabel={t("beneficiary.fullNameEn")}
                value={formData.fullNameEn}
                onChange={(value) =>
                  setFormData({ ...formData, fullNameEn: value })
                }
                required={true}
                error={errors.fullNameEn}
              />
            </div>

            <div className="space-y-2">
              <TextInput
                label={t("beneficiary.fullNameAr")}
                arabicLabel={t("beneficiary.fullNameAr")}
                value={formData.fullNameAr}
                onChange={(value) =>
                  setFormData({ ...formData, fullNameAr: value })
                }
                required={true}
                error={errors.fullNameAr}
              />
            </div>

            <div className="space-y-2">
              <FormattedInput
                label={t("beneficiary.emiratesId")}
                arabicLabel={t("beneficiary.emiratesId")}
                value={formData.emiratesId}
                onChange={(value) =>
                  setFormData({ ...formData, emiratesId: value })
                }
                format="XXX-XXXX-XXXXXXX-X"
                required={true}
                error={errors.emiratesId}
              />
            </div>

            <div className="space-y-2">
              <DatePicker
                label={t("beneficiary.dateOfBirth")}
                arabicLabel={t("beneficiary.dateOfBirth")}
                value={formData.dateOfBirth}
                onChange={(value) =>
                  setFormData({ ...formData, dateOfBirth: value })
                }
                required={true}
                error={errors.dateOfBirth}
                maxDate={
                  new Date(
                    new Date().setFullYear(new Date().getFullYear() - 60),
                  )
                }
              />
            </div>

            <div className="space-y-2">
              <SelectField
                label={t("beneficiary.gender")}
                arabicLabel={t("beneficiary.gender")}
                value={formData.gender}
                onChange={(value) =>
                  setFormData({ ...formData, gender: value })
                }
                options={[
                  { value: "male", label: t("beneficiary.male") },
                  { value: "female", label: t("beneficiary.female") },
                ]}
                required={true}
                error={errors.gender}
                placeholder={t("beneficiary.selectGender")}
              />
            </div>

            <div className="space-y-2">
              <FormattedInput
                label={t("beneficiary.contactNumber")}
                arabicLabel={t("beneficiary.contactNumber")}
                value={formData.contactNumber}
                onChange={(value) =>
                  setFormData({ ...formData, contactNumber: value })
                }
                format="05X-XXX-XXXX"
                required={true}
                error={errors.contactNumber}
              />
            </div>

            <div className="space-y-2">
              <FormattedInput
                label={t("beneficiary.secondaryContactNumber")}
                arabicLabel={t("beneficiary.secondaryContactNumber")}
                value={formData.secondaryContactNumber}
                onChange={(value) =>
                  setFormData({ ...formData, secondaryContactNumber: value })
                }
                format="05X-XXX-XXXX"
                required={false}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="beneficiary.addressInformation">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <SelectField
                label={t("beneficiary.emirate")}
                arabicLabel={t("beneficiary.emirate")}
                value={formData.address.emirate}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, emirate: value },
                  })
                }
                options={[
                  {
                    value: "abudhabi",
                    label: t("beneficiary.emirates.abudhabi"),
                  },
                  { value: "dubai", label: t("beneficiary.emirates.dubai") },
                  {
                    value: "sharjah",
                    label: t("beneficiary.emirates.sharjah"),
                  },
                  { value: "ajman", label: t("beneficiary.emirates.ajman") },
                  {
                    value: "ummalquwain",
                    label: t("beneficiary.emirates.ummalquwain"),
                  },
                  {
                    value: "fujairah",
                    label: t("beneficiary.emirates.fujairah"),
                  },
                  {
                    value: "rasalkhaimah",
                    label: t("beneficiary.emirates.rasalkhaimah"),
                  },
                ]}
                required={true}
                error={errors["address.emirate"]}
                placeholder={t("beneficiary.selectEmirate")}
              />
            </div>

            <div className="space-y-2">
              <TextInput
                label={t("beneficiary.area")}
                arabicLabel={t("beneficiary.area")}
                value={formData.address.area}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, area: value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <TextInput
                label={t("beneficiary.street")}
                arabicLabel={t("beneficiary.street")}
                value={formData.address.street}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, street: value },
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <TextInput
                label={t("beneficiary.buildingVilla")}
                arabicLabel={t("beneficiary.buildingVilla")}
                value={formData.address.buildingVilla}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    address: {
                      ...formData.address,
                      buildingVilla: value,
                    },
                  })
                }
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="beneficiary.propertyDetails">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <SelectField
                label={t("beneficiary.propertyType")}
                arabicLabel={t("beneficiary.propertyType")}
                value={formData.propertyDetails.propertyType}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    propertyDetails: {
                      ...formData.propertyDetails,
                      propertyType: value,
                    },
                  })
                }
                options={[
                  {
                    value: "villa",
                    label: t("beneficiary.propertyTypes.villa"),
                  },
                  {
                    value: "apartment",
                    label: t("beneficiary.propertyTypes.apartment"),
                  },
                  {
                    value: "townhouse",
                    label: t("beneficiary.propertyTypes.townhouse"),
                  },
                ]}
                placeholder={t("beneficiary.selectPropertyType")}
              />
            </div>

            <div className="space-y-2">
              <SelectField
                label={t("beneficiary.ownership")}
                arabicLabel={t("beneficiary.ownership")}
                value={formData.propertyDetails.ownership}
                onChange={(value) =>
                  setFormData({
                    ...formData,
                    propertyDetails: {
                      ...formData.propertyDetails,
                      ownership: value,
                    },
                  })
                }
                options={[
                  {
                    value: "owned",
                    label: t("beneficiary.ownershipTypes.owned"),
                  },
                  {
                    value: "rented",
                    label: t("beneficiary.ownershipTypes.rented"),
                  },
                  {
                    value: "family",
                    label: t("beneficiary.ownershipTypes.family"),
                  },
                ]}
                placeholder={t("beneficiary.selectOwnership")}
              />
            </div>
          </div>
        </FormSection>

        <FormSection title="beneficiary.clientType">
          <div className="space-y-4">
            <div className="space-y-2">
              <SelectField
                label={t("beneficiary.clientType")}
                arabicLabel={t("beneficiary.clientType")}
                value={formData.clientTypeId.toString()}
                onChange={(value) => {
                  const clientTypeId = parseInt(value);
                  setFormData({ ...formData, clientTypeId });
                }}
                options={clientTypes.map((ct) => ({
                  value: ct.clientTypeId.toString(),
                  label: t(ct.typeNameEN) || ct.typeNameEN,
                }))}
                required={true}
                error={errors.clientTypeId}
                placeholder={t("beneficiary.selectClientType")}
                disabled={loadingClientTypes}
              />
              {loadingClientTypes && (
                <div className="text-sm text-muted-foreground">
                  {t("common.loading", "Loading client types...")}
                </div>
              )}
            </div>

            {formData.clientTypeId > 0 && (
              <div className="p-4 border rounded-md bg-muted/20">
                <div className="flex items-center gap-2 mb-2">
                  <ClientTypeIndicator
                    clientTypeId={formData.clientTypeId}
                    showLabel={true}
                  />
                  <span className="text-sm font-medium">
                    {t(
                      "beneficiary.selectedClientType",
                      "Selected Client Type",
                    )}
                    :
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "beneficiary.clientTypeDescription",
                    "This selection determines which client management, price management, and supplier management applies to this senior citizen.",
                  )}
                </p>
              </div>
            )}

            {/* Client type specific fields */}
            {renderClientTypeFields(formData.clientTypeId)}
          </div>
        </FormSection>

        <FormActions>
          <Button variant="outline" type="button">
            {t("common.buttons.cancel")}
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {t("common.buttons.submit")}
          </Button>
        </FormActions>
      </div>
    </FormContainer>
  );
};

export default BeneficiaryRegistrationForm;
