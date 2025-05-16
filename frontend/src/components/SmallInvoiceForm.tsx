/* eslint-disable @typescript-eslint/no-explicit-any */

import { useState, useRef } from "react";
import { BrowserProvider, ethers } from "ethers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUp, DollarSign, Calendar, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Invoice1155 from '@/abi/Invoice1155.json';
import strict from "assert/strict";
// import Invoice1155 from "./artifacts/contracts/Invoice1155.sol/Invoice1155.json";


interface SmallInvoiceFormProps {
  user: {
    fullName: string;
    
  };

  // walletAddress:{
  //   WalletAd: string;
  // }

  // walletType:{
  //   Addr: string;
  // };
}

const SmallInvoiceForm = ({ user }: SmallInvoiceFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    toAddress: "",
    yieldInterest: "",
    realName: user.fullName || "",
    // demoWallet: walletType.Addr || "",
    invoiceAmount: "",
    duration: "30",
    description: "",
    file: null as File | null,
    invoiceNumber: "",
    dueDate: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Invalid file type. Only PDF, JPG, and PNG are allowed.");
      return;
    }

    setFormData((prev) => ({ ...prev, file }));

    if (file.type.includes("image")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl("/placeholder.svg"); // Placeholder for PDFs
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required.";
    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = "Invoice number is required.";
    if (!formData.toAddress.trim()) newErrors.toAddress = "Please enter valid address for minting";
    if (!formData.yieldInterest.trim()) newErrors.yieldInterest = "Yield Interest is required.";
    if (!formData.invoiceAmount.trim()) newErrors.invoiceAmount = "Invoice amount is required.";
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required.";
    } else if (new Date(formData.dueDate) <= new Date()) {
      newErrors.dueDate = "Due date must be in the future.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const CONTRACT_ADDRESS = "0x27224c64D8060E3e60355d8003D5E735CA218A32";

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setIsSubmitting(true);

  //   if (!validateForm()) {
  //     toast.error("Please fix the errors before submitting.");
  //     setIsSubmitting(false);
  //     return;
  //   }

  //   try {
  //     const form = new FormData();
  //     form.append("title", formData.title.trim());
  //     form.append("realName", formData.realName.trim());
  //     form.append("invoiceAmount", formData.invoiceAmount.trim());
  //     form.append("duration", formData.duration);
  //     form.append("description", formData.description.trim());
  //     form.append("invoiceNumber", formData.invoiceNumber.trim());
  //     form.append("dueDate", formData.dueDate);

  //     if (formData.file) {
  //       form.append("file", formData.file);
  //     }

  //     const res = await fetch("http://localhost:5000/api/pins/upload", {
  //       method: "POST",
  //       body: form,
  //     });

  //     if (!res.ok) {
  //       const errorText = await res.text();
  //       throw new Error(errorText || "Upload failed");
  //     }

  //     toast.success("Invoice submitted successfully!");

  //     // Reset form
  //     setFormData({
  //       title: "",
  //       realName: user.fullName || "",
  //       invoiceAmount: "",
  //       duration: "30",
  //       description: "",
  //       file: null,
  //       invoiceNumber: "",
  //       dueDate: "",
  //     });
  //     setPreviewUrl("");

  //     if (fileInputRef.current) {
  //       fileInputRef.current.value = "";
  //     }
  //   } catch (error) {
  //     console.error(error);
  //     toast.error("Submission failed. Try again.");
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  if (!validateForm()) {
    toast.error("Please fix the errors before submitting.");
    setIsSubmitting(false);
    return;
  }

  try {
    const form = new FormData();
    form.append("title", formData.title.trim());
    form.append("WalletAddress", formData.toAddress.trim());
    form.append("yieldInterest", formData.yieldInterest.trim());
    form.append("realName", formData.realName.trim());
    form.append("invoiceAmount", formData.invoiceAmount.trim());
    form.append("duration", formData.duration);
    form.append("description", formData.description.trim());
    form.append("invoiceNumber", formData.invoiceNumber.trim());
    form.append("dueDate", formData.dueDate);

    if (formData.file) {
      form.append("file", formData.file);
    }
    

    // 🚀 Send to new backend endpoint (combined Pinata + Mongo + Minting)
    const res = await fetch("http://localhost:5000/api/invoice/mint", {
    
      method: "POST",
      body: form,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Minting failed");
    }

    const { txHash, explorerUrl, metadataUrl } = await res.json();

    toast.success("Invoice NFT minted successfully!");

    console.log("Transaction Hash:", txHash);
    console.log("Explorer URL:", explorerUrl);
    console.log("Metadata URL:", metadataUrl);

    // Reset form as before
    setFormData({
      title: "",
      toAddress: "",
      yieldInterest: "",
      realName: user.fullName || "",
      invoiceAmount: "",
      duration: "30",
      description: "",
      file: null,
      invoiceNumber: "",
      dueDate: "",
    });
    setPreviewUrl("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  } catch (error: any) {
    console.error("Submission Error:", error);
    toast.error(error.message || "Submission failed. Try again.");
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-fundora-cyan">Quick Invoice Creation and Minting</h2>
        <p className="text-gray-300 text-sm">Mint a new invoice for investors to fund</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title" className="text-white">Invoice Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="bg-white/10 text-white"
            placeholder="Project Invoice"
          />
          {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
        </div>

        <div>
          <Label htmlFor="invoiceNumber" className="text-white">Invoice Number</Label>
          <Input
            id="invoiceNumber"
            name="invoiceNumber"
            value={formData.invoiceNumber}
            onChange={handleInputChange}
            className="bg-white/10 text-white"
            placeholder="INV-2025-001"
          />
          {errors.invoiceNumber && <p className="text-red-500 text-sm">{errors.invoiceNumber}</p>}
        </div>

        <div>
          <Label htmlFor="toAddress" className="text-white">Wallet Address</Label>
          <Input
            id="toAddress"
            name="toAddress"
            value={formData.toAddress}
            onChange={handleInputChange}
            className="bg-white/10 text-white"
            placeholder="0xffXfhi9dfiJ75jkkajksfk75hksd8"
          />
          {errors.toAddress && <p className="text-red-500 text-sm">{errors.toAddress}</p>}
        </div>

         <div>
          <Label htmlFor="yieldInterest" className="text-white">Enter Yield Interest</Label>
          <Input
            id="yieldInterest"
            name="yieldInterest"
            value={formData.yieldInterest}
            onChange={handleInputChange}
            className="bg-white/10 text-white"
            placeholder="Please add interest rate that your're offering on this NFT in %"
          />
          {errors.yieldInterest && <p className="text-red-500 text-sm">{errors.yieldInterest}</p>}
        </div>

      </div>

       

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <Label htmlFor="invoiceAmount" className="text-white">Invoice Amount (USD)</Label>
          <DollarSign className="absolute left-3 top-9 text-gray-400 h-4 w-4" />
          <Input
            id="invoiceAmount"
            name="invoiceAmount"
            value={formData.invoiceAmount}
            onChange={handleInputChange}
            className="bg-white/10 text-white pl-10"
            placeholder="e.g. 1000"
          />
          {errors.invoiceAmount && <p className="text-red-500 text-sm">{errors.invoiceAmount}</p>}
        </div>

        <div className="relative">
          <Label htmlFor="dueDate" className="text-white">Due Date</Label>
          <Calendar className="absolute left-3 top-9 text-gray-400 h-4 w-4" />
          <Input
            id="dueDate"
            name="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={handleInputChange}
            className="bg-white/10 text-white pl-10"
          />
          {errors.dueDate && <p className="text-red-500 text-sm">{errors.dueDate}</p>}
        </div>
      </div>

      <div>
        <Label htmlFor="duration" className="text-white">Duration</Label>
        <Select
          value={formData.duration}
          onValueChange={(value) => handleSelectChange("duration", value)}
        >
          <SelectTrigger className="bg-white/10 text-white border-fundora-blue/30">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            {["7", "14", "30", "60", "90"].map((d) => (
              <SelectItem key={d} value={d}>{`${d} days`}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="file" className="text-white">Upload Invoice (PDF/Image)</Label>
        <div className="relative">
          <Input
            id="file"
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            ref={fileInputRef}
            className="bg-white/10 text-white cursor-pointer"
            onChange={handleFileChange}
          />
          <Upload className="absolute right-3 top-9 text-gray-400 h-4 w-4 pointer-events-none" />
        </div>
        {previewUrl && (
          <div className="mt-2">
            <p className="text-xs text-gray-300">File preview:</p>
            <img src={previewUrl} alt="Preview" className="max-h-24 rounded" />
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="text-white">Description (Optional)</Label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className="bg-white/10 text-white"
          placeholder="Add any notes about the invoice..."
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit and Mint Invoice"}
      </Button>
    </form>
  );
};

export default SmallInvoiceForm;
